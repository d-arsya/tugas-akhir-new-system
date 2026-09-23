import { Injectable, Logger, OnModuleInit } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import axios from "axios"
import * as handlebars from "handlebars"
import * as fs from "node:fs"
import * as path from "node:path"
import type { Env } from "@core/config/env.validation"

export type SendMailAttachment = {
	filename?: string
	url: string
}

export type SendMailOptions = {
	to: string | string[]
	subject: string
	template: string
	context?: Record<string, any>
	text?: string
	attachments?: SendMailAttachment[]
	ccs?: string[]
	bccs?: string[]
}

const EMBEDDED_TEMPLATES: Record<string, string> = {
	"registrant-password": `<!DOCTYPE html>
<html lang="id">
<head>
	<meta charset="UTF-8">
	<title>Akun Pendaftaran Santri Baru</title>
	<style>
		body { font-family: 'Montserrat', Arial, sans-serif; background-color: #ecedf0; margin: 0; padding: 20px; color: #4b4b4b; }
		.container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 8px 30px rgba(0,0,0,0.08); }
		.header { text-align: center; margin-bottom: 24px; }
		.header h1 { font-size: 22px; color: #17283c; margin: 0 0 6px; }
		.info-box { background: #f7f7f7; border-left: 4px solid #e4007e; padding: 16px; border-radius: 6px; margin: 20px 0; }
		.cred-label { font-size: 11px; color: #777777; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
		.cred-val { font-size: 16px; font-weight: 700; color: #17283c; font-family: monospace; }
		.btn { display: inline-block; background-color: #e4007e; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 13px; margin-top: 16px; text-align: center; }
		.footer { font-size: 11px; color: #abb4be; text-align: center; margin-top: 24px; border-top: 1px solid #eeeeee; padding-top: 16px; }
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>Penerimaan Santri Baru</h1>
			<p>Pondok Roja</p>
		</div>
		<p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>
		<p>Halo <strong>{{fullName}}</strong>, pendaftaran calon santri baru Anda telah berhasil kami terima.</p>
		<div class="info-box">
			<div class="cred-label">Nomor Pendaftaran</div>
			<div class="cred-val">{{registrantId}}</div>
			<div style="margin-top: 12px;" class="cred-label">Password Akun Anda</div>
			<div class="cred-val">{{password}}</div>
		</div>
		<p>Silakan gunakan email dan password di atas untuk masuk ke dashboard PSB dan memantau status validasi data Anda.</p>
		<div style="text-align: center;">
			<a href="{{loginUrl}}" class="btn">Masuk ke Dashboard PSB</a>
		</div>
		<div class="footer">
			&copy; Pondok Roja. Pesan ini dikirim secara otomatis oleh sistem.
		</div>
	</div>
</body>
</html>`,
	"email-verification": `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Verifikasi Email</title></head>
<body style="font-family: Montserrat, sans-serif; color: #4b4b4b; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2>Halo, {{name}}!</h2>
  <p>Klik tombol berikut untuk memverifikasi alamat email Anda:</p>
  <a href="{{verifyUrl}}" style="display:inline-block;padding:12px 24px;background:#e4007e;color:#fff;text-decoration:none;border-radius:6px;">
    Verifikasi Email
  </a>
  <p style="margin-top:20px;font-size:12px;color:#abb4be;">Jika Anda tidak mendaftar, abaikan email ini.</p>
</body>
</html>`,
	"forgot-password": `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Reset Password</title></head>
<body style="font-family: Montserrat, sans-serif; color: #4b4b4b; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2>Halo, {{name}}!</h2>
  <p>Anda meminta reset password. Klik tombol berikut:</p>
  <a href="{{resetUrl}}" style="display:inline-block;padding:12px 24px;background:#e4007e;color:#fff;text-decoration:none;border-radius:6px;">
    Reset Password
  </a>
  <p style="margin-top:20px;font-size:12px;color:#abb4be;">Link ini berlaku 60 menit. Jika Anda tidak meminta ini, abaikan email ini.</p>
</body>
</html>`,
	"reset-pin": `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Reset PIN E-Wallet</title></head>
<body style="font-family: Montserrat, sans-serif; color: #4b4b4b; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2>Halo, {{name}}!</h2>
  <p>Anda meminta reset PIN E-Wallet. Klik tombol berikut:</p>
  <a href="{{resetUrl}}" style="display:inline-block;padding:12px 24px;background:#e4007e;color:#fff;text-decoration:none;border-radius:6px;">
    Reset PIN
  </a>
  <p style="margin-top:20px;font-size:12px;color:#abb4be;">Link ini berlaku 60 menit.</p>
</body>
</html>`,
	"two-factor": `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Kode 2FA</title></head>
<body style="font-family: Montserrat, sans-serif; color: #4b4b4b; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2>Halo, {{name}}!</h2>
  <p>Kode verifikasi 2FA Anda:</p>
  <div style="font-size:36px;font-weight:bold;color:#e4007e;letter-spacing:8px;margin:20px 0;">{{code}}</div>
  <p style="font-size:12px;color:#abb4be;">Kode ini berlaku 10 menit.</p>
</body>
</html>`,
}

@Injectable()
export class MailerService implements OnModuleInit {
	private readonly logger = new Logger(MailerService.name)

	constructor(private readonly configService: ConfigService<Env, true>) { }

	onModuleInit(): void {
		const mailServiceUrl = this.configService.get("MAIL_SERVICE", { infer: true })
		if (mailServiceUrl) {
			this.logger.log(`MailerService initialized with REST email service: ${mailServiceUrl}`)
		} else {
			this.logger.warn("MAIL_SERVICE is not configured. Outgoing emails will fail unless MAIL_SERVICE is set.")
		}
	}

