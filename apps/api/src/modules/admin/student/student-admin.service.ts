import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Student } from "../../santri/entities/student.entity"
import { StudentGrade } from "../../santri/entities/student-grade.entity"
import { AcademicYear } from "@shared/master/entities/academic-year.entity"
import { Grade } from "@shared/master/entities/grade.entity"
import {
	StudentFilterDto,
	UpdateStudentGradeDto,
	UpdateStudentMajorDto,
	UpdateStudentSubGradeDto,
	UpdateStudentStatusDto,
	BulkStudentPromotionDto,
	BulkStudentRetentionDto,
	BulkStudentGraduationDto,
	BulkStudentDropoutDto,
	CreateStudentManualDto,
} from "@admin/dto/student-admin.dto"

@Injectable()
export class StudentAdminService {
	constructor(
		@InjectRepository(Student)
		private readonly studentRepo: Repository<Student>,
		@InjectRepository(StudentGrade)
		private readonly studentGradeRepo: Repository<StudentGrade>,
		@InjectRepository(AcademicYear)
		private readonly academicYearRepo: Repository<AcademicYear>,
		@InjectRepository(Grade)
		private readonly gradeRepo: Repository<Grade>,
	) {}

	async getAcademicYears() {
		return this.academicYearRepo.find({ order: { id: "DESC" } })
	}

	async getGradesForAcademicYear(academicYearId: number) {
		return this.gradeRepo.find({ order: { id: "ASC" } })
	}

	async findStudentsByGradeAndLevel(
		academicYearId: number,
		gradeId: number,
		levelId: number,
		query: StudentFilterDto,
	) {
		const { search, subGrade, status, page = 1, limit = 10 } = query
		const qb = this.studentGradeRepo.createQueryBuilder("sg")

		qb.where("sg.level_id = :levelId", { levelId })
		if (gradeId) qb.andWhere("sg.grade = :gradeId", { gradeId })
		if (subGrade) qb.andWhere("sg.sub_grade = :subGrade", { subGrade })
		if (status) qb.andWhere("sg.grade_status = :status", { status })

		if (search) {
			qb.andWhere("(sg.fullname ILIKE :search OR sg.nisn ILIKE :search OR sg.nik ILIKE :search)", {
				search: `%${search}%`,
			})
		}

		qb.orderBy("sg.id", "DESC")
		qb.skip((page - 1) * limit).take(limit)
		const [items, total] = await qb.getManyAndCount()

		return {
			data: items,
			meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
		}
	}



	async exportStudents(academicYearId: number, gradeId: number, levelId?: number) {
		const qb = this.studentGradeRepo.createQueryBuilder("sg")
		qb.where("sg.grade = :gradeId", { gradeId })
		if (levelId) qb.andWhere("sg.level_id = :levelId", { levelId })
		qb.andWhere("sg.grade_status = :status", { status: "active" })
		qb.orderBy("sg.fullname", "ASC")
		return qb.getMany()
	}

	async findStudentGradeById(studentGradeId: number) {
		const sg = await this.studentGradeRepo.findOne({ where: { id: studentGradeId } })
		if (!sg) throw new NotFoundException(`Student grade #${studentGradeId} not found`)
		return sg
	}

	async updateStudentGrade(studentGradeId: number, dto: UpdateStudentGradeDto) {
		const sg = await this.findStudentGradeById(studentGradeId)
		Object.assign(sg, dto)
		return this.studentGradeRepo.save(sg)
	}

	async updateMajor(studentGradeId: number, dto: UpdateStudentMajorDto) {
		const sg = await this.findStudentGradeById(studentGradeId)
		if (dto.majorName) sg.majorName = dto.majorName
		return this.studentGradeRepo.save(sg)
	}

	async updateSubGrade(studentGradeId: number, dto: UpdateStudentSubGradeDto) {
		const sg = await this.findStudentGradeById(studentGradeId)
		if (dto.subGradeName) sg.subGrade = dto.subGradeName
		return this.studentGradeRepo.save(sg)
	}

