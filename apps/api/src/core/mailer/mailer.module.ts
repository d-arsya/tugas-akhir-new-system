import { Module } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { MailerModule as NestMailerModule } from "@nestjs-modules/mailer"
import { HandlebarsAdapter } from "@nestjs-modules/mailer/adapters/handlebars.adapter"
import { join } from "path"
import { MailerService } from "./mailer.service"
import type { Env } from "../config/env.validation"

@Module({
	imports: [
		NestMailerModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (configService: ConfigService<Env, true>) => ({
				transport: {
					host: configService.get("MAIL_HOST", { infer: true }),
					port: configService.get("MAIL_PORT", { infer: true }),
					secure: false,
					auth: {
						user: configService.get("MAIL_USER", { infer: true }),
						pass: configService.get("MAIL_PASS", { infer: true }),
					},
				},
				defaults: {
					from: `"${configService.get("MAIL_FROM_NAME", { infer: true })}" <${configService.get("MAIL_FROM_ADDRESS", { infer: true })}>`,
				},
				template: {
					dir: join(__dirname, "templates"),
					adapter: new HandlebarsAdapter(),
					options: { strict: true },
				},
			}),
		}),
	],
	providers: [MailerService],
	exports: [MailerService],
})
export class MailerModule {}
