import { Injectable, UnauthorizedException } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import type { JwtPayload } from "@core/auth/strategies/jwt.strategy"

@Injectable()
export class MerchantJwtRefreshGuard extends AuthGuard("jwt-refresh") {
	override handleRequest<T extends JwtPayload>(err: Error | null, user: T | false): T {
		if (err || !user) {
			throw err ?? new UnauthorizedException("Refresh token tidak valid atau telah kadaluarsa")
		}
		if (user.domain !== "merchant") {
			throw new UnauthorizedException("Token domain tidak valid untuk Merchant")
		}
		return user
	}
}
