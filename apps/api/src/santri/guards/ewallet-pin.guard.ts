import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common"
import type { Request } from "express"
import type { JwtPayload } from "../../core/auth/strategies/jwt.strategy"
import { RedisService } from "../../core/redis/redis.service"

@Injectable()
export class EwalletPinGuard implements CanActivate {
	constructor(private readonly redisService: RedisService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<Request>()
		const user = request.user as JwtPayload | undefined

		if (!user || !user.sub) {
			throw new UnauthorizedException("Sesi tidak ditemukan")
		}

		const pinKey = `santri-ewallet-pin:${user.sub}`
		const isPinVerified = await this.redisService.exists(pinKey)

		if (!isPinVerified) {
			throw new ForbiddenException("Verifikasi PIN e-wallet diperlukan untuk melanjutkan.")
		}

		return true
	}
}
