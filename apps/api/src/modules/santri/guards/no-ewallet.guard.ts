import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common"
import type { Request } from "express"
import type { JwtPayload } from "@core/auth/strategies/jwt.strategy"
import { EwalletFacade } from "@modules/ewallet/ewallet.facade"

@Injectable()
export class NoEwalletGuard implements CanActivate {
	constructor(private readonly ewalletFacade: EwalletFacade) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<Request>()
		const user = request.user as JwtPayload | undefined

		if (!user || !user.sub) {
			throw new UnauthorizedException("Sesi tidak ditemukan")
		}

		const ewallet = await this.ewalletFacade.findEwallet("App\\Models\\Student", user.sub)

		if (ewallet) {
			throw new ForbiddenException("Santri sudah memiliki E-Wallet.")
		}

		return true
	}
}
