import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { ROLES_KEY, type UserRole } from "@core/auth/decorators/roles.decorator"
import type { JwtPayload } from "@core/auth/strategies/jwt.strategy"
import type { Request } from "express"

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
			context.getHandler(),
			context.getClass(),
		])
		if (!requiredRoles || requiredRoles.length === 0) return true

		const request = context.switchToHttp().getRequest<Request>()
		const user = request.user as JwtPayload | undefined
		if (!user || !user.role) return false

		const normalize = (r: string) => r.toLowerCase().replace(/[\s\-_]/g, "")
		const userRoleNorm = normalize(user.role)

		return requiredRoles.some((role) => normalize(role) === userRoleNorm)
	}
}