	async updateStatus(studentGradeId: number, dto: UpdateStudentStatusDto) {
		const sg = await this.findStudentGradeById(studentGradeId)
		sg.gradeStatus = dto.status as any
		return this.studentGradeRepo.save(sg)
	}

	async bulkNextGrades(dto: BulkStudentPromotionDto) {
		for (const id of dto.studentGradeIds) {
			const sg = await this.studentGradeRepo.findOne({ where: { id } })
			if (!sg) continue

			sg.gradeStatus = "inactive"
			sg.prevGradeNote = sg.gradeNote
			sg.gradeNote = "naik kelas"
			await this.studentGradeRepo.save(sg)

			const { id: _, createdAt: __, updatedAt: ___, ...sgData } = sg
			const nextGrade = this.studentGradeRepo.create({
				...sgData,
				grade: (sg.grade || 1) + 1,
				gradeStatus: "active",
				gradeNote: "kenaikan kelas",
				source: "santri lama",
			})
			await this.studentGradeRepo.save(nextGrade)
		}
		return { success: true, count: dto.studentGradeIds.length }
	}

	async bulkStayGrades(dto: BulkStudentRetentionDto) {
		for (const id of dto.studentGradeIds) {
			const sg = await this.studentGradeRepo.findOne({ where: { id } })
			if (!sg) continue

			sg.gradeStatus = "inactive"
			sg.gradeNote = "tinggal kelas"
			await this.studentGradeRepo.save(sg)

			const { id: _, createdAt: __, updatedAt: ___, ...sgData } = sg
			const stayGrade = this.studentGradeRepo.create({
				...sgData,
				gradeStatus: "active",
				gradeNote: "tinggal kelas",
				source: "santri lama",
			})
			await this.studentGradeRepo.save(stayGrade)
		}
		return { success: true, count: dto.studentGradeIds.length }
	}

	async bulkGraduate(dto: BulkStudentGraduationDto) {
		for (const id of dto.studentGradeIds) {
			const sg = await this.studentGradeRepo.findOne({ where: { id } })
			if (!sg) continue
			sg.gradeStatus = "inactive"
			sg.gradeNote = "lulus"
			await this.studentGradeRepo.save(sg)

			if (sg.studentId) {
				const s = await this.studentRepo.findOne({ where: { id: sg.studentId } })
				if (s) {
					s.studentStatus = "inactive"
					s.isBlocked = true
					await this.studentRepo.save(s)
				}
			}
		}
		return { success: true, count: dto.studentGradeIds.length }
	}

	async bulkDropout(dto: BulkStudentDropoutDto) {
		for (const id of dto.studentGradeIds) {
			const sg = await this.studentGradeRepo.findOne({ where: { id } })
			if (!sg) continue
			sg.gradeStatus = "inactive"
			sg.gradeNote = "keluar"
			if (dto.dropoutNote) sg.dropoutNote = dto.dropoutNote
			await this.studentGradeRepo.save(sg)

			if (sg.studentId) {
				const s = await this.studentRepo.findOne({ where: { id: sg.studentId } })
				if (s) {
					s.studentStatus = "inactive"
					s.isBlocked = true
					await this.studentRepo.save(s)
				}
			}
		}
		return { success: true, count: dto.studentGradeIds.length }
	}

	async createStudentManual(dto: CreateStudentManualDto) {
		let student = await this.studentRepo.findOne({ where: { email: dto.email } })
		if (!student) {
			student = this.studentRepo.create({
				email: dto.email,
				nis: dto.nis ?? null,
				academicYearId: dto.academicYearId,
				source: "santri lama",
				studentStatus: "active",
			})
			student = await this.studentRepo.save(student)
		}

		const newGrade = this.studentGradeRepo.create({
			studentId: student.id,
			fullname: dto.fullname,
			gender: dto.gender,
			levelId: dto.levelId,
			grade: dto.gradeId,
			currentAcademicYear: String(dto.academicYearId),
			registeredByAdmin: true,
			gradeStatus: "active",
			gradeNote: "santri lama",
			source: "santri lama",
			nisn: dto.nisn ?? null,
			phone: dto.phone ?? null,
		})

		return this.studentGradeRepo.save(newGrade)
	}

}
