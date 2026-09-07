import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { BannedIp } from "@core/ip-ban/entities/banned-ip.entity"

@Injectable()
export class IpBanService {
	constructor(
		@InjectRepository(BannedIp)
		private readonly bannedIpRepository: Repository<BannedIp>,
	) {}

	async isAllowed(ip: string): Promise<boolean> {
		const banned = await this.bannedIpRepository.findOneBy({ ipAddress: ip })
		return banned === null
	}

	async ban(ipAddress: string): Promise<BannedIp> {
		const existing = await this.bannedIpRepository.findOneBy({ ipAddress })
		if (existing !== null) return existing

		const bannedIp = this.bannedIpRepository.create({ ipAddress })
		return this.bannedIpRepository.save(bannedIp)
	}

	async unban(ipAddress: string): Promise<void> {
		await this.bannedIpRepository.delete({ ipAddress })
	}
}
