import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Like, Repository } from "typeorm"
import { AuthLog } from "../entities/auth-log.entity"
import type { PaginationQueryDto } from "../../../core/dto/pagination-query.dto"

@Injectable()
export class AuthLogService {
	constructor(
		@InjectRepository(AuthLog)
		private readonly authLogRepository: Repository<AuthLog>,
	) {}

	async findAll(query: PaginationQueryDto) {
		const page = query.page ?? 1
		const limit = query.limit ?? 15
		const skip = (page - 1) * limit
		const search = query.search?.trim()

		const where = search
			? [{ email: Like(`%${search}%`) }, { ipAddress: Like(`%${search}%`) }]
			: {}

		const [items, total] = await this.authLogRepository.findAndCount({
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
}
