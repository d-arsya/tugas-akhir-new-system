import { Injectable, UnauthorizedException } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { JwtAuthGuard } from "../../core/auth/guards/jwt-auth.guard"
import type { JwtPayload } from "../../core/auth/strategies/jwt.strategy"

@Injectable()
export class SantriJwtAuthGuard extends JwtAuthGuard {
	constructor(reflector: Reflector) {
		super(reflector)
	}

	override handleRequest<T extends JwtPayload>(err: Error | null, user: T | false): T {
		if (err || !user) {
			throw err ?? new UnauthorizedException("Autentikasi gagal atau sesi telah berakhir")
		}
		if (user.domain !== "santri") {
			throw new UnauthorizedException("Token domain tidak valid untuk Santri")
		}
		return user
	}
}
