import {
	HttpException,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
	UnprocessableEntityException,
} from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { DataSource, Repository } from "typeorm"
import type {
	AdminMessageResult,
	EwalletHistoryDetail,
	EwalletHistoryRow,
	EwalletOwnerType,
	EwalletTransactionDetail,
	EwalletTransactionKind,
	EwalletTransactionStatus,
	ServerTableResult,
} from "@roja/types"

import { StorageService } from "@core/storage/storage.service"
import { toAmount } from "@shared/billing/invoice-calculator"
import { EWALLET_MERCHANT_TYPE, EWALLET_STUDENT_TYPE, lockWallet, syncBalance, walletsAffectedBy } from "@shared/ewallet/balance"
import type {
	EwalletHistoryExportFilter,
	EwalletHistoryFilter,
	EwalletTransactionUpdateInput,
} from "@admin/ewallet/dto/ewallet-txn.dto"
import { buildHistoryWorkbook, type ExportItem, type ExportRow } from "@admin/ewallet/txn-export"
import {
	dateSuffix,
	dateTimeJam,
	dateTimeLong,
	statusSuffix,
	typeSuffix,
} from "@admin/ewallet/txn-format"
import { SqlParams } from "@admin/common/sql"
import * as sql from "@admin/ewallet/txn-sql"
import { EwalletTransactionItem } from "@ewallet/entities/ewallet-transaction-item.entity"
import { EwalletTransaction } from "@ewallet/entities/ewallet-transaction.entity"

// Legacy Dompet: transaction detail, status update and Riwayat Transaksi (workstream D-C).

export type EwalletHistoryFile = { fileName: string; buffer: Buffer }

type DetailSqlRow = {
	id: string
	code: string | null
	name: string | null
	type: EwalletTransactionKind
	status: EwalletTransactionStatus
	paymentMethod: string | null
	amount: string | null
	transferNewsNumber: number | null
	createdAt: string | null
	paymentDate: string | null
	paymentNote: string | null
	invalidNote: string | null
	paymentOnBehalfOf: string | null
	paymentAttachment: string | null
	ewalletId: string
	uniqueId: string | null
	ownerType: string | null
	ownerId: string | null
	snapshotName: string | null
}

type HistoryListSqlRow = {
	id: string
	code: string | null
	type: EwalletTransactionKind
	paymentMethod: string | null
	totalAmount: string | null
	createdAt: string | null
	createdAtTs: string
	status: EwalletTransactionStatus
}

type HistoryDetailSqlRow = {
	id: string
	code: string | null
	type: EwalletTransactionKind
	status: EwalletTransactionStatus
	paymentMethod: string | null
	createdAt: string | null
	totalAmount: string | null
	walletUniqueId: string | null
	ownerType: string | null
	ownerId: string | null
	studentUniqueId: string | null
	studentName: string | null
}

const UPDATE_SUCCESS = "Status transaksi berhasil diubah"
const UPDATE_FAILED = "Status transaksi gagal diubah"
const NOT_FOUND = "Data transaksi tidak ditemukan."
const CASH_LOCKED = "Transaksi tunai yang sudah berhasil tidak dapat diubah statusnya."
const XLSX_LABEL = "Laporan Riwayat Transaksi"

const ownerTypeOf = (type: string | null): EwalletOwnerType | null => {
	if (type === EWALLET_STUDENT_TYPE) return "santri"
	if (type === EWALLET_MERCHANT_TYPE) return "merchant"
	return null
}

/** A valid Cash top-up or withdrawal is final (decision taken for this port). */
const isEditable = (paymentMethod: string | null, status: string): boolean =>
	!(paymentMethod === "Cash" && status === "valid")

@Injectable()
export class EwalletTxnService {
	private readonly logger = new Logger(EwalletTxnService.name)

	constructor(
		private readonly dataSource: DataSource,
		private readonly storageService: StorageService,
		@InjectRepository(EwalletTransactionItem) private readonly transactionItems: Repository<EwalletTransactionItem>,
	) {}

