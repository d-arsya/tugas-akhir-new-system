import { Global, Module } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import Redis from "ioredis"
import { REDIS_CLIENT } from "./redis.constants"
import { RedisService } from "./redis.service"
import type { Env } from "../config/env.validation"

export { REDIS_CLIENT } from "./redis.constants"

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
