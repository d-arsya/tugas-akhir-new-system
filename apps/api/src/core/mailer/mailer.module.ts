import { Module } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { MailerModule as NestMailerModule } from "@nestjs-modules/mailer"
import { HandlebarsAdapter } from "@nestjs-modules/mailer/adapters/handlebars.adapter"
import { join } from "path"
import { MailerService } from "@core/mailer/mailer.service"
import { EmailListener } from "@core/mailer/listeners/email.listener"
import type { Env } from "@core/config/env.validation"

@Module({
	imports: [
		NestMailerModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (configService: ConfigService<Env, true>) => ({
				transport: {
					host: configService.get("MAIL_HOST", { infer: true }) || "smtp.gmail.com",
					port: Number(configService.get("MAIL_PORT", { infer: true })) || 587,
					secure: Number(configService.get("MAIL_PORT", { infer: true })) === 465,
					auth: {
						user: configService.get("MAIL_USER", { infer: true }) || "",
						pass: configService.get("MAIL_PASS", { infer: true }) || "",
					},
					tls: {
						rejectUnauthorized: false,
					},
				},
				defaults: {
					from: `"${configService.get("MAIL_FROM_NAME", { infer: true }) || "Pondok Roja"}" <${configService.get("MAIL_FROM_ADDRESS", { infer: true }) || configService.get("MAIL_USER", { infer: true }) || "noreply@pondokroja.com"}>`,
				},
				template: {
					dir: join(__dirname, "templates"),
					adapter: new HandlebarsAdapter(),
					options: { strict: true },
				},
			}),
		}),
	],
	providers: [MailerService, EmailListener],
	exports: [MailerService],
})
export class MailerModule {}
