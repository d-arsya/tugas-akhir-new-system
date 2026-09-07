import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common"
import type { Request } from "express"
import type { Student } from "@santri/entities/student.entity"

@Injectable()
export class ActiveStudentGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<Request>()
		const user = request.user as Student | undefined

		if (user && user.isBlocked) {
			throw new ForbiddenException("Akun santri Anda saat ini sedang dinonaktifkan atau diblokir.")
		}

		return true
	}
}
