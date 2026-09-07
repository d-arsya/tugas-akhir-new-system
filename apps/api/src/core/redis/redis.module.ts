import { Global, Module } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import Redis from "ioredis"
import { REDIS_CLIENT } from "@core/redis/redis.constants"
import { RedisService } from "@core/redis/redis.service"
import type { Env } from "@core/config/env.validation"

export { REDIS_CLIENT } from "@core/redis/redis.constants"

@Global()
@Module({
	providers: [
		{
			provide: REDIS_CLIENT,
			inject: [ConfigService],
			useFactory: (configService: ConfigService<Env, true>): Redis => {
				const client = new Redis(configService.get("REDIS_URL", { infer: true }), {
					lazyConnect: true,
					maxRetriesPerRequest: null,
					retryStrategy: (times: number) => Math.min(times * 500, 5000),
				})
				client.on("error", () => {
					// Handled gracefully when Redis is offline in local development
				})
				return client
			},
		},
		RedisService,
	],
	exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule {}
