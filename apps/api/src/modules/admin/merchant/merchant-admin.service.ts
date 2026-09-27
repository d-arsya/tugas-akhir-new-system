import { Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { InjectRepository } from "@nestjs/typeorm"
import * as bcrypt from "bcrypt"
import * as crypto from "node:crypto"
import { DataSource, Repository } from "typeorm"

import { throwFieldErrors } from "@core/errors/field-errors"
import { MailerService } from "@core/mailer/mailer.service"
import { indoDate } from "@admin/common/date-format"
import {
	EWALLET_BY_UNIQUE_NUMBER_SQL,
	MERCHANT_BY_ID_SQL,
	MERCHANT_EMAIL_TAKEN_SQL,
	MERCHANT_LIST_SQL,
	MERCHANT_NEXT_NUMBER_SQL,
	type MerchantDetailSqlRow,
	type MerchantSqlRow,
} from "@admin/merchant/merchant-sql"
import type { Env } from "@core/config/env.validation"
import type { MerchantWriteInput } from "@admin/merchant/dto/merchant-admin.dto"
import type { AdminRedirectResult } from "@admin/common/admin-response.dto"
import { Ewallet } from "@ewallet/entities/ewallet.entity"
import { Merchant } from "@merchant/entities/merchant.entity"
import { SettingSchool } from "@shared/school/entities/setting-school.entity"

export type MerchantRow = {
	id: number
	uniqueNumber: string
	name: string | null
	merchantName: string | null
	email: string | null
	/** `translatedFormat('d F Y')` — no time, unlike the Akademik lists. */
	createdAt: string
	createdAtTs: number
	isBlocked: boolean
}

export type MerchantDetail = {
	id: number
	uniqueNumber: string
	name: string | null
	gender: "male" | "female" | null
	email: string | null
	merchantName: string | null
	address: string | null
	phone: string | null
	photoUrl: string | null
	isBlocked: boolean
}

// `MerchantController` hard-codes both literals; neither comes from `resources/lang/id/admin.php`.
const SAVE_SUCCESS = "Berhasil disimpan."
const SAVE_FAILED = "Gagal disimpan."
const MERCHANTS_PATH = "/merchants"

/**
 * The generated password's alphabet. Legacy drew 8 characters from bcrypt's base64 output;
 * this keeps a comparable shape while dropping the glyphs that are unreadable in an email
 * (0/O, 1/l/I), so a merchant retyping it from the message does not lock themselves out.
 */
const PASSWORD_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"
const PASSWORD_LENGTH = 10

/**
 * Replacement for legacy's `substr(bcrypt($request->email), -8)` (user decision): the recipe
 * was public and its input was the merchant's own email address, so anyone could re-derive
 * the plaintext from the row. `crypto.randomInt` is the CSPRNG and is rejection-sampled, so
 * there is no modulo bias across the 57-character alphabet.
 */
const generatePassword = (): string =>
	Array.from({ length: PASSWORD_LENGTH }, () => PASSWORD_ALPHABET[crypto.randomInt(PASSWORD_ALPHABET.length)]).join("")

const genderOf = (value: string | null): "male" | "female" | null =>
	value === "male" || value === "female" ? value : null

/**
 * Port of the legacy `MerchantController` (Data Master ▸ Merchant).
 *
 * Legacy has no `show()` and no `destroy()` — both are empty stubs — and there is no upload
 * anywhere in the admin CRUD: `photo` is read-only, served from the merchant app's own storage
 * via `config('app.merchant_url')`.
 *
 * **Account creation** (user decision): keep the legacy flow the merchant app expects — generate
 * a password, store it hashed and email it — but generate it with a CSPRNG rather than legacy's
 * `substr(bcrypt($email), -8)`, which is derivable by anyone who knows the recipe.
 *
 * **E-wallet sync** (user decision): keep the legacy force-write, so every save re-asserts
 * `ewallets.is_active = NOT is_blocked` and merchant blocking stays the single source of truth
 * for wallet access. Note merchant 2 is already out of sync (not blocked, wallet disabled), so
 * saving it will re-enable that wallet — expected. Two bug fixes still apply: guard the lookup,
 * because legacy dereferenced `->first()` unguarded and 500d *after* writing the merchant row,
 * and wrap both writes in one transaction with a real rollback (legacy had `beginTransaction`
 * and no `rollBack`). Legacy matches `ewallets.unique_id` (bigint) against
 * `merchants.unique_number` (varchar), which needs an explicit cast in Postgres.
 */
@Injectable()
export class MerchantAdminService {
	private readonly logger = new Logger(MerchantAdminService.name)

	constructor(
		private readonly dataSource: DataSource,
		private readonly mailerService: MailerService,
		private readonly configService: ConfigService<Env>,
		@InjectRepository(SettingSchool) private readonly schools: Repository<SettingSchool>,
	) {}

	/** `Merchant::get()` — no where, no order; legacy leaves the order to the DB. */
	async findAll(): Promise<MerchantRow[]> {
		const rows = await this.dataSource.query<MerchantSqlRow[]>(MERCHANT_LIST_SQL)
		return rows.map((row) => ({
			id: Number(row.id),
			uniqueNumber: row.uniqueNumber,
			name: row.name,
			merchantName: row.merchantName,
			email: row.email,
			createdAt: indoDate(row.localCreatedAt),
			createdAtTs: Number(row.createdAtTs ?? 0),
			isBlocked: Boolean(row.isBlocked),
		}))
	}

	/** `generateUniqueNumber()` — `YEAR + LPAD(max(id) this year + 1, 3, '0')`, e.g. "2026004". */
	async nextUniqueNumber(): Promise<{ uniqueNumber: string }> {
		const rows = await this.dataSource.query<{ uniqueNumber: string }[]>(MERCHANT_NEXT_NUMBER_SQL)
		return { uniqueNumber: rows[0]?.uniqueNumber ?? "" }
	}

	async findOne(id: number): Promise<MerchantDetail> {
		const row = await this.requireMerchant(id)
		return {
			id: Number(row.id),
			uniqueNumber: row.uniqueNumber,
			name: row.name,
			gender: genderOf(row.gender),
			email: row.email,
			merchantName: row.merchantName,
			address: row.address,
			phone: row.phone,
			photoUrl: this.photoUrl(row.photo),
			isBlocked: Boolean(row.isBlocked),
		}
	}

	/**
	 * `store()`: insert the merchant, then notify them with the plaintext password.
	 *
	 * Legacy created no e-wallet row here and ran no status sync, so neither do we — the wallet
	 * is created by the merchant app and only re-asserted by `update()`.
	 */
	async create(dto: MerchantWriteInput): Promise<AdminRedirectResult> {
		await this.assertEmailFree(dto.email, null)

		const password = generatePassword()
		const hashed = await bcrypt.hash(password, 10)
		const school = await this.schoolName()

		let id = 0
		let uniqueNumber = ""
		try {
			await this.dataSource.transaction(async (manager) => {
				// Read the next number inside the transaction: two concurrent creates would
				// otherwise race for it, and `unique_number` carries a UNIQUE index
				const numbers = await manager.query<{ uniqueNumber: string }[]>(MERCHANT_NEXT_NUMBER_SQL)
				uniqueNumber = numbers[0]?.uniqueNumber ?? ""
				const saved = await manager.save(
					manager.create(Merchant, {
						name: dto.name,
						gender: dto.gender,
						email: dto.email,
						merchantName: dto.merchantName,
						address: dto.address,
						phone: dto.phone,
						isBlocked: dto.isBlocked,
						uniqueNumber,
						password: hashed,
					}),
				)
				id = Number(saved.id)
			})
		} catch (error) {
			this.logger.error("[Merchant] gagal menyimpan merchant", error)
			throw new InternalServerErrorException(SAVE_FAILED)
		}

		try {
			// `MerchantRegisteredNotification`: the merchant app logs in with the number, not the email
			await this.mailerService.sendMerchantRegistered(dto.email, {
				name: dto.name,
				uniqueNumber,
				password,
				school,
			})
		} catch (error) {
			// Legacy let the notification failure roll the whole request into its 500; the row
			// stayed behind because the catch never called `rollBack()`. Here the row is already
			// committed on purpose — deleting a merchant is not something this menu can do — so
			// the failure is logged and the save still answers success.
			this.logger.error(`[Merchant] gagal mengirim email kredensial merchant ${id}`, error)
		}

		return { message: SAVE_SUCCESS, redirect: MERCHANTS_PATH }
	}

	/**
	 * `update()`: write the merchant row, then force `ewallets.is_active = NOT is_blocked`.
	 *
	 * Both writes share one transaction with a real rollback (legacy opened one and never
	 * rolled back), and the wallet lookup is null-guarded (legacy 500d after the merchant row
	 * had already been written).
	 */
	async update(id: number, dto: MerchantWriteInput): Promise<AdminRedirectResult> {
		const merchant = await this.requireMerchant(id)
		await this.assertEmailFree(dto.email, id)

		try {
			await this.dataSource.transaction(async (manager) => {
				await manager.update(
					Merchant,
					{ id },
					{
						name: dto.name,
						gender: dto.gender,
						email: dto.email,
						merchantName: dto.merchantName,
						address: dto.address,
						phone: dto.phone,
						isBlocked: dto.isBlocked,
					},
				)

				const wallets = await manager.query<{ id: string; isActive: boolean | null }[]>(
					EWALLET_BY_UNIQUE_NUMBER_SQL,
					[merchant.uniqueNumber],
				)
				const wallet = wallets[0]
				if (!wallet) {
					this.logger.warn(
						`[Merchant] tidak ada e-wallet dengan unique_id ${merchant.uniqueNumber}; sinkronisasi status dilewati`,
					)
					return
				}
				// The force-write, verbatim: re-asserted on every save even when it does not change
				await manager.update(Ewallet, { id: Number(wallet.id) }, { isActive: !dto.isBlocked })
			})
		} catch (error) {
			this.logger.error("[Merchant] gagal menyimpan merchant", error)
			throw new InternalServerErrorException(SAVE_FAILED)
		}

		return { message: SAVE_SUCCESS, redirect: MERCHANTS_PATH }
	}

	private async requireMerchant(id: number): Promise<MerchantDetailSqlRow> {
		const rows = await this.dataSource.query<MerchantDetailSqlRow[]>(MERCHANT_BY_ID_SQL, [id])
		const row = rows[0]
		// Legacy's route-model binding answers 404 for a missing id
		if (!row) throw new NotFoundException("Merchant tidak ditemukan.")
		return row
	}

	/** `unique:merchants` / `unique:merchants,email,{id}` — `:Attribute sudah ada sebelumnya.` */
	private async assertEmailFree(email: string, exceptId: number | null): Promise<void> {
		const rows = await this.dataSource.query<{ id: string }[]>(MERCHANT_EMAIL_TAKEN_SQL, [email, exceptId])
		if (rows.length > 0) throwFieldErrors({ email: ["Email sudah ada sebelumnya."] })
	}

	/**
	 * `storage_url($merchant->photo, config('app.merchant_url'))`: an absolute URL passes
	 * through, anything else is a key under the **merchant app's** public disk, so it is
	 * served from `MERCHANT_URL` rather than this API's storage.
	 */
	private photoUrl(photo: string | null): string | null {
		if (!photo) return null
		if (/^https?:\/\//i.test(photo)) return photo
		const base = (this.configService.get("MERCHANT_URL", { infer: true }) ?? "").replace(/\/+$/, "")
		const key = photo.replace(/^\/?storage\//, "").replace(/^\/+/, "")
		return `${base}/storage/${key}`
	}

	/** `SettingSchool::first()->name ?? config('app.name')` — the mail subject and footer. */
	private async schoolName(): Promise<string> {
		const [school] = await this.schools.find({ select: { name: true }, order: { id: "ASC" }, take: 1 })
		return school?.name || (this.configService.get("APP_NAME", { infer: true }) ?? "Pondok Roja")
	}
}
