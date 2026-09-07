import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { SettingSchool } from "@shared/school/entities/setting-school.entity"
import { StudentGrade } from "@santri/entities/student-grade.entity"
import { Student } from "@santri/entities/student.entity"

@Injectable()
export class ProfileService {
	constructor(
		@InjectRepository(Student)
		private readonly studentRepository: Repository<Student>,
		@InjectRepository(StudentGrade)
		private readonly studentGradeRepository: Repository<StudentGrade>,
		@InjectRepository(SettingSchool)
		private readonly schoolRepository: Repository<SettingSchool>,
	) {}

	async getProfile(studentId: number) {
		const student = await this.studentRepository.findOne({
			where: { id: studentId },
		})

		if (!student) {
			throw new NotFoundException("Data santri tidak ditemukan")
		}

		const activeGrade = await this.studentGradeRepository.findOne({
			where: { studentId, gradeStatus: "active" },
		})

		const school = await this.schoolRepository.findOne({
			where: {},
			order: { id: "ASC" },
		})

		return {
			student: {
				id: student.id,
				nis: student.nis,
				email: student.email,
				emailVerifiedAt: student.emailVerifiedAt,
				enabled2fa: student.enabled2fa,
				studentStatus: student.studentStatus,
				academicYearId: student.academicYearId,
			},
			activeGrade: activeGrade
				? {
						id: activeGrade.id,
						fullname: activeGrade.fullname,
						shortname: activeGrade.shortname,
						gender: activeGrade.gender,
						religion: activeGrade.religion,
						placeOfBirth: activeGrade.placeOfBirth,
						dateOfBirth: activeGrade.dateOfBirth,
						grade: activeGrade.grade,
						subGrade: activeGrade.subGrade,
						levelId: activeGrade.levelId,
						majorName: activeGrade.majorName,
						currentAcademicYear: activeGrade.currentAcademicYear,
						phone: activeGrade.phone,
						attachPhoto: activeGrade.attachPhoto,
				  }
				: null,
			school: school
				? {
						name: school.name,
						slogan: school.slogan,
						logo: school.logo,
						favicon: school.favicon,
						phone: school.phone,
						fullAddress: school.fullAddress,
				  }
				: null,
		}
	}
}