	private renderTemplate(templateName: string, context: Record<string, any>): string {
		const rawName = path.basename(templateName, path.extname(templateName))
		const candidateDirs = [
			path.join(__dirname, "templates"),
			path.join(__dirname, "../templates"),
			path.join(process.cwd(), "dist/apps/api/templates"),
			path.join(process.cwd(), "apps/api/src/core/mailer/templates"),
		]

		for (const dir of candidateDirs) {
			const filePath = path.join(dir, `${rawName}.hbs`)
			if (fs.existsSync(filePath)) {
				const source = fs.readFileSync(filePath, "utf-8")
				const template = handlebars.compile(source)
				return template(context)
			}
		}

		const fallbackSource = EMBEDDED_TEMPLATES[rawName]
		if (fallbackSource) {
			const template = handlebars.compile(fallbackSource)
			return template(context)
		}

		return `<p>${JSON.stringify(context)}</p>`
	}

	async sendMail(options: SendMailOptions): Promise<void> {
		const mailServiceUrl = this.configService.get("MAIL_SERVICE", { infer: true })
		if (!mailServiceUrl) {
			this.logger.error("Cannot send email: MAIL_SERVICE endpoint is not configured in environment")
			throw new Error("MAIL_SERVICE endpoint is not configured")
		}

		const mailApiKey = this.configService.get("MAIL_API_KEY", { infer: true })
		const htmlContent = this.renderTemplate(options.template, options.context ?? {})

		const headers: Record<string, string> = {
			"Content-Type": "application/json",
		}

		if (mailApiKey) {
			headers["X-ROJA-EMAIL-KEY"] = mailApiKey
		}

		const payload: Record<string, any> = {
			to: options.to,
			subject: options.subject,
		}

		if (htmlContent && htmlContent.trim() !== "") {
			payload["html"] = htmlContent
		}

		if (options.text && options.text.trim() !== "") {
			payload["text"] = options.text
		} else if (!payload["html"]) {
			payload["text"] = options.subject
		}

		if (options.attachments && options.attachments.length > 0) {
			payload["attachments"] = options.attachments
		}

		if (options.ccs && options.ccs.length > 0) {
			payload["ccs"] = options.ccs
		}

		if (options.bccs && options.bccs.length > 0) {
			payload["bccs"] = options.bccs
		}

		try {
			await axios.post(mailServiceUrl, payload, {
				headers,
				timeout: 10000,
			})
			this.logger.log(`Email successfully sent to ${options.to} via REST service`)
		} catch (error) {
			const errorMsg = axios.isAxiosError(error)
				? `status ${error.response?.status}: ${JSON.stringify(error.response?.data) || error.message}`
				: error instanceof Error
					? error.message
					: String(error)

			this.logger.error(`Failed to send email to ${options.to} via REST service: ${errorMsg}`)
			throw error
		}
	}

	async sendEmailVerification(to: string, data: { name: string; verifyUrl: string }): Promise<void> {
		await this.sendMail({
			to,
			subject: "Verifikasi Email — Pondok Roja",
			template: "email-verification",
			context: data,
		})
	}

	async sendForgotPassword(to: string, data: { name: string; resetUrl: string }): Promise<void> {
		await this.sendMail({
			to,
			subject: "Reset Password — Pondok Roja",
			template: "forgot-password",
			context: data,
		})
	}

	async sendTwoFactorCode(to: string, data: { name: string; code: string }): Promise<void> {
		await this.sendMail({
			to,
			subject: "Kode Verifikasi 2FA — Pondok Roja",
			template: "two-factor",
			context: data,
		})
	}

	async sendResetPin(to: string, data: { name: string; resetUrl: string }): Promise<void> {
		await this.sendMail({
			to,
			subject: "Reset PIN E-Wallet — Pondok Roja",
			template: "reset-pin",
			context: data,
		})
	}

	async sendRegistrantPassword(
		to: string,
		data: { fullName: string; registrantId: string; password: string; loginUrl: string },
	): Promise<void> {
		await this.sendMail({
			to,
			subject: "Pendaftaran Santri Baru — Akun Anda",
			template: "registrant-password",
			context: data,
		})
	}

	/**
	 * Legacy `MerchantRegisteredNotification`: sent once, when Data Master ▸ Merchant creates a
	 * merchant. The merchant app signs in with the unique number rather than the email, so both
	 * the number and the generated password have to travel in the body.
	 *
	 * The password is generated with a CSPRNG rather than legacy's `substr(bcrypt($email), -8)`,
	 * which derived it from the email and so produced the same value for the same address.
	 */
	async sendMerchantRegistered(
		to: string,
		data: { name: string; uniqueNumber: string; password: string; school: string },
	): Promise<void> {
		await this.sendMail({
			to,
			subject: `${data.school} - Anda telah didaftarkan sebagai merchant`,
			template: "merchant-registered",
			context: { ...data, year: new Date().getFullYear() },
		})
	}

	/** Legacy `CreatePasswordNotification`: sent when an admin account is created without a password. */
	async sendCreatePassword(
		to: string,
		data: { name: string; role: string; school: string; createUrl: string },
	): Promise<void> {
		await this.sendMail({
			to,
			subject: `${data.school} - Anda telah didaftarkan sebagai admin`,
			template: "create-password",
			context: { ...data, year: new Date().getFullYear() },
		})
	}
}
