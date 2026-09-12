import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common"
import type { Request } from "express"
import type { Merchant } from "@merchant/entities/merchant.entity"

@Injectable()
export class ActiveMerchantGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<Request>()
		const user = request.user as Merchant | undefined

		if (user && user.isBlocked) {
			throw new ForbiddenException("Akun Merchant Anda saat ini sedang dinonaktifkan atau diblokir.")
		}

		return true
	}
}
