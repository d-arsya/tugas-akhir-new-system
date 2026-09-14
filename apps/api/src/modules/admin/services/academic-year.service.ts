import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Like, Repository } from "typeorm"
import { AcademicYear } from "../../../shared/master/entities/academic-year.entity"
import { LevelAcademicYear } from "../../../shared/master/entities/level-academic-year.entity"
import { Registrant } from "../../psb/entities/registrant.entity"
import { StudentGrade } from "../../santri/entities/student-grade.entity"
import type { CreateAcademicYearDto, DelegateAcademicYearDto, UpdateAcademicYearDto } from "../dto/academic.dto"
import type { PaginationQueryDto } from "../../../core/dto/pagination-query.dto"

@Injectable()
export class AcademicYearService {
	constructor(
		@InjectRepository(AcademicYear)
		private readonly academicYearRepository: Repository<AcademicYear>,
		@InjectRepository(LevelAcademicYear)
		private readonly levelAcademicYearRepo: Repository<LevelAcademicYear>,
		@InjectRepository(Registrant)
		private readonly registrantRepo: Repository<Registrant>,
		@InjectRepository(StudentGrade)
		private readonly studentGradeRepo: Repository<StudentGrade>,
	) {}

	async findAll(query: PaginationQueryDto) {
		const page = query.page ?? 1
		const limit = query.limit ?? 10
		const skip = (page - 1) * limit
		const search = query.search?.trim()

		const where = search ? [{ year: Like(`%${search}%`) }] : {}

		const [items, total] = await this.academicYearRepository.findAndCount({
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

	async findOne(id: number): Promise<AcademicYear> {
		const academicYear = await this.academicYearRepository.findOneBy({ id })
		if (!academicYear) throw new NotFoundException(`Tahun akademik #${id} tidak ditemukan.`)
		return academicYear
	}

	async create(dto: CreateAcademicYearDto): Promise<AcademicYear> {
		const existing = await this.academicYearRepository.findOneBy({ year: dto.year })
		if (existing) throw new BadRequestException(`Tahun akademik "${dto.year}" sudah ada.`)

		if (dto.isCurrent) {
			await this.academicYearRepository.update({}, { isCurrent: false })
		}

		const academicYear = new AcademicYear()
		academicYear.year = dto.year
		academicYear.type = dto.type ?? "reguler"
		academicYear.activeKbm = dto.activeKbm ?? null
		academicYear.costDateStart = dto.costDateStart ?? null
		academicYear.costDateEnd = dto.costDateEnd ?? null
		academicYear.serialNumber = dto.serialNumber ?? null
		academicYear.note = dto.note ?? null
		academicYear.status = dto.status ?? true
		academicYear.isCurrent = dto.isCurrent ?? false

		return this.academicYearRepository.save(academicYear)
	}

	async update(id: number, dto: UpdateAcademicYearDto): Promise<AcademicYear> {
		const academicYear = await this.findOne(id)
		if (dto.isCurrent) {
			await this.academicYearRepository.update({}, { isCurrent: false })
		}
		if (dto.year !== undefined) academicYear.year = dto.year
		if (dto.type !== undefined) academicYear.type = dto.type
		if (dto.activeKbm !== undefined) academicYear.activeKbm = dto.activeKbm
		if (dto.costDateStart !== undefined) academicYear.costDateStart = dto.costDateStart
		if (dto.costDateEnd !== undefined) academicYear.costDateEnd = dto.costDateEnd
		if (dto.serialNumber !== undefined) academicYear.serialNumber = dto.serialNumber
		if (dto.note !== undefined) academicYear.note = dto.note
		if (dto.status !== undefined) academicYear.status = dto.status
		if (dto.isCurrent !== undefined) academicYear.isCurrent = dto.isCurrent

		return this.academicYearRepository.save(academicYear)
	}

	async setCurrent(id: number): Promise<AcademicYear> {
		const academicYear = await this.findOne(id)
		await this.academicYearRepository.update({}, { isCurrent: false })
		academicYear.isCurrent = true
		return this.academicYearRepository.save(academicYear)
	}

	async remove(id: number): Promise<{ success: boolean; message: string }> {
		const academicYear = await this.findOne(id)
		await this.academicYearRepository.remove(academicYear)
		return { success: true, message: `Tahun akademik #${id} berhasil dihapus.` }
	}

	async getLevels(id: number) {
		await this.findOne(id)
		return this.levelAcademicYearRepo.find({
			where: { academicYearId: id },
		})
	}

	async delegateRegistrant(id: number, dto: DelegateAcademicYearDto) {
		await this.findOne(id)
		const targetAy = await this.findOne(dto.targetAcademicYearId)
		await this.registrantRepo.update(
			{ academicYearId: id },
			{ academicYearId: targetAy.id },
		)
		return { success: true, message: `Data pendaftar berhasil dipindahkan ke tahun ajaran ${targetAy.year}.` }
	}

	async delegateStudent(id: number, dto: DelegateAcademicYearDto) {
		await this.findOne(id)
		const targetAy = await this.findOne(dto.targetAcademicYearId)
		await this.studentGradeRepo.update(
			{ gradeStatus: "active" },
			{ currentAcademicYear: targetAy.year },
		)
		return { success: true, message: `Data santri aktif berhasil dialihkan ke tahun ajaran ${targetAy.year}.` }
	}

	async delegateAlumni(id: number, dto: DelegateAcademicYearDto) {
		await this.findOne(id)
		const targetAy = await this.findOne(dto.targetAcademicYearId)
		return { success: true, message: `Data alumni berhasil diarsipkan ke tahun ajaran ${targetAy.year}.` }
	}
}
