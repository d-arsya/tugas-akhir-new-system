import { Injectable } from "@nestjs/common"
import { MailerService as NestMailerService } from "@nestjs-modules/mailer"

export type SendMailOptions = {
	to: string
	subject: string
	template: string
	context?: Record<string, any>
}

@Injectable()
export class MailerService {
	constructor(private readonly mailer: NestMailerService) {}

	async sendMail(options: SendMailOptions): Promise<void> {
		await this.mailer.sendMail({
			to: options.to,
			subject: options.subject,
			template: options.template,
			context: options.context ?? {},
		})
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
}