	/**
	 * `EwalletController@transactionDetail`. Legacy handed the view a null for a wallet whose owner
	 * is neither santri nor merchant (a blank page) and crashed on one with no wallet; both are a
	 * 404 here.
	 */
	async findOne(transactionId: number): Promise<EwalletTransactionDetail> {
		const rows = await this.dataSource.query<DetailSqlRow[]>(sql.TRANSACTION_DETAIL_SQL, [transactionId])
		const row = rows[0]
		const ownerType = row ? ownerTypeOf(row.ownerType) : null
		if (!row || !ownerType) throw new NotFoundException(NOT_FOUND)

		const { requesterName, recipientName } = await this.names(row, ownerType)
		const proof = row.paymentAttachment ? await this.storageService.getUrl(row.paymentAttachment) : null

		return {
			id: Number(row.id),
			code: row.code,
			name: row.name,
			type: row.type,
			status: row.status,
			paymentMethod: row.paymentMethod,
			// `EwalletTransaction::getTotalAmountAttribute` — the unique transfer code is part of the payment
			totalAmount: toAmount(row.amount) + (row.transferNewsNumber ?? 0),
			transferNewsNumber: row.transferNewsNumber,
			createdAt: dateTimeJam(row.createdAt) ?? "",
			paymentDate: dateTimeJam(row.paymentDate),
			paymentNote: row.paymentNote,
			invalidNote: row.invalidNote,
			paymentOnBehalfOf: row.paymentOnBehalfOf,
			paymentAttachmentUrl: proof,
			ewallet: { id: Number(row.ewalletId), uniqueId: row.uniqueId, ownerType },
			requesterName,
			recipientName,
			editable: isEditable(row.paymentMethod, row.status),
		}
	}

	/**
	 * `EwalletController@transactionUpdate`.
	 *
	 * Fixed against legacy (all approved): the whole update runs in one transaction that locks every
	 * wallet the row moves — for a purchase the merchant's **and** the santri's, ascending so two
	 * updates cannot deadlock — and refreshes the stored balance of **all** of them, where legacy
	 * refreshed only the transaction's own wallet; and a valid Cash row is final.
	 */
	async update(transactionId: number, input: EwalletTransactionUpdateInput): Promise<AdminMessageResult> {
		try {
			await this.dataSource.transaction(async (manager) => {
				const wallets = (await walletsAffectedBy(manager, transactionId)).sort((a, b) => a - b)
				for (const walletId of wallets) await lockWallet(manager, walletId)

				const rows = await manager.query<Array<{ id: string; paymentMethod: string | null; status: string }>>(
					sql.TRANSACTION_FOR_UPDATE_SQL,
					[transactionId],
				)
				const current = rows[0]
				if (!current) throw new NotFoundException(NOT_FOUND)
				if (!isEditable(current.paymentMethod, current.status)) throw new UnprocessableEntityException(CASH_LOCKED)

				// `invalid_note` is only kept for `invalid`; legacy wrote whatever arrived
				const note = input.status === "invalid" ? (input.invalidNote ?? null) : null
				await manager.update(EwalletTransaction, { id: transactionId }, { status: input.status, invalidNote: note })
				for (const walletId of wallets) await syncBalance(manager, walletId)
			})
			return { message: UPDATE_SUCCESS }
		} catch (error) {
			if (error instanceof HttpException) throw error
			this.logger.error(`transactionUpdate ${transactionId}: ${error instanceof Error ? error.message : String(error)}`)
			throw new InternalServerErrorException(UPDATE_FAILED)
		}
	}

	/** `EwalletTransactionHistoryController@list` — server-side, `created_at` descending by default. */
	async findHistory(query: EwalletHistoryFilter): Promise<ServerTableResult<EwalletHistoryRow>> {
		const orderBy = query.orderBy ?? sql.HISTORY_DEFAULT_SORT.orderBy
		const orderDir = (query.orderDir ?? sql.HISTORY_DEFAULT_SORT.orderDir).toUpperCase()

		const filterParams = new SqlParams()
		const filterWhere = sql.historyWhere(query, filterParams, false)

		const pageParams = new SqlParams()
		const pageWhere = sql.historyWhere(query, pageParams, false)
		const limitExpr = pageParams.add(query.limit)
		const offsetExpr = pageParams.add((query.page - 1) * query.limit)

		const [totals, filtered, rows] = await Promise.all([
			this.dataSource.query<Array<{ total: number }>>(sql.HISTORY_TOTAL_SQL),
			this.dataSource.query<Array<{ total: number }>>(sql.historyCountSql(filterWhere), filterParams.values),
			this.dataSource.query<HistoryListSqlRow[]>(
				sql.historyListSql(pageWhere, sql.HISTORY_SORT_SQL[orderBy], orderDir, limitExpr, offsetExpr),
				pageParams.values,
			),
		])

		return {
			rows: rows.map((row) => ({
				id: Number(row.id),
				code: row.code,
				type: row.type,
				paymentMethod: row.paymentMethod,
				totalAmount: toAmount(row.totalAmount),
				createdAt: dateTimeLong(row.createdAt),
				createdAtTs: Number(row.createdAtTs),
				status: row.status,
				// `_partials/actions.blade.php` — the link exists only for a valid row
				target: row.status !== "valid" ? "none" : row.type === "purchase" ? "history" : "transaction",
			})),
			recordsTotal: totals[0]?.total ?? 0,
			recordsFiltered: filtered[0]?.total ?? 0,
		}
	}

