import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common"
import type { Request } from "express"
import type { Registrant } from "@psb/entities/registrant.entity"

@Injectable()
export class ActiveMemberGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<Request>()
		const user = request.user as Registrant | undefined

		if (user && user.isBlocked) {
			throw new ForbiddenException("Akun pendaftaran Anda saat ini sedang dinonaktifkan atau diblokir.")
		}

		return true
	}
}
