import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { IpBanService } from "@core/ip-ban/ip-ban.service"
import type { Request } from "express"

@Injectable()
export class IpBanGuard implements CanActivate {
	constructor(private readonly ipBanService: IpBanService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<Request>()
		const ip = request.ip ?? request.socket.remoteAddress ?? ""
		return this.ipBanService.isAllowed(ip)
	}
}
