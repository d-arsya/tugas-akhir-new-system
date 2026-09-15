import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import * as bcrypt from "bcrypt"
import { Like, Repository } from "typeorm"
import { User } from "@admin/entities/user.entity"
import type { CreateUserDto, UpdateUserDto } from "@admin/dto/user-management.dto"
import type { PaginationQueryDto } from "@core/dto/pagination-query.dto"

@Injectable()
export class UserManagementService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
	) {}

	async findAll(query: PaginationQueryDto) {
		const page = query.page ?? 1
		const limit = query.limit ?? 10
		const skip = (page - 1) * limit
		const search = query.search?.trim()

		const where = search
			? [{ name: Like(`%${search}%`) }, { email: Like(`%${search}%`) }]
			: {}

		const [items, total] = await this.userRepository.findAndCount({
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

	async findOne(id: number): Promise<User> {
		const user = await this.userRepository.findOneBy({ id })
		if (!user) throw new NotFoundException(`User admin dengan ID #${id} tidak ditemukan.`)
		return user
	}

	async create(dto: CreateUserDto): Promise<User> {
		const existing = await this.userRepository.findOneBy({ email: dto.email })
		if (existing) throw new BadRequestException("Email sudah terdaftar.")

		// Initial default password (e.g., admin123) marked as weakPassword = true
		const defaultPassword = "admin123"
		const hashedPassword = await bcrypt.hash(defaultPassword, 10)

		const user = this.userRepository.create({
			name: dto.name,
			email: dto.email,
			gender: dto.gender ?? null,
			role: dto.role,
			password: hashedPassword,
			weakPassword: true,
			isBlocked: false,
		})

		return this.userRepository.save(user)
	}

	async update(id: number, dto: UpdateUserDto): Promise<User> {
		const user = await this.findOne(id)
		if (dto.email && dto.email !== user.email) {
			const existing = await this.userRepository.findOneBy({ email: dto.email })
			if (existing) throw new BadRequestException("Email sudah digunakan pengguna lain.")
		}

		if (dto.name !== undefined) user.name = dto.name
		if (dto.email !== undefined) user.email = dto.email
		if (dto.gender !== undefined) user.gender = dto.gender
		if (dto.role !== undefined) user.role = dto.role

		return this.userRepository.save(user)
	}

	async toggleBlock(id: number): Promise<{ success: boolean; isBlocked: boolean }> {
		const user = await this.findOne(id)
		user.isBlocked = !user.isBlocked
		user.blockedAt = user.isBlocked ? new Date() : null
		await this.userRepository.save(user)
		return { success: true, isBlocked: !!user.isBlocked }
	}

	async remove(id: number): Promise<{ success: boolean; message: string }> {
		const user = await this.findOne(id)
		await this.userRepository.remove(user)
		return { success: true, message: `User admin #${id} berhasil dihapus.` }
	}
}
