import { Module } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { MailerModule as NestMailerModule } from "@nestjs-modules/mailer"
import { SafeHandlebarsAdapter } from "./adapters/safe-handlebars.adapter"
import { join } from "path"
import { MailerService } from "@core/mailer/mailer.service"
import { EmailListener } from "@core/mailer/listeners/email.listener"
import type { Env } from "@core/config/env.validation"

@Module({
	imports: [
		NestMailerModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (configService: ConfigService<Env, true>) => {
				const port = Number(configService.get("MAIL_PORT", { infer: true })) || 587
				const mailSecure = configService.get("MAIL_SECURE", { infer: true })
				const isSecure = mailSecure !== undefined ? mailSecure : port === 465

				return {
					transport: {
						host: configService.get("MAIL_HOST", { infer: true }) || "smtp.gmail.com",
						port,
						secure: isSecure,
						requireTLS: !isSecure,
						family: 4,
						connectionTimeout: 10000,
						greetingTimeout: 10000,
						socketTimeout: 15000,
						name: "pondokroja.com",
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
						adapter: new SafeHandlebarsAdapter(),
						options: { strict: true },
					},
				}
			},
		}),
	],
	providers: [MailerService, EmailListener],
	exports: [MailerService],
})
export class MailerModule { }
