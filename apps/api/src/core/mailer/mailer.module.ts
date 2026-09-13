import { Module } from "@nestjs/common"
import { MailerService } from "@core/mailer/mailer.service"
import { EmailListener } from "@core/mailer/listeners/email.listener"

@Module({
	providers: [MailerService, EmailListener],
	exports: [MailerService],
})
export class MailerModule {}
