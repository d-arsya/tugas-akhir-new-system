import { randomBytes } from "node:crypto"

import { Inject, Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { DataSource } from "typeorm"

import type { Env } from "../../../core/config/env.validation"
import { MailerService } from "../../../core/mailer/mailer.service"
import { RedisService } from "../../../core/redis/redis.service"
import { societyFileUrl } from "../../../shared/society/files"

// The three mails the PSB admin pages send (legacy `Registrant::send*Notification`). Every one is sent
// **after** the transaction has committed and never fails the request: a delivery error is logged,
// exactly like legacy's `try { notify } catch { Log::info }`.

/** `config('auth.verification.expire', 60)` — the link lifetime legacy's mail text promises. */
const VERIFY_EXPIRE_MINUTES = 60

export type RegistrantMailTarget = { email: string | null; fullname: string | null }

type School = { school: string; logoUrl: string | null }

@Injectable()
export class RegistrantMailService {
	private readonly logger = new Logger(RegistrantMailService.name)

	constructor(
		@Inject(DataSource) private readonly dataSource: DataSource,
		@Inject(MailerService) private readonly mailerService: MailerService,
		@Inject(RedisService) private readonly redisService: RedisService,
		@Inject(ConfigService) private readonly configService: ConfigService<Env, true>,
	) {}

	/** `InvalidDataNotification`: "{school} - Data kamu belum sesuai!" → PSB dashboard. */
	invalidData(target: RegistrantMailTarget): void {
		this.fire("invalid-data", target, async (to, school) => {
			await this.mailerService.sendMail({
				to,
				subject: `${school.school} - Data kamu belum sesuai!`,
				template: "registrant-invalid-data",
				context: { ...this.base(target, school), dashboardUrl: `${this.psbUrl()}/dashboard` },
			})
		})
	}

	/** `RegistrantPasswordNotification`: "{school} - Password Anda" with the plain password → PSB login. */
	password(target: RegistrantMailTarget, password: string): void {
		this.fire("password", target, async (to, school) => {
			await this.mailerService.sendMail({
				to,
				subject: `${school.school} - Password Anda`,
				template: "registrant-account-password",
				context: { ...this.base(target, school), password, loginUrl: `${this.psbUrl()}/login` },
			})
		})
	}

	/**
	 * `sendEmailVerificationNotification()`, pointed at the PSB portal's own verification flow
	 * (`modules/psb/auth/psb-auth.service.ts`: redis `email-verify:<token>` → `/verify-email`).
	 */
	verification(target: RegistrantMailTarget): void {
		this.fire("verification", target, async (to, school) => {
			const token = randomBytes(32).toString("hex")
			await this.redisService.set(`email-verify:${token}`, to, VERIFY_EXPIRE_MINUTES * 60)
			const verifyUrl = `${this.psbUrl()}/verify-email?token=${token}&email=${encodeURIComponent(to)}`
			await this.mailerService.sendMail({
				to,
				subject: `${school.school} - Email Verification`,
				template: "registrant-verify",
				context: { ...this.base(target, school), verifyUrl, expireMinutes: VERIFY_EXPIRE_MINUTES },
			})
		})
	}

	private fire(kind: string, target: RegistrantMailTarget, send: (to: string, school: School) => Promise<void>): void {
		const to = target.email?.trim() ?? ""
		if (to === "") {
			this.logger.warn(`registrant ${kind} mail skipped: no email address`)
			return
		}
		void this.school()
			.then((school) => send(to, school))
			.catch((error: unknown) => {
				this.logger.error(`registrant ${kind} mail to ${to} failed: ${error instanceof Error ? error.message : String(error)}`)
			})
	}

	private base(target: RegistrantMailTarget, school: School): Record<string, string | number | null> {
		return { name: target.fullname ?? "", school: school.school, logoUrl: school.logoUrl, year: new Date().getFullYear() }
	}

	private psbUrl(): string {
		return String(this.configService.get("PSB_URL", { infer: true }) ?? "").replace(/\/+$/, "")
	}

	/** `SettingSchool::first()` — the sender name / logo (`config('app.name')` when there is no name). */
	private async school(): Promise<School> {
		const rows = (await this.dataSource.query("SELECT name, logo FROM tbr_setting_schools ORDER BY id LIMIT 1")) as Array<{
			name: string | null
			logo: string | null
		}>
		return { school: rows[0]?.name || "Pondok Roja", logoUrl: societyFileUrl(rows[0]?.logo ?? null) }
	}
}
