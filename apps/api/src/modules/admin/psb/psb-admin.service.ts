import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Registrant } from "../../psb/entities/registrant.entity"
import { Student } from "../../santri/entities/student.entity"
import { StudentGrade } from "../../santri/entities/student-grade.entity"
import { AcademicYear } from "@shared/master/entities/academic-year.entity"
import {
	PsbRegistrantFilterDto,
	UpdateRegistrantDto,
	UpdateRegistrantStatusDto,
	CreateRegistrantManualDto,
} from "@admin/dto/psb-admin.dto"

@Injectable()
export class PsbAdminService {
	constructor(
		@InjectRepository(Registrant)
		private readonly registrantRepo: Repository<Registrant>,
		@InjectRepository(Student)
		private readonly studentRepo: Repository<Student>,
		@InjectRepository(StudentGrade)
		private readonly studentGradeRepo: Repository<StudentGrade>,
		@InjectRepository(AcademicYear)
		private readonly academicYearRepo: Repository<AcademicYear>,
	) {}

	async getAcademicYearsStats() {
		const academicYears = await this.academicYearRepo.find({
			order: { id: "DESC" },
		})

		const results = []
		for (const ay of academicYears) {
			const registrants = await this.registrantRepo.find({
				where: { academicYearId: ay.id },
			})

			const totalRegistrants = registrants.length
			const regulerCount = registrants.filter((r) => r.registrationPath === "reguler").length
			const indentCount = registrants.filter((r) => r.registrationPath === "indent").length
			const approvedCount = registrants.filter((r) => r.approvalStatus === "approve").length
			const rejectedCount = registrants.filter((r) => r.approvalStatus === "reject").length

			results.push({
				id: ay.id,
				year: ay.year || String(ay.id),
				totalRegistrants,
				regulerCount,
				indentCount,
				approvedCount,
				rejectedCount,
			})
		}

		return results
	}

	async findAllRegistrants(academicYearId: number, query: PsbRegistrantFilterDto) {
		const { status, registrationPath, levelId, search, page = 1, limit = 10 } = query
		const qb = this.registrantRepo.createQueryBuilder("r")

		qb.where("r.academic_year_id = :academicYearId", { academicYearId })

		if (status) {
			qb.andWhere("r.approval_status = :status", { status })
		}
		if (registrationPath) {
			qb.andWhere("r.registration_path = :registrationPath", { registrationPath })
		}
		if (levelId) {
			qb.andWhere("r.level_id = :levelId", { levelId })
		}
		if (search) {
			qb.andWhere("(r.fullname ILIKE :search OR r.email ILIKE :search OR r.registrant_id ILIKE :search)", {
				search: `%${search}%`,
			})
		}

		qb.orderBy("r.id", "DESC")
		qb.skip((page - 1) * limit).take(limit)

		const [items, total] = await qb.getManyAndCount()
		return {
			data: items,
			meta: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		}
	}


	async exportRegistrants(academicYearId: number, status?: string) {
		const qb = this.registrantRepo.createQueryBuilder("r")
		qb.where("r.academic_year_id = :academicYearId", { academicYearId })
		if (status) {
			qb.andWhere("r.approval_status = :status", { status })
		}
		qb.orderBy("r.id", "ASC")
		return qb.getMany()
	}

	async findRegistrantById(id: number) {
		const registrant = await this.registrantRepo.findOne({ where: { id } })
		if (!registrant) {
			throw new NotFoundException(`Registrant with ID ${id} not found`)
		}
		return registrant
	}

	async updateRegistrant(id: number, dto: UpdateRegistrantDto) {
		const registrant = await this.findRegistrantById(id)
		Object.assign(registrant, dto)
		return this.registrantRepo.save(registrant)
	}

	async updateRegistrantStatus(id: number, dto: UpdateRegistrantStatusDto) {
		const registrant = await this.findRegistrantById(id)

		if (dto.approvalStatus) registrant.approvalStatus = dto.approvalStatus
		if (dto.dataValidation) registrant.dataValidation = dto.dataValidation
		if (dto.dataValidationNote !== undefined) registrant.dataValidationNote = dto.dataValidationNote
		if (dto.levelId) registrant.levelId = dto.levelId

		const saved = await this.registrantRepo.save(registrant)

		if (dto.approvalStatus === "approve") {
			await this.autoProvisionStudent(saved)
		}

		return saved
	}

	async createRegistrantManual(dto: CreateRegistrantManualDto) {
		const count = await this.registrantRepo.count()
		const regCode = `REG-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`

		const newRegistrant = this.registrantRepo.create({
			academicYearId: dto.academicYearId,
			levelId: dto.levelId,
			registrationPath: dto.registrationPath,
			fullname: dto.fullname,
			email: dto.email,
			gender: dto.gender,
			phone: dto.phone ?? null,
			nisn: dto.nisn ?? null,
			nik: dto.nik ?? null,
			registrantId: regCode,
			registeredByAdmin: true,
			approvalStatus: "wait",
			dataValidation: "valid",
		})

		return this.registrantRepo.save(newRegistrant)
	}

	private async autoProvisionStudent(registrant: Registrant) {
		if (!registrant.email) return

		let student = await this.studentRepo.findOne({
			where: { email: registrant.email },
		})

		if (!student) {
			student = this.studentRepo.create({
				email: registrant.email,
				nis: registrant.nis ?? null,
				academicYearId: registrant.academicYearId,
				source: "pendaftaran",
				studentStatus: "active",
			})
			student = await this.studentRepo.save(student)
		}

		const existingGrade = await this.studentGradeRepo.findOne({
			where: { studentId: student.id, gradeStatus: "active" },
		})

		if (!existingGrade) {
			const ay = registrant.academicYearId ? String(registrant.academicYearId) : "2024/2025"
			const newGrade = this.studentGradeRepo.create({
				studentId: student.id,
				fullname: registrant.fullname,
				shortname: registrant.shortname,
				gender: registrant.gender,
				levelId: registrant.levelId,
				currentAcademicYear: ay,
				gradeStatus: "active",
				gradeNote: "pendaftaran",
				source: "pendaftaran",
				nisn: registrant.nisn,
				nik: registrant.nik,
				phone: registrant.phone,
			})
			await this.studentGradeRepo.save(newGrade)
		}
	}
}
