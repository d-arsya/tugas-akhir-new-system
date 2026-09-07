import { Global, Module } from "@nestjs/common"
import { APP_GUARD } from "@nestjs/core"
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler"
import { LoggerModule } from "nestjs-pino"
import pinoPretty from "pino-pretty"
import { EventEmitterModule } from "@nestjs/event-emitter"
import { ConfigModule } from "@core/config/config.module"
import { DatabaseModule } from "@core/database/database.module"
import { RedisModule } from "@core/redis/redis.module"
import { AuthModule } from "@core/auth/auth.module"
import { MailerModule } from "@core/mailer/mailer.module"
import { StorageModule } from "@core/storage/storage.module"
import { QueueModule } from "@core/queue/queue.module"
import { IpBanModule } from "@core/ip-ban/ip-ban.module"

@Global()
@Module({
	imports: [
		// Config must be first — all other modules depend on it
		ConfigModule,

		// Pino structured logging (serverless & Vercel compatible)
		LoggerModule.forRoot({
			pinoHttp: {
				level: "info",
				autoLogging: true,
				customSuccessMessage: (req: any, res: any) => {
					return `${req.method} ${req.url} ${res.statusCode}`
				},
				customErrorMessage: (req: any, res: any, err: any) => {
					return `${req.method} ${req.url} ${res.statusCode} - ${err?.message || "Error"}`
				},
				stream: pinoPretty({
					colorize: true,
					singleLine: true,
					translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
					sync: true,
				}),
			},
		}),

		// Throttler — global rate limiting
		ThrottlerModule.forRoot([
			{
				name: 'default',
				ttl: 60_000,
				limit: 600,
			},
			{
				name: 'auth',
				ttl: 60_000,
				limit: 600,
			},
			{
				name: 'otp',
				ttl: 5 * 60_000,
				limit: 600,
			},
			{
				name: 'password',
				ttl: 10 * 60_000,
				limit: 600,
			},
			{
				name: 'upload',
				ttl: 60_000,
				limit: 600,
			},
			{
				name: 'search',
				ttl: 60_000,
				limit: 600,
			},
		]),

		// Event Emitter — in-process async domain events
		EventEmitterModule.forRoot(),

		DatabaseModule,
		RedisModule,
		AuthModule,
		MailerModule,
		StorageModule,
		QueueModule,
		IpBanModule,
	],
	providers: [
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
	],
	exports: [
		EventEmitterModule,
		AuthModule,
		RedisModule,
		MailerModule,
		StorageModule,
		QueueModule,
		IpBanModule,
	],
})
export class CoreModule { }
