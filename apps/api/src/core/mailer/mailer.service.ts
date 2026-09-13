import { Injectable, Logger, OnModuleInit } from "@nestjs/common"
import { MailerService as NestMailerService } from "@nestjs-modules/mailer"

export type SendMailOptions = {
	to: string
	subject: string
	template: string
	context?: Record<string, any>
}

@Injectable()
export class MailerService implements OnModuleInit {
	private readonly logger = new Logger(MailerService.name)

	constructor(private readonly mailer: NestMailerService) {}

	async onModuleInit(): Promise<void> {
		// Log the interface snapshot Nodemailer is using — confirms IPv6 patch is active
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const nodemailerShared = require("nodemailer/lib/shared")
		const ifaceAddresses = Object.values(nodemailerShared.networkInterfaces ?? {})
			.flat()
			.map((i: any) => `${i.family}:${i.address}`)
		this.logger.log(`Nodemailer network snapshot: [${ifaceAddresses.join(", ")}]`)

		try {
			const transporter = this.mailer.getTransporter()
			if (transporter && typeof transporter.verify === "function") {
				await transporter.verify()
				this.logger.log("SMTP connection verified successfully")
			}
		} catch (error) {
			this.logger.error(`SMTP connection verification failed: ${error instanceof Error ? error.message : error}`)
		}
	}

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
