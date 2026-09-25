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

	// Counters (rate limits, strike counters) — used by the admin Dompet module.

	/**
	 * Adds one to the counter and answers the new value. The key is created with `windowSeconds`
	 * to live when it does not exist (`SET … EX NX`, then `INCR`, in one MULTI), so the window is
	 * fixed from the first hit and a crash between the two commands cannot leave a key without a TTL.
	 */
	async incrWithWindow(key: string, windowSeconds: number): Promise<number> {
		const results = await this.redis.multi().set(key, 0, "EX", windowSeconds, "NX").incr(key).exec()
		const incr = results?.[1]
		if (!incr || incr[0]) throw incr?.[0] ?? new Error("Redis INCR failed")
		return Number(incr[1])
	}

	/** Deletes the key and says whether it was there — exactly one concurrent caller gets `true`. */
	async delIfPresent(key: string): Promise<boolean> {
		return (await this.redis.del(key)) === 1
	}

	/** Restarts the key's time-to-live. */
	async expire(key: string, ttlSeconds: number): Promise<void> {
		await this.redis.expire(key, ttlSeconds)
	}

	/** Seconds left on the key; 0 when it is missing or has no expiry. */
	async ttlSeconds(key: string): Promise<number> {
		const ttl = await this.redis.ttl(key)
		return ttl > 0 ? ttl : 0
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
