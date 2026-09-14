import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Registrant } from "../../psb/entities/registrant.entity"
import { StudentGrade } from "../../santri/entities/student-grade.entity"
import { AcademicYear } from "../../../shared/master/entities/academic-year.entity"
import { Grade } from "../../../shared/master/entities/grade.entity"

@Injectable()
export class AdminDashboardService {
	constructor(
		@InjectRepository(Registrant)
		private readonly registrantRepo: Repository<Registrant>,
		@InjectRepository(StudentGrade)
		private readonly studentGradeRepo: Repository<StudentGrade>,
		@InjectRepository(AcademicYear)
		private readonly academicYearRepo: Repository<AcademicYear>,
		@InjectRepository(Grade)
		private readonly gradeRepo: Repository<Grade>,
	) {}

	async getStats(academicYearId?: number) {
		let currentAy: AcademicYear | null = null
		if (academicYearId) {
			currentAy = await this.academicYearRepo.findOneBy({ id: academicYearId })
		} else {
			currentAy = await this.academicYearRepo.findOneBy({ isCurrent: true })
		}

		const ayId = currentAy?.id
		const registrants = ayId
			? await this.registrantRepo.find({ where: { academicYearId: ayId } })
			: await this.registrantRepo.find()

		const total = registrants.length
		const approve = registrants.filter((r) => r.approvalStatus === "approve").length
		const reject = registrants.filter((r) => r.approvalStatus === "reject").length
		const wait = registrants.filter((r) => r.approvalStatus === "wait" || !r.approvalStatus).length

		const activeStudents = await this.studentGradeRepo.find({
			where: { gradeStatus: "active" },
		})

		const totalActive = activeStudents.length
		const totalMale = activeStudents.filter((s) => s.gender === "male").length
		const totalFemale = activeStudents.filter((s) => s.gender === "female").length

		return {
			psb: { total, approve, reject, wait },
			students: { totalActive, totalMale, totalFemale },
			academicYear: currentAy?.year || null,
		}
	}

	async getChartStudent(gradeId?: number) {
		const academicYears = await this.academicYearRepo.find({
			order: { id: "DESC" },
			take: 5,
		})

		const data = []
		for (const ay of academicYears.reverse()) {
			const qb = this.studentGradeRepo.createQueryBuilder("sg")
			qb.where("sg.grade_status = :status", { status: "active" })
			qb.andWhere("sg.current_academic_year = :year", { year: ay.year })
			if (gradeId) {
				qb.andWhere("sg.grade = :gradeId", { gradeId })
			}
			const count = await qb.getCount()
			data.push({
				category: ay.year || String(ay.id),
				value: count,
			})
		}

		return { data }
	}

	async getPieChart() {
		const grades = await this.gradeRepo.find({ order: { id: "ASC" } })
		const currentAy = await this.academicYearRepo.findOneBy({ isCurrent: true })
		const currentYear = currentAy?.year ?? "2024/2025"

		const data = []
		for (const g of grades) {
			const count = await this.studentGradeRepo.count({
				where: {
					grade: g.id,
					gradeStatus: "active",
					currentAcademicYear: currentYear,
				},
			})
			data.push({
				grade: `Kelas ${g.id}`,
				value: count,
			})
		}

		return { data }
	}
}
