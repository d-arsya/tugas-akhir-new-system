import { Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { InjectRepository } from "@nestjs/typeorm"
import * as crypto from "crypto"
import type Redis from "ioredis"
import { DataSource, Repository } from "typeorm"

import { throwFieldErrors } from "@core/errors/field-errors"
import { MailerService } from "@core/mailer/mailer.service"
import { REDIS_CLIENT } from "@core/redis/redis.constants"
import { RedisService } from "@core/redis/redis.service"
import { User } from "@admin/entities/user.entity"
import { SettingSchool } from "@shared/school/entities/setting-school.entity"
import type { Env } from "@core/config/env.validation"
import type { AdminUserCreateInput, AdminUserUpdateInput } from "@admin/dto/admin-user.dto"

export type AdminUserRow = {
	id: number
	name: string | null
	email: string | null
	role: string | null
	/** Already formatted in Asia/Jakarta, e.g. "22 September 2026 jam 10:05". */
	createdAt: string
	/** Unix seconds — legacy renders this in a hidden span so the column sorts by date. */
	createdAtTs: number
	isBlocked: boolean
}

export type AdminUserDetail = {
	id: number
	name: string | null
	email: string | null
	role: string | null
	gender: "male" | "female" | null
	isBlocked: boolean
}

type UserListRow = {
	id: string
	name: string | null
	email: string | null
	role: string | null
	isBlocked: boolean | null
	localCreatedAt: string
	createdAtTs: string
}

const TIMEZONE = "Asia/Jakarta"

const MONTHS_ID = [
	"Januari",
	"Februari",
	"Maret",
	"April",
	"Mei",
	"Juni",
	"Juli",
	"Agustus",
	"September",
	"Oktober",
	"November",
	"Desember",
]

// `RegistrantService::datatableDate(..., 'd F Y \j\a\m H:i')` on a `yyyy-mm-ddThh:mm:ss` local string
const indoDateTime = (local: string): string =>
	`${local.slice(8, 10)} ${MONTHS_ID[Number(local.slice(5, 7)) - 1] ?? ""} ${local.slice(0, 4)} jam ${local.slice(11, 16)}`

// Legacy hides Superadmins with `where('role', '!=', 'SuperAdmin')`, which never matches on
// Postgres because of the casing; the port hides them for real (plan decision).
const NOT_SUPERADMIN = "u.role IS DISTINCT FROM 'Superadmin'"

// Port of legacy `UserController` (Pengelola) + `CreatePasswordNotification`
@Injectable()
export class AdminUserService {
	private readonly logger = new Logger(AdminUserService.name)

	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(SettingSchool)
		private readonly schoolRepository: Repository<SettingSchool>,
		@Inject(REDIS_CLIENT)
		private readonly redis: Redis,
		private readonly dataSource: DataSource,
		private readonly redisService: RedisService,
		private readonly mailerService: MailerService,
		private readonly configService: ConfigService<Env, true>,
	) {}

	/** `User::where('role', '!=', 'SuperAdmin')->latest()->get()` */
	async findAll(): Promise<AdminUserRow[]> {
		const rows = await this.dataSource.query<UserListRow[]>(
			`SELECT u.id, u.name, u.email, u.role, u.is_blocked AS "isBlocked",
				to_char(u.created_at AT TIME ZONE '${TIMEZONE}', 'YYYY-MM-DD"T"HH24:MI:SS') AS "localCreatedAt",
				EXTRACT(EPOCH FROM u.created_at)::bigint AS "createdAtTs"
			FROM tbr_users u
			WHERE ${NOT_SUPERADMIN}
			ORDER BY u.created_at DESC, u.id DESC`,
		)

		return rows.map((row) => ({
			id: Number(row.id),
			name: row.name,
			email: row.email,
			role: row.role,
			createdAt: indoDateTime(row.localCreatedAt),
			createdAtTs: Number(row.createdAtTs),
			isBlocked: Boolean(row.isBlocked),
		}))
	}

	async findOne(id: number): Promise<AdminUserDetail> {
		const user = await this.requireUser(id)
		return {
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
			gender: user.gender,
			isBlocked: Boolean(user.isBlocked),
		}
	}

	/** `User::create($request->validated())` then `notify(new CreatePasswordNotification($user))` */
	async create(input: AdminUserCreateInput): Promise<{ message: string }> {
		const taken = await this.userRepository.findOneBy({ email: input.email })
		if (taken) throwFieldErrors({ email: ["Alamat email sudah ada sebelumnya."] })

		// Legacy creates the row without a password; the user sets one from the emailed link
		const user = await this.userRepository.save(
			this.userRepository.create({
				name: input.name,
				gender: input.gender,
				role: input.role,
				email: input.email,
				isBlocked: input.isBlocked,
				blockedAt: input.isBlocked ? new Date() : null,
				password: null,
				weakPassword: false,
			}),
		)

		const token = crypto.randomBytes(32).toString("hex")
		try {
			await this.redisService.set(`create:admin:${token}`, input.email, 3600)
			await this.mailerService.sendCreatePassword(input.email, {
				name: input.name,
				// Legacy mail reads "didaftarkan sebagai {{ Str::lower($user->role) }}"
				role: input.role.toLowerCase(),
				school: await this.schoolName(),
				createUrl: this.createPasswordUrl(token, input.email),
			})
		} catch (error: unknown) {
			// Legacy `catch` deletes the half-created user and answers 500
			this.logger.error("[Pengelola] gagal mengirim email buat password", error)
			await this.redisService.del(`create:admin:${token}`)
			await this.userRepository.delete(user.id)
			throw new InternalServerErrorException("Terjadi kesalahan. Data gagal disimpan ke dalam basis data.")
		}

		return { message: "Data berhasil disimpan ke dalam basis data." }
	}

	/** `$user->update($request->validated())` — the posted email is never applied */
	async update(id: number, input: AdminUserUpdateInput): Promise<{ message: string }> {
		const user = await this.requireUser(id)
		const blocking = input.isBlocked && !user.isBlocked

		user.name = input.name
		user.gender = input.gender
		user.role = input.role
		user.isBlocked = input.isBlocked
		// Legacy never fills `blocked_at`; the port does (plan decision)
		user.blockedAt = input.isBlocked ? (user.blockedAt ?? new Date()) : null

		try {
			await this.userRepository.save(user)
		} catch (error: unknown) {
			this.logger.error("[Pengelola] gagal mengupdate pengelola", error)
			throw new InternalServerErrorException("Data gagal diupdate.")
		}

		// A blocked admin keeps working until its refresh token expires unless we revoke it
		if (blocking) await this.revokeSessions(user.id)

		return { message: "Data berhasil diupdate." }
	}

	/** Hard delete, like legacy (`User` has no SoftDeletes) */
	async remove(id: number): Promise<{ message: string }> {
		const user = await this.requireUser(id)
		try {
			await this.userRepository.delete(user.id)
		} catch (error: unknown) {
			this.logger.error("[Pengelola] gagal menghapus pengelola", error)
			// Legacy message has no trailing period
			throw new InternalServerErrorException("Data gagal dihapus dari basis data")
		}

		await this.revokeSessions(user.id)
		return { message: "Data berhasil dihapus dari basis data." }
	}

	/** Superadmins are not part of the list, so their rows are not reachable either. */
	private async requireUser(id: number): Promise<User> {
		const user = await this.userRepository.findOneBy({ id })
		if (!user || user.role === "Superadmin") {
			throw new NotFoundException("Pengelola tidak ditemukan.")
		}
		return user
	}

	private createPasswordUrl(token: string, email: string): string {
		const adminUrl = this.configService.get("ADMIN_URL", { infer: true }) || "http://localhost:4200"
		return `${adminUrl}/create-password?token=${token}&email=${encodeURIComponent(email)}`
	}

	// `SettingSchool.name ?: config('app.name')` — the mail subject and footer use it
	private async schoolName(): Promise<string> {
		const school = await this.schoolRepository.findOne({ where: {}, order: { id: "ASC" } })
		return school?.name || this.configService.get("APP_NAME", { infer: true })
	}

	private async revokeSessions(userId: number): Promise<void> {
		try {
			const keys = await this.redis.keys(`refresh:admin:${userId}:*`)
			if (keys.length > 0) await this.redis.del(...keys)
		} catch (error: unknown) {
			this.logger.error("[Pengelola] gagal mencabut sesi pengelola", error)
		}
	}
}
