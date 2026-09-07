import { BullModule } from "@nestjs/bullmq"
import { Module } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { EMAIL_QUEUE, EXPORT_QUEUE } from "@core/queue/queue.constants"
import { EmailProcessor } from "@core/queue/processors/email.processor"
import { ExportProcessor } from "@core/queue/processors/export.processor"
import type { Env } from "@core/config/env.validation"

export { EMAIL_QUEUE, EXPORT_QUEUE } from "@core/queue/queue.constants"

@Module({
	imports: [
		BullModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (configService: ConfigService<Env, true>) => ({
				connection: {
					url: configService.get("REDIS_URL", { infer: true }),
					maxRetriesPerRequest: null,
					lazyConnect: true,
					enableReadyCheck: false,
					retryStrategy: (times: number) => Math.min(times * 500, 5000),
				},
			}),
		}),
		BullModule.registerQueue({ name: EMAIL_QUEUE }, { name: EXPORT_QUEUE }),
	],
	providers: [EmailProcessor, ExportProcessor],
	exports: [BullModule],
})
export class QueueModule {}
