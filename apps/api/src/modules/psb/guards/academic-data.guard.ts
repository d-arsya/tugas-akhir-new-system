import { CanActivate, ExecutionContext, Injectable, BadRequestException } from "@nestjs/common"
import { RedisService } from "@core/redis/redis.service"
import type { Request } from "express"

@Injectable()
export class AcademicDataGuard implements CanActivate {
	constructor(private readonly redisService: RedisService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<Request>()
		const sessionId =
			(request.headers["x-session-id"] as string | undefined) ??
			(request.body as { sessionId?: string } | undefined)?.sessionId ??
			(request.query["sessionId"] as string | undefined)

		if (!sessionId) {
			throw new BadRequestException("Session pendaftaran tidak ditemukan. Silakan mulai pendaftaran dari awal.")
		}

		const exists = await this.redisService.exists(`psb-wizard:${sessionId}:email`)
		if (!exists) {
			throw new BadRequestException("Sesi pendaftaran Anda telah berakhir (kadaluarsa). Silakan mulai kembali.")
		}

		return true
	}
}
