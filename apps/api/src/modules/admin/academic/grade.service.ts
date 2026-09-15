import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Grade } from "@shared/master/entities/grade.entity"
import { Level } from "@shared/master/entities/level.entity"
import type { CreateGradeDto, UpdateGradeDto } from "@admin/dto/academic.dto"

@Injectable()
export class GradeService {
	constructor(
		@InjectRepository(Grade)
		private readonly gradeRepository: Repository<Grade>,
		@InjectRepository(Level)
		private readonly levelRepository: Repository<Level>,
	) {}

	async findAll(levelId?: number): Promise<Grade[]> {
		const where = levelId ? { levelId } : {}
		return this.gradeRepository.find({ where, order: { label: "ASC" } })
	}

	async findOne(id: number): Promise<Grade> {
		const grade = await this.gradeRepository.findOneBy({ id })
		if (!grade) throw new NotFoundException(`Kelas #${id} tidak ditemukan.`)
		return grade
	}

	async create(dto: CreateGradeDto): Promise<Grade> {
		const grade = this.gradeRepository.create(dto)
		return this.gradeRepository.save(grade)
	}

	async update(id: number, dto: UpdateGradeDto): Promise<Grade> {
		const grade = await this.findOne(id)
		Object.assign(grade, dto)
		return this.gradeRepository.save(grade)
	}

	async remove(id: number): Promise<{ success: boolean; message: string }> {
		const grade = await this.findOne(id)
		await this.gradeRepository.remove(grade)
		return { success: true, message: `Kelas #${id} berhasil dihapus.` }
	}

	async getLevelByGrade(gradeLabel: number) {
		const grade = await this.gradeRepository.findOne({ where: { label: gradeLabel } })
		if (!grade || !grade.levelId) {
			return { level: null }
		}
		const level = await this.levelRepository.findOneBy({ id: grade.levelId })
		return { level }
	}
}