	/** `EwalletTransactionHistoryController@detail` — card-user + card-transaction. */
	async findHistoryDetail(transactionId: number): Promise<EwalletHistoryDetail> {
		const rows = await this.dataSource.query<HistoryDetailSqlRow[]>(sql.HISTORY_DETAIL_SQL, [transactionId])
		const row = rows[0]
		if (!row) throw new NotFoundException(NOT_FOUND)

		const items = await this.transactionItems.find({
			select: { description: true, price: true },
			where: { ewalletTransactionId: String(transactionId) },
			order: { id: "ASC" },
		})
		// `ewalletable->merchant_name` — a santri wallet has no such attribute, so it reads "-"
		const merchants =
			row.ownerType === EWALLET_MERCHANT_TYPE && row.ownerId
				? await this.dataSource.query<Array<{ name: string | null }>>(sql.MERCHANT_LABEL_SQL, [row.ownerId])
				: []

		return {
			id: Number(row.id),
			code: row.code,
			type: row.type,
			status: row.status,
			paymentMethod: row.paymentMethod,
			createdAt: dateTimeLong(row.createdAt),
			totalAmount: toAmount(row.totalAmount),
			items: items.map((item) => ({ description: item.description ?? "", price: toAmount(item.price) })),
			merchant: { uniqueId: row.walletUniqueId, name: merchants[0]?.name ?? null },
			student: { uniqueId: row.studentUniqueId, name: row.studentName },
		}
	}

	/**
	 * `EwalletTransactionHistoryController@export`. The filters run in SQL (legacy filtered a
	 * collection of every transaction in PHP) and the total is over the rows listed.
	 */
	async exportHistory(filter: EwalletHistoryExportFilter): Promise<EwalletHistoryFile> {
		const params = new SqlParams()
		const where = sql.historyWhere(filter, params, true)

		const [rows, items] = await Promise.all([
			this.dataSource.query<ExportRow[]>(sql.exportRowsSql(where), params.values),
			// Only a purchase has items to lay out; skip the query for the other types
			filter.type === undefined || filter.type === "purchase"
				? this.dataSource.query<ExportItem[]>(sql.exportItemsSql(where), params.values)
				: Promise.resolve<ExportItem[]>([]),
		])

		const suffixes = {
			dateSuffix: dateSuffix(filter.date),
			typeSuffix: typeSuffix(filter.type),
			statusSuffix: statusSuffix(filter.status),
		}
		const buffer = await buildHistoryWorkbook(rows, items, { type: filter.type, ...suffixes })
		return {
			fileName: `${XLSX_LABEL} - ${suffixes.dateSuffix} - ${suffixes.typeSuffix} - ${suffixes.statusSuffix}.xlsx`,
			buffer,
		}
	}

	/** "Dibuat oleh" (a santri's name) and, for a cash withdrawal, "Penerima" (the owner). */
	private async names(
		row: DetailSqlRow,
		ownerType: EwalletOwnerType,
	): Promise<{ requesterName: string | null; recipientName: string | null }> {
		const wantsRecipient = row.paymentMethod === "Cash" && row.type === "expense"
		const wantsRequester = row.paymentMethod === "Bank Transfer (Manual)"
		if (!row.ownerId || (!wantsRecipient && !wantsRequester)) return { requesterName: null, recipientName: null }

		if (ownerType === "merchant") {
			const merchants = await this.dataSource.query<Array<{ name: string | null }>>(sql.MERCHANT_NAME_SQL, [row.ownerId])
			const name = merchants[0]?.name ?? null
			return { requesterName: null, recipientName: wantsRecipient ? name : null }
		}

		const grades = await this.dataSource.query<Array<{ active: string | null; latest: string | null }>>(
			sql.STUDENT_NAMES_SQL,
			[row.ownerId],
		)
		const active = grades[0]?.active ?? null
		const latest = grades[0]?.latest ?? null
		return {
			requesterName: wantsRequester ? (active ?? latest ?? row.snapshotName) : null,
			// `firstwhere('grade_status', 'active')->fullname ?? ewallet_user_name`
			recipientName: wantsRecipient ? (active ?? row.snapshotName) : null,
		}
	}
}
