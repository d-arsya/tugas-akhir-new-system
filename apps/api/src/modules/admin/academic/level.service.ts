import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Level } from "@shared/master/entities/level.entity"
import { LevelAcademicYear } from "@shared/master/entities/level-academic-year.entity"
import type { CreateLevelDto, LinkLevelAcademicYearDto, UpdateLevelDto } from "@admin/dto/academic.dto"

@Injectable()
export class LevelService {
	constructor(
		@InjectRepository(Level)
		private readonly levelRepository: Repository<Level>,
		@InjectRepository(LevelAcademicYear)
		private readonly levelAcademicYearRepository: Repository<LevelAcademicYear>,
	) {}

	async findAll(): Promise<Level[]> {
		return this.levelRepository.find({ order: { id: "ASC" } })
	}

	async getList() {
		const levels = await this.levelRepository.find({ order: { id: "ASC" } })
		return levels.map((l) => ({ id: l.id, name: l.name }))
	}

	async findOne(id: number): Promise<Level> {
		const level = await this.levelRepository.findOneBy({ id })
		if (!level) throw new NotFoundException(`Jenjang pendidikan #${id} tidak ditemukan.`)
		return level
	}

	async create(dto: CreateLevelDto): Promise<Level> {
		const level = new Level()
		level.name = dto.name
		level.status = "show"
		return this.levelRepository.save(level)
	}

	async update(id: number, dto: UpdateLevelDto): Promise<Level> {
		const level = await this.findOne(id)
		if (dto.name !== undefined) level.name = dto.name
		return this.levelRepository.save(level)
	}

	async linkAcademicYear(levelId: number, dto: LinkLevelAcademicYearDto): Promise<LevelAcademicYear> {
		await this.findOne(levelId)
		let link = await this.levelAcademicYearRepository.findOneBy({
			levelId,
			academicYearId: dto.academicYearId,
		})

		if (link) {
			link.quota = dto.quota
		} else {
			link = this.levelAcademicYearRepository.create({
				levelId,
				academicYearId: dto.academicYearId,
				quota: dto.quota,
			})
		}
		return this.levelAcademicYearRepository.save(link)
	}

	async remove(id: number): Promise<{ success: boolean; message: string }> {
		const level = await this.findOne(id)
		await this.levelRepository.remove(level)
		return { success: true, message: `Jenjang #${id} berhasil dihapus.` }
	}
}
