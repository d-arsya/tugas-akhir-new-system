import { Global, Module } from "@nestjs/common"
import { APP_GUARD } from "@nestjs/core"
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler"
import { LoggerModule } from "nestjs-pino"
import { ConfigModule } from "./config/config.module"
import { DatabaseModule } from "./database/database.module"
import { RedisModule } from "./redis/redis.module"
import { AuthModule } from "./auth/auth.module"
import { MailerModule } from "./mailer/mailer.module"
import { StorageModule } from "./storage/storage.module"
import { QueueModule } from "./queue/queue.module"
import { LocationModule } from "./location/location.module"
import { IpBanModule } from "./ip-ban/ip-ban.module"

@Global()
@Module({
	imports: [
		// Config must be first — all other modules depend on it
		ConfigModule,

		// Pino structured logging (serverless & Vercel compatible)
		LoggerModule.forRoot({
			pinoHttp: {
				level: process.env["NODE_ENV"] === "production" ? "info" : "debug",
			},
		}),

		// Throttler — global rate limiting
		ThrottlerModule.forRoot([
			{
				name: "short",
				ttl: 60000, // 1 minute
				limit: 20,
			},
			{
				name: "auth",
				ttl: 60000,
				limit: 5, // auth endpoints: 5 per minute
			},
		]),

		DatabaseModule,
		RedisModule,
		AuthModule,
		MailerModule,
		StorageModule,
		QueueModule,
		LocationModule,
		IpBanModule,
	],
	providers: [
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
	],
	exports: [
		AuthModule,
		RedisModule,
		MailerModule,
		StorageModule,
		QueueModule,
		LocationModule,
		IpBanModule,
	],
})
export class CoreModule {}
