import { ForbiddenException, Injectable, NestMiddleware } from "@nestjs/common"
import type { NextFunction, Request, Response } from "express"
import { IpBanService } from "./ip-ban.service"

@Injectable()
export class IpBanMiddleware implements NestMiddleware {
	constructor(private readonly ipBanService: IpBanService) {}

	async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
		const ip = req.ip ?? req.socket.remoteAddress ?? ""
		const isAllowed = await this.ipBanService.isAllowed(ip)
		if (!isAllowed) {
			throw new ForbiddenException("Your IP address has been banned")
		}
		next()
	}
}
