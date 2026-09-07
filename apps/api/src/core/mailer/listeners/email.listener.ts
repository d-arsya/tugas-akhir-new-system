import { Injectable } from "@nestjs/common"
import { OnEvent } from "@nestjs/event-emitter"
import { MailerService } from "@core/mailer/mailer.service"
import {
	EmailVerificationEvent,
	ForgotPasswordEvent,
	RegistrantPasswordEvent,
	ResetPinEvent,
} from "@core/mailer/events/email.events"

@Injectable()
export class EmailListener {
	constructor(private readonly mailerService: MailerService) {}

	@OnEvent("registrant.password.created", { async: true })
	async handleRegistrantPassword(event: RegistrantPasswordEvent): Promise<void> {
		await this.mailerService.sendRegistrantPassword(event.to, event.data)
	}

	@OnEvent("ewallet.pin.reset_requested", { async: true })
	async handleResetPin(event: ResetPinEvent): Promise<void> {
		await this.mailerService.sendResetPin(event.to, event.data)
	}

	@OnEvent("email.verification_requested", { async: true })
	async handleEmailVerification(event: EmailVerificationEvent): Promise<void> {
		await this.mailerService.sendEmailVerification(event.to, event.data)
	}

	@OnEvent("auth.forgot_password", { async: true })
	async handleForgotPassword(event: ForgotPasswordEvent): Promise<void> {
		await this.mailerService.sendForgotPassword(event.to, event.data)
	}
}
