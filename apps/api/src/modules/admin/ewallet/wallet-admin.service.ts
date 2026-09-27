import { Injectable, NotFoundException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { InjectRepository } from "@nestjs/typeorm"
import { DataSource, Repository } from "typeorm"
import type {
	AdminMessageResult,
	EwalletBadge,
	EwalletDetail,
	EwalletListRow,
	EwalletMerchantOwner,
	EwalletOwner,
	EwalletQrPrint,
	EwalletQrPrintAllRow,
	EwalletSettingPage,
	EwalletStudentOwner,
	EwalletTransactionStatus,
	EwalletTransactionTarget,
	EwalletWalletTransactionRow,
	EwalletWidget,
	ServerTableResult,
} from "@roja/types"

import type { Env } from "@core/config/env.validation"
import { RedisService } from "@core/redis/redis.service"
import { StorageService } from "@core/storage/storage.service"
import { toAmount } from "@shared/billing/invoice-calculator"
import { computeBalance } from "@shared/ewallet/balance"
import type { EwalletFilter, EwalletListFilter } from "@admin/ewallet/dto/ewallet-wallet.dto"
import { resetEmailRetryAfter } from "@admin/ewallet/ewallet-mail"
import { buildWalletWorkbook } from "@admin/ewallet/wallet-export"
import { indoDateTime, ownerKind, ownerLabel, storageKey } from "@admin/ewallet/wallet-format"
import { SqlParams } from "@admin/common/sql"
import * as sql from "@admin/ewallet/wallet-sql"
import { EwalletTransaction } from "@ewallet/entities/ewallet-transaction.entity"
import { Ewallet } from "@ewallet/entities/ewallet.entity"

// Legacy `EwalletController`: Akun Dompet list, widgets, badge, detail, per-wallet transactions,
// setting, QR print and the balance export (workstream D-A).
//
// Every list, figure and export here reads the **stored** `total_balance`; only `findOne` shows the
// recomputed `total_saldo` (`computeBalance`) — that split is legacy's and is kept.

type ListSqlRow = Omit<EwalletListRow, "storedBalance" | "ownerType"> & { storedBalance: string; ownerType: string }

export type WalletFile = { fileName: string; buffer: Buffer }

@Injectable()
export class EwalletWalletService {
	constructor(
		private readonly dataSource: DataSource,
		private readonly storageService: StorageService,
		private readonly configService: ConfigService<Env>,
		private readonly redisService: RedisService,
		@InjectRepository(Ewallet) private readonly wallets: Repository<Ewallet>,
		@InjectRepository(EwalletTransaction) private readonly transactions: Repository<EwalletTransaction>,
	) {}

	/** `@ewalletListAmar` — server-side paged; `recordsTotal` is the unfiltered base query. */
	async findAll(query: EwalletListFilter): Promise<ServerTableResult<EwalletListRow>> {
		const orderBy = query.orderBy ?? sql.DEFAULT_SORT.orderBy
		const orderDir = (query.orderDir ?? sql.DEFAULT_SORT.orderDir).toUpperCase()

		const filterParams = new SqlParams()
		const filterWhere = sql.walletListWhere(query, filterParams)
		const pageParams = new SqlParams()
		const pageWhere = sql.walletListWhere(query, pageParams)
		const limitExpr = pageParams.add(query.limit)
		const offsetExpr = pageParams.add((query.page - 1) * query.limit)

		const [totals, filtered, rows] = await Promise.all([
			this.dataSource.query<{ total: number }[]>(sql.walletCountSql("")),
			this.dataSource.query<{ total: number }[]>(sql.walletCountSql(filterWhere), filterParams.values),
			this.dataSource.query<ListSqlRow[]>(
				sql.walletListSql(pageWhere, sql.WALLET_SORT_SQL[orderBy], orderDir, limitExpr, offsetExpr),
				pageParams.values,
			),
		])

		return {
			rows: rows.map((row) => ({
				...row,
				// `EwalletListRow.ownerType` only knows the two owners; the wallet table holds no others
				ownerType: ownerKind(row.ownerType) ?? "santri",
				storedBalance: toAmount(row.storedBalance),
			})),
			recordsTotal: totals[0]?.total ?? 0,
			recordsFiltered: filtered[0]?.total ?? 0,
		}
	}

	/** `@ewalletWidget` — legacy ran six `SUM`s; this is one statement. */
	async widget(filter: EwalletFilter): Promise<EwalletWidget> {
		const params = new SqlParams()
		const where = sql.walletListWhere(filter, params)
		const rows = await this.dataSource.query<{ student: string; merchant: string }[]>(
			sql.walletWidgetSql(where),
			params.values,
		)
		const student = toAmount(rows[0]?.student)
		const merchant = toAmount(rows[0]?.merchant)
		return { total: student + merchant, student, merchant }
	}

	/** `ViewServiceProvider`: `EwalletTransaction::process()->count()`. */
	async badge(): Promise<EwalletBadge> {
		return { count: await this.transactions.countBy({ status: "process" }) }
	}

	/** `@export` — `Laporan Saldo Akhir - {member} - {status}.xlsx`. */
	async exportBalances(filter: EwalletFilter): Promise<WalletFile> {
		const params = new SqlParams()
		const where = sql.walletListWhere(filter, params)
		const rows = await this.dataSource.query<sql.ExportSqlRow[]>(sql.walletExportSql(where), params.values)

		const statusSuffix = filter.status === "active" ? "Aktif" : filter.status === "inactive" ? "Nonaktif" : "Semua Status"
		const memberSuffix = filter.member === "merchant" ? "Merchant" : filter.member === "santri" ? "Santri" : "Semua Pengguna"

		const buffer = await buildWalletWorkbook(
			rows.map((row) => ({
				uniqueId: row.uniqueId,
				name: row.name,
				ownerLabel: ownerLabel(row.ownerType),
				isActive: row.isActive,
				balance: toAmount(row.balance),
			})),
			memberSuffix,
			statusSuffix,
		)
		return { fileName: `Laporan Saldo Akhir - ${memberSuffix} - ${statusSuffix}.xlsx`, buffer }
	}

	/**
	 * `@detail` + `_partials/{student,merchant}-detail.blade.php`. The buttons' `@if` ladder is
	 * decided here so the page only renders it:
	 *
	 *   active   → Isi Saldo on; Tarik Saldo on unless a santri's balance is 0 (a merchant's is never checked)
	 *   inactive → Isi Saldo off; Tarik Saldo on only for a santri whose `student_status` is `inactive`
	 *              and whose balance is not 0; the orange "?" tooltip shows
	 */
	async findOne(ewalletId: number): Promise<EwalletDetail> {
		const { wallet, owner, kind } = await this.loadWallet(ewalletId)
		const balance = await computeBalance(this.dataSource.manager, ewalletId)

		const isStudent = kind === "santri"
		const studentInactive = owner.kind === "santri" && owner.studentStatus === "inactive"
		const canTopUp = wallet.isActive
		const canWithdraw = wallet.isActive
			? isStudent
				? balance !== 0
				: true
			: isStudent && studentInactive && balance !== 0

		return {
			id: ewalletId,
			uniqueId: wallet.uniqueId,
			ownerType: kind,
			isActive: wallet.isActive,
			owner,
			balance,
			canTopUp,
			canWithdraw,
			showInactiveNotice: !wallet.isActive,
			qrValue: wallet.uniqueId,
			// `NISP {nis}` / `No Merchant {unique_number}` (the detail partials; setting and print use the wallet id)
			qrCaption: owner.kind === "santri" ? `NISP ${owner.nis ?? ""}` : `No Merchant ${owner.uniqueNumber ?? ""}`,
		}
	}

	/**
	 * `@transactionList`. `Pembelian - {merchant}` on a santri's table and `Penjualan - {name}` on a
	 * merchant's; a purchase with no detail row reads `… - Belum ditentukan`.
	 */
	async findTransactions(ewalletId: number): Promise<EwalletWalletTransactionRow[]> {
		const { kind } = await this.loadWallet(ewalletId)
		const rows = await this.dataSource.query<sql.WalletTransactionSqlRow[]>(sql.walletTransactionsSql(kind === "santri"), [
			ewalletId,
		])

		return rows.map((row) => {
			const purchase = row.type === "purchase"
			const name = !purchase
				? (row.name ?? "")
				: kind === "santri"
					? `Pembelian - ${row.hasDetail ? (row.txnWalletMerchantName ?? "") : "Belum ditentukan"}`
					: `Penjualan - ${row.hasDetail ? (row.belongsName ?? "") : "Belum ditentukan"}`
			return {
				id: Number(row.id),
				code: row.code,
				name,
				paymentMethod: row.paymentMethod,
				amount: toAmount(row.amount),
				createdAt: indoDateTime(row.createdAt),
				createdAtTs: Number(row.createdAtTs ?? 0),
				type: row.type as EwalletWalletTransactionRow["type"],
				status: row.status as EwalletTransactionStatus,
				target: this.targetOf(row.type, row.status),
			}
		})
	}

	/** `MerchantService::editButton`: a purchase links to its history detail only once `valid`, anything else to the cash/bank detail. */
	private targetOf(type: string, status: string): EwalletTransactionTarget {
		if (type !== "purchase") return "transaction"
		return status === "valid" ? "history" : "none"
	}

	/** `@setting` + `setting.blade.php`. */
	async getSetting(ewalletId: number): Promise<EwalletSettingPage> {
		const { wallet, owner, kind, ownerId, email, blocked } = await this.loadWallet(ewalletId)
		return {
			id: ewalletId,
			uniqueId: wallet.uniqueId,
			ownerType: kind,
			isActive: wallet.isActive,
			owner,
			ownerEmail: email,
			ownerBlocked: blocked,
			resetEmailRetryAfter: await resetEmailRetryAfter(this.redisService, kind, ownerId),
		}
	}

	/** `@updateSetting` — `Data berhasil diupdate.` */
	async updateSetting(ewalletId: number, isActive: boolean): Promise<AdminMessageResult> {
		await this.loadWallet(ewalletId)
		await this.wallets.update({ id: ewalletId }, { isActive })
		return { message: "Data berhasil diupdate." }
	}

	/** `@qrCodePrint` — encodes the wallet's `unique_id`; the caption for a merchant is that same id. */
	async qrPrint(ewalletId: number): Promise<EwalletQrPrint> {
		const { wallet, owner } = await this.loadWallet(ewalletId)
		return {
			qrValue: wallet.uniqueId,
			caption: owner.kind === "santri" ? `NISP ${owner.nis ?? ""}` : `No Merchant ${wallet.uniqueId ?? ""}`,
			name: owner.name,
		}
	}

	/** `@qrCodePrintAll` — every live santri, wallet or not, encoding the **NIS** (legacy's own inconsistency). */
	async qrPrintAll(): Promise<EwalletQrPrintAllRow[]> {
		const rows = await this.dataSource.query<sql.QrAllSqlRow[]>(sql.QR_ALL_SQL)
		return rows.map((row) => ({ name: row.name, nis: row.nis, qrValue: row.nis }))
	}

	/**
	 * The wallet, its owner card and the fields the setting page needs. Legacy's route-model
	 * binding 404s on a missing wallet, and 500s when the owner is gone; both answer 404 here.
	 */
	private async loadWallet(ewalletId: number): Promise<{
		wallet: { uniqueId: string | null; isActive: boolean }
		owner: EwalletOwner
		kind: "santri" | "merchant"
		ownerId: string
		email: string | null
		blocked: boolean
	}> {
		const wallet = await this.wallets.findOne({
			select: {
				id: true,
				uniqueId: true,
				ewalletableType: true,
				ewalletableId: true,
				isActive: true,
				studentName: true,
				studentGradeLevel: true,
				studentGradeNumber: true,
				studentFatherFullname: true,
			},
			where: { id: ewalletId },
		})
		if (!wallet) throw new NotFoundException("Data dompet tidak ditemukan.")
		const kind = ownerKind(wallet.ewalletableType)
		const ownerId = wallet.ewalletableId
		if (kind === null || ownerId === null) throw new NotFoundException("Pemilik dompet tidak ditemukan.")
		const summary = { uniqueId: wallet.uniqueId, isActive: wallet.isActive as boolean }

		if (kind === "santri") {
			const owners = await this.dataSource.query<sql.StudentOwnerRow[]>(sql.STUDENT_OWNER_SQL, [ownerId])
			const row = owners[0]
			if (!row) throw new NotFoundException("Pemilik dompet tidak ditemukan.")
			const owner: EwalletStudentOwner = {
				kind: "santri",
				// `firstWhere('grade_status','active')->fullname ?? $ewallet->student_name`
				name: row.hasActiveGrade ? row.fullname ?? wallet.studentName : wallet.studentName,
				photoUrl: row.attachPhoto ? await this.studentPhotoUrl(row.attachPhoto) : null,
				levelAndGrade: row.hasActiveGrade
					? `${row.levelName ?? ""}, Kelas ${row.grade ?? ""}`
					: `${wallet.studentGradeLevel ?? ""}, Kelas ${wallet.studentGradeNumber ?? ""}`,
				parentName: row.hasActiveGrade ? row.fatherFullname ?? wallet.studentFatherFullname : wallet.studentFatherFullname,
				nis: row.nis,
				studentStatus: row.studentStatus,
			}
			return {
				wallet: summary,
				owner,
				kind,
				ownerId,
				email: row.email,
				blocked: row.isBlocked === true,
			}
		}

		const owners = await this.dataSource.query<sql.MerchantOwnerRow[]>(sql.MERCHANT_OWNER_SQL, [ownerId])
		const row = owners[0]
		if (!row) throw new NotFoundException("Pemilik dompet tidak ditemukan.")
		const owner: EwalletMerchantOwner = {
			kind: "merchant",
			name: row.name,
			photoUrl: this.merchantPhotoUrl(row.photo),
			merchantName: row.merchantName,
			address: row.address,
			phone: row.phone,
			uniqueNumber: row.uniqueNumber,
		}
		return {
			wallet: summary,
			owner,
			kind,
			ownerId,
			email: row.email,
			blocked: row.isBlocked === true,
		}
	}

	/** `storage_url($grade->attach_photo)` — the API's own storage. */
	private studentPhotoUrl(photo: string): Promise<string> {
		return this.storageService.getUrl(storageKey(photo))
	}

	/** `storage_url($merchant->photo, env('MERCHANT_URL'))` — the merchant app's public disk. */
	private merchantPhotoUrl(photo: string | null): string | null {
		if (!photo) return null
		if (/^https?:\/\//i.test(photo)) return photo
		const base = (this.configService.get("MERCHANT_URL", { infer: true }) ?? "").replace(/\/+$/, "")
		return `${base}/storage/${storageKey(photo)}`
	}
}
