import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Like, Repository } from "typeorm"
import { BannedIp } from "@core/ip-ban/entities/banned-ip.entity"
import type { PaginationQueryDto } from "@core/dto/pagination-query.dto"

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

	async findAll(query: PaginationQueryDto) {
		const page = query.page ?? 1
		const limit = query.limit ?? 10
		const skip = (page - 1) * limit
		const search = query.search?.trim()

		const where = search ? { ipAddress: Like(`%${search}%`) } : {}

		const [items, total] = await this.bannedIpRepository.findAndCount({
			where,
			order: { createdAt: "DESC" },
			take: limit,
			skip,
		})

		return {
			items,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		}
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
