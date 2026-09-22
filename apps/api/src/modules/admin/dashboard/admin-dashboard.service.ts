import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Not, Repository } from "typeorm"
import { Registrant } from "@psb/entities/registrant.entity"
import { StudentGrade } from "@santri/entities/student-grade.entity"
import { AcademicYear } from "@shared/master/entities/academic-year.entity"
import { Grade } from "@shared/master/entities/grade.entity"

// Academic year id 1 is the "Archive" bucket and is hidden from the dashboard filter
const ARCHIVE_ACADEMIC_YEAR_ID = 1

// tbr_grades.label / tbr_student_grades.grade are BIGINT in the DB; node-postgres returns them as strings
const toLabel = (value: number | string | null): number | null => (value === null ? null : Number(value))

export type DashboardStats = { total: number; approve: number; reject: number }
export type DashboardChartItem = { category: string; value: number }
export type DashboardPieItem = { grade: string; value: number }
export type DashboardOptions = {
	academicYears: { id: number; year: string }[]
	grades: { label: number }[]
}

// Port of legacy admin.pondokroja.com DashboardController
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
	) { }

	// Legacy countPSB(): no year = every registrant. Legacy compared the selected year with `===`
	// (int vs request string), so approve/reject were always 0 when filtered — fixed here.
	async getStats(academicYearId?: number): Promise<DashboardStats> {
		const qb = this.registrantRepo
			.createQueryBuilder("r")
			.select("COUNT(*)", "total")
			.addSelect("COUNT(*) FILTER (WHERE r.approval_status = 'approve')", "approve")
			.addSelect("COUNT(*) FILTER (WHERE r.approval_status = 'reject')", "reject")
		if (academicYearId !== undefined) {
			qb.where("r.academic_year_id = :academicYearId", { academicYearId })
		}
		const row = await qb.getRawOne<{ total: string; approve: string; reject: string }>()
		return {
			total: Number(row?.total ?? 0),
			approve: Number(row?.approve ?? 0),
			reject: Number(row?.reject ?? 0),
		}
	}

	async getOptions(): Promise<DashboardOptions> {
		const [academicYears, grades] = await Promise.all([
			this.academicYearRepo.find({
				where: { id: Not(ARCHIVE_ACADEMIC_YEAR_ID) },
				order: { activeKbm: "DESC" },
			}),
			this.gradeRepo.find({ order: { label: "ASC" } }),
		])
		return {
			academicYears: academicYears.map((ay) => ({ id: ay.id, year: ay.year ?? "" })),
			grades: grades.flatMap((g) => {
				const label = toLabel(g.label)
				return label === null ? [] : [{ label }]
			}),
		}
	}

	// Legacy chartStudent(): student_grades rows per year for the 5 years ending at the latest
	// `current_academic_year` string, filtered by grade label
	async getChartStudent(gradeLabel: number): Promise<DashboardChartItem[]> {
		const latest = await this.studentGradeRepo
			.createQueryBuilder("sg")
			.select("MAX(sg.current_academic_year)", "year")
			.where("sg.deleted_at IS NULL")
			// Archived rows hold "archive", which would sort above every "YYYY/YYYY" string
			.andWhere("sg.current_academic_year ~ '^[0-9]{4}/[0-9]{4}$'")
			.getRawOne<{ year: string | null }>()
		if (!latest?.year) return []

		const startYear = Number.parseInt(latest.year.split("/")[0] ?? "", 10)
		// Oldest first: e.g. latest "2025/2026" → 2021/2022 … 2025/2026
		const years = [4, 3, 2, 1, 0].map((i) => `${startYear - i}/${startYear - i + 1}`)

		const rows = await this.studentGradeRepo
			.createQueryBuilder("sg")
			.select("sg.current_academic_year", "year")
			.addSelect("COUNT(*)", "count")
			.where("sg.deleted_at IS NULL")
			.andWhere("sg.grade = :gradeLabel", { gradeLabel })
			.andWhere("sg.current_academic_year IN (:...years)", { years })
			.groupBy("sg.current_academic_year")
			.getRawMany<{ year: string; count: string }>()

		const counts = new Map(rows.map((r) => [r.year, Number(r.count)]))
		return years.map((year) => ({ category: year, value: counts.get(year) ?? 0 }))
	}

	// Legacy pieChartData(): active students per grade in the current academic year + "Keluar"
	async getPieChart(): Promise<DashboardPieItem[]> {
		const grades = await this.gradeRepo.find({ order: { label: "ASC" } })
		if (grades.length === 0) return []

		const current = await this.academicYearRepo.findOneBy({ isCurrent: true })
		const now = new Date().getFullYear()
		const year = current?.year ?? `${now - 1}/${now}`

		const activeRows = await this.studentGradeRepo
			.createQueryBuilder("sg")
			.innerJoin("tbr_students", "s", "s.id = sg.student_id AND s.deleted_at IS NULL")
			.select("sg.grade", "grade")
			.addSelect("COUNT(DISTINCT s.id)", "count")
			.where("sg.deleted_at IS NULL")
			.andWhere("sg.current_academic_year = :year", { year })
			.andWhere("sg.grade_status = 'active'")
			.andWhere("s.student_status = 'active'")
			.groupBy("sg.grade")
			.getRawMany<{ grade: number; count: string }>()
		const activeByGrade = new Map(activeRows.map((r) => [Number(r.grade), Number(r.count)]))

		const leftRow = await this.studentGradeRepo
			.createQueryBuilder("sg")
			.innerJoin("tbr_students", "s", "s.id = sg.student_id AND s.deleted_at IS NULL")
			.select("COUNT(DISTINCT s.id)", "count")
			.where("sg.deleted_at IS NULL")
			.andWhere("sg.current_academic_year = :year", { year })
			.andWhere("sg.grade_note = 'keluar'")
			.andWhere("s.student_status = 'inactive'")
			.getRawOne<{ count: string }>()

		return [
			...grades.map((g) => {
				const label = toLabel(g.label)
				return { grade: `Kelas ${label ?? ""}`, value: label === null ? 0 : (activeByGrade.get(label) ?? 0) }
			}),
			{ grade: "Keluar", value: Number(leftRow?.count ?? 0) },
		]
	}
}
