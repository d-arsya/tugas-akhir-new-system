import { Injectable } from "@nestjs/common"
import { MailerService as NestMailerService } from "@nestjs-modules/mailer"

@Injectable()
export class MailerService {
	constructor(private readonly mailer: NestMailerService) {}

	async sendEmailVerification(to: string, data: { name: string; verifyUrl: string }): Promise<void> {
		await this.mailer.sendMail({
			to,
			subject: "Verifikasi Email — Pondok Roja",
			template: "email-verification",
			context: data,
		})
	}

	async sendForgotPassword(to: string, data: { name: string; resetUrl: string }): Promise<void> {
		await this.mailer.sendMail({
			to,
			subject: "Reset Password — Pondok Roja",
			template: "forgot-password",
			context: data,
		})
	}

	async sendTwoFactorCode(to: string, data: { name: string; code: string }): Promise<void> {
		await this.mailer.sendMail({
			to,
			subject: "Kode Verifikasi 2FA — Pondok Roja",
			template: "two-factor",
			context: data,
		})
	}

	async sendResetPin(to: string, data: { name: string; resetUrl: string }): Promise<void> {
		await this.mailer.sendMail({
			to,
			subject: "Reset PIN E-Wallet — Pondok Roja",
			template: "reset-pin",
			context: data,
		})
	}
}
