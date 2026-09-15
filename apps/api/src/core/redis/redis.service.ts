import { Inject, Injectable } from "@nestjs/common"
import Redis from "ioredis"
import { REDIS_CLIENT } from "@core/redis/redis.constants"

@Injectable()
export class RedisService {
	constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

	async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
		if (ttlSeconds !== undefined) {
			await this.redis.set(key, value, "EX", ttlSeconds)
		} else {
			await this.redis.set(key, value)
		}
	}

	async get(key: string): Promise<string | null> {
		return this.redis.get(key)
	}

	async del(key: string): Promise<void> {
		await this.redis.del(key)
	}

	async exists(key: string): Promise<boolean> {
		const result = await this.redis.exists(key)
		return result === 1
	}

	// Refresh token helpers with domain scoping (admin, santri, psb, merchant)
	refreshTokenKey(domain: string, userId: number, tokenId: string): string {
		return `refresh:${domain}:${userId}:${tokenId}`
	}

	async storeRefreshToken(domain: string, userId: number, tokenId: string, ttlSeconds: number): Promise<void> {
		await this.set(this.refreshTokenKey(domain, userId, tokenId), "valid", ttlSeconds)
	}

	async validateRefreshToken(domain: string, userId: number, tokenId: string): Promise<boolean> {
		return this.exists(this.refreshTokenKey(domain, userId, tokenId))
	}

	async revokeRefreshToken(domain: string, userId: number, tokenId: string): Promise<void> {
		await this.del(this.refreshTokenKey(domain, userId, tokenId))
	}
}
