import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { SubGrade } from "../../../shared/master/entities/sub-grade.entity"
import type { CreateSubGradeDto, UpdateSubGradeDto } from "../dto/academic.dto"

@Injectable()
export class SubGradeService {
	constructor(
		@InjectRepository(SubGrade)
		private readonly subGradeRepository: Repository<SubGrade>,
	) {}

	async findAll(): Promise<SubGrade[]> {
		return this.subGradeRepository.find({ order: { label: "ASC" } })
	}

	async findOne(id: number): Promise<SubGrade> {
		const subGrade = await this.subGradeRepository.findOneBy({ id })
		if (!subGrade) throw new NotFoundException(`Sub-kelas #${id} tidak ditemukan.`)
		return subGrade
	}

	async create(dto: CreateSubGradeDto): Promise<SubGrade> {
		const subGrade = this.subGradeRepository.create(dto)
		return this.subGradeRepository.save(subGrade)
	}

	async update(id: number, dto: UpdateSubGradeDto): Promise<SubGrade> {
		const subGrade = await this.findOne(id)
		Object.assign(subGrade, dto)
		return this.subGradeRepository.save(subGrade)
	}

	async remove(id: number): Promise<{ success: boolean; message: string }> {
		const subGrade = await this.findOne(id)
		await this.subGradeRepository.remove(subGrade)
		return { success: true, message: `Sub-kelas #${id} berhasil dihapus.` }
	}
}
