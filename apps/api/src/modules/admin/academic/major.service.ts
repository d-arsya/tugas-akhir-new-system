import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Major } from "@shared/master/entities/major.entity"
import type { CreateMajorDto, UpdateMajorDto } from "@admin/dto/academic.dto"

@Injectable()
export class MajorService {
	constructor(
		@InjectRepository(Major)
		private readonly majorRepository: Repository<Major>,
	) {}

	async findAll(levelId?: number): Promise<Major[]> {
		const where = levelId ? { levelId } : {}
		return this.majorRepository.find({ where, order: { id: "ASC" } })
	}

	async findByLevel(levelId: number): Promise<Major[]> {
		return this.majorRepository.find({ where: { levelId }, order: { id: "ASC" } })
	}

	async findOne(id: number): Promise<Major> {
		const major = await this.majorRepository.findOneBy({ id })
		if (!major) throw new NotFoundException(`Jurusan #${id} tidak ditemukan.`)
		return major
	}

	async create(dto: CreateMajorDto): Promise<Major> {
		const major = new Major()
		major.levelId = dto.levelId
		major.name = dto.name
		major.desc = dto.desc ?? null
		return this.majorRepository.save(major)
	}

	async update(id: number, dto: UpdateMajorDto): Promise<Major> {
		const major = await this.findOne(id)
		if (dto.levelId !== undefined) major.levelId = dto.levelId
		if (dto.name !== undefined) major.name = dto.name
		if (dto.desc !== undefined) major.desc = dto.desc
		return this.majorRepository.save(major)
	}

	async remove(id: number): Promise<{ success: boolean; message: string }> {
		const major = await this.findOne(id)
		await this.majorRepository.remove(major)
		return { success: true, message: `Jurusan #${id} berhasil dihapus.` }
	}
}
