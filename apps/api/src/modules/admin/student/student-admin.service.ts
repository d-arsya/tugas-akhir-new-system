import { Injectable, NotFoundException } from "@nestjs/common"
// Nest injects by the constructor parameter types at runtime (decorator metadata), so these stay value imports
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { DataSource, type EntityManager } from "typeorm"

import type {
	AdminStudentAcademicYear,
	AdminStudentCreated,
	AdminStudentDetail,
	AdminStudentGradeRow,
	AdminStudentOptions,
	AdminStudentRosterPage,
	AdminStudentRosterRow,
	AdminStudentYearRow,
	SocietyDisease,
	SocietyStepKey,
} from "@roja/types"

import { throwFieldErrors } from "../../../core/errors/field-errors"
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { StorageService } from "../../../core/storage/storage.service"
import { societyFileUrl } from "../../../shared/society/files"
import { renderSocietyPrintPage } from "../../../shared/society/print/society-print"
import { loadSocietyRecord } from "../../../shared/society/society-record"
import { validateSocietyInput, type SocietyRuleInput } from "../../../shared/society/society-rules"

import * as bulk from "./student-bulk"
import { destroyByGrade, destroyGradeRow } from "./student-delete"
import { UPDATE_SUCCESS } from "./student-grade-ops"
import { buildStudentWorkbook, type ExportRow, type ExportSetting } from "./student-export"
import { indoDateTime, toGradeRow, toNumber, toRosterRow, toYearRow, type GradeSqlRow, type RosterSqlRow, type YearSqlRow } from "./student-format"
import { createStudent, updateStudent } from "./student-save"
import * as sql from "./student-sql"

type SocietyInput = Pick<SocietyRuleInput, "values" | "diseases" | "files">

// Legacy `StudentController` (Akademik → Santri) and the `Student\*` wizard controllers. Owned by workstream AK-S.
// Reads are plain queries; every write runs in one transaction (approved fix) and answers legacy's message.
@Injectable()
export class StudentAdminService {
	constructor(
		private readonly dataSource: DataSource,
		private readonly storageService: StorageService,
	) {}

	private async yearOrFail(academicYearId: number): Promise<AdminStudentAcademicYear> {
		const rows = (await this.dataSource.query(sql.YEAR_SQL, [academicYearId])) as Array<{ id: string; year: string | null }>
		const row = rows[0]
		if (!row) throw new NotFoundException("Tahun ajaran tidak ditemukan")
		return { id: Number(row.id), year: row.year }
	}

	private write<T>(work: (manager: EntityManager) => Promise<T>): Promise<T> {
		return this.dataSource.transaction(work)
	}

	// ─── Reads ──────────────────────────────────────────────────────────────

	async findYears(): Promise<AdminStudentYearRow[]> {
		const rows = (await this.dataSource.query(sql.YEAR_LIST_SQL)) as YearSqlRow[]
		return rows.map(toYearRow)
	}

	findYear(academicYearId: number): Promise<AdminStudentAcademicYear> {
		return this.yearOrFail(academicYearId)
	}

	async findGrades(academicYearId: number): Promise<AdminStudentGradeRow[]> {
		const year = await this.yearOrFail(academicYearId)
		const rows = (await this.dataSource.query(sql.GRADE_LIST_SQL, [year.year])) as GradeSqlRow[]
		return rows.map(toGradeRow)
	}

	async findRosterPage(academicYearId: number, grade: number, levelId: number): Promise<AdminStudentRosterPage> {
		const academicYear = await this.yearOrFail(academicYearId)
		const [exists, maxGrade, level, majors, subGrades] = await Promise.all([
			this.dataSource.query(sql.ROSTER_EXISTS_SQL, [academicYear.year, grade, levelId]) as Promise<Array<{ exists: boolean }>>,
			this.dataSource.query(sql.MAX_GRADE_SQL) as Promise<Array<{ maxGrade: number }>>,
			this.dataSource.query(sql.LEVEL_NAME_SQL, [levelId]) as Promise<Array<{ name: string | null }>>,
			this.dataSource.query(sql.MAJORS_OF_LEVEL_SQL, [levelId]) as Promise<Array<{ name: string | null }>>,
			this.dataSource.query(sql.SUB_GRADES_SQL) as Promise<Array<{ label: string | null }>>,
		])
		return {
			academicYear,
			grade,
			levelId,
			levelName: level[0]?.name ?? null,
			exists: exists[0]?.exists === true,
			maxGrade: maxGrade[0]?.maxGrade ?? 0,
			majors: majors.map((row) => row.name ?? ""),
			subGrades: subGrades.map((row) => row.label ?? ""),
		}
	}

	async findRoster(academicYearId: number, grade: number, levelId: number): Promise<AdminStudentRosterRow[]> {
		const year = await this.yearOrFail(academicYearId)
		const rows = (await this.dataSource.query(sql.ROSTER_SQL, [year.year, grade, levelId])) as RosterSqlRow[]
		return rows.map(toRosterRow)
	}

	async findOptions(): Promise<AdminStudentOptions> {
		const [years, levels, grades, subGrades, majors] = await Promise.all([
			this.dataSource.query(sql.OPTION_YEARS_SQL) as Promise<Array<{ id: string; year: string | null }>>,
			this.dataSource.query(sql.OPTION_LEVELS_SQL) as Promise<Array<{ id: string; name: string | null }>>,
			this.dataSource.query(sql.OPTION_GRADES_SQL) as Promise<Array<{ id: string; label: string | null; levelId: string | null }>>,
			this.dataSource.query(sql.OPTION_SUB_GRADES_SQL) as Promise<Array<{ label: string | null }>>,
			this.dataSource.query(sql.OPTION_MAJORS_SQL) as Promise<Array<{ name: string | null; levelId: string | null }>>,
		])
		return {
			academicYears: years.map((row) => ({ id: Number(row.id), year: row.year })),
			levels: levels.map((row) => ({ id: Number(row.id), name: row.name })),
			grades: grades.map((row) => ({ id: Number(row.id), label: toNumber(row.label), levelId: toNumber(row.levelId) })),
			subGrades: subGrades.map((row) => row.label ?? ""),
			majors: majors.map((row) => ({ name: row.name, levelId: toNumber(row.levelId) })),
		}
	}

	async findDetail(studentGradeId: number): Promise<AdminStudentDetail> {
		type Row = {
			id: string
			studentId: string | null
			nis: string | null
			email: string | null
			source: string | null
			isBlocked: boolean | null
			fullname: string | null
			levelId: string | null
			levelName: string | null
			grade: string | null
			gradeStatus: string | null
			gradeNote: string | null
			dropoutNote: string | null
			subGrade: string | null
			majorName: string | null
			currentAcademicYear: string | null
			attachPhoto: string | null
			academicYearId: string | null
			createdDay: string | null
			createdMonth: string | null
			createdYear: string | null
			createdTime: string | null
		}
		const rows = (await this.dataSource.query(sql.DETAIL_SQL, [studentGradeId])) as Row[]
		const row = rows[0]
		const record = row ? await loadSocietyRecord(this.dataSource.manager, "student", studentGradeId) : null
		if (!row || !record) throw new NotFoundException("Santri tidak ditemukan")

		const [maxGrade, majors] = await Promise.all([
			this.dataSource.query(sql.MAX_GRADE_SQL) as Promise<Array<{ maxGrade: number }>>,
			// `optional(Level::find($level_id))->majors ?? collect([new Major()])`
			this.dataSource.query(sql.MAJORS_OF_LEVEL_SQL, [row.levelId]) as Promise<Array<{ name: string | null }>>,
		])
		return {
			id: Number(row.id),
			studentId: toNumber(row.studentId),
			nis: row.nis,
			email: row.email,
			source: row.source,
			isBlocked: row.isBlocked,
			fullname: row.fullname,
			levelId: toNumber(row.levelId),
			levelName: row.levelName,
			grade: toNumber(row.grade),
			gradeStatus: row.gradeStatus,
			gradeNote: row.gradeNote,
			dropoutNote: row.dropoutNote,
			subGrade: row.subGrade,
			majorName: row.majorName,
			currentAcademicYear: row.currentAcademicYear,
			academicYearId: toNumber(row.academicYearId),
			photoUrl: societyFileUrl(row.attachPhoto),
			createdAtDisplay: indoDateTime(row.createdDay, row.createdMonth, row.createdYear, row.createdTime),
			maxGrade: maxGrade[0]?.maxGrade ?? 0,
			majors: majors.map((major) => major.name ?? ""),
			record,
		}
	}

	/** `print:1098` — the whole page, or 404. */
	async print(studentGradeId: number): Promise<string> {
		const html = await renderSocietyPrintPage(this.dataSource.manager, { society: "student", id: studentGradeId })
		if (html === null) throw new NotFoundException("Santri tidak ditemukan")
		return html
	}

	/** `download:866-882` — legacy redirects to the grades page when the class is empty; the port answers 404. */
	async export(academicYearId: number, grade: number, levelId: number): Promise<{ fileName: string; buffer: Buffer }> {
		const year = await this.yearOrFail(academicYearId)
		const rows = (await this.dataSource.query(sql.EXPORT_SQL, [year.year, grade, levelId])) as Array<ExportRow & { levelName: string | null }>
		if (rows.length === 0) throw new NotFoundException("Data santri tidak ditemukan")
		const settings = (await this.dataSource.query(sql.EXPORT_SETTINGS_SQL)) as Array<{ id: string; status: boolean; label: string }>
		const exportSettings: ExportSetting[] = settings.map((row) => ({ id: Number(row.id), status: row.status, label: row.label }))
		const buffer = await buildStudentWorkbook(exportSettings, rows, { grade, levelName: rows[0]?.levelName ?? null, year: year.year })
		return { fileName: "Hasil export data santri.xlsx", buffer }
	}

	// ─── Writes ─────────────────────────────────────────────────────────────

	nextGrades(ids: number[]): Promise<string> {
		return this.write((manager) => bulk.nextGrades(manager, ids))
	}

	stayGrades(ids: number[]): Promise<string> {
		return this.write((manager) => bulk.stayGrades(manager, ids))
	}

	graduate(ids: number[]): Promise<string> {
		return this.write((manager) => bulk.graduate(manager, ids))
	}

	/** `dropout:799-803` — `'dropout_note' => 'sometimes|required|string'`, attribute "alasan dikeluarkan". */
	dropout(ids: number[], dropoutNote: string | undefined): Promise<string> {
		const note = dropoutNote === undefined ? null : dropoutNote.trim()
		if (note === "") throwFieldErrors({ dropout_note: "Kolom alasan dikeluarkan wajib untuk diisi." })
		return this.write((manager) => bulk.dropout(manager, ids, note))
	}

	updateMajor(ids: number[], major: string | null): Promise<string> {
		return this.write((manager) => bulk.updateMajor(manager, ids, major))
	}

	updateSubGrade(ids: number[], subGrade: string | null): Promise<string> {
		return this.write((manager) => bulk.updateSubGrade(manager, ids, subGrade))
	}

	updateStatus(ids: number[], isBlocked: boolean): Promise<string> {
		return this.write((manager) => bulk.updateStatus(manager, ids, isBlocked))
	}

	destroy(studentGradeId: number): Promise<string> {
		return this.write((manager) => destroyGradeRow(manager, studentGradeId))
	}

	async destroyByGrade(academicYearId: number, grade: number): Promise<string> {
		const year = await this.yearOrFail(academicYearId)
		return this.write((manager) => destroyByGrade(manager, year.year, grade))
	}

	/** Legacy `validate{Personal,Identity,Family,Guardian}Data` — `{ status: 'success' }` or the field errors. */
	async validateStep(step: SocietyStepKey, values: Record<string, string>, diseases: SocietyDisease[]): Promise<{ message: string }> {
		await validateSocietyInput(this.dataSource.manager, { variant: "student-create", step, values, diseases, files: {} })
		return { message: "OK" }
	}

	async create(input: SocietyInput): Promise<AdminStudentCreated> {
		const studentGradeId = await this.write((manager) =>
			createStudent(manager, this.storageService, (rules) => validateSocietyInput(manager, rules), input),
		)
		return { message: "Data berhasil disimpan ke dalam basis data.", studentGradeId }
	}

	async update(studentGradeId: number, input: SocietyInput): Promise<{ message: string }> {
		await this.write((manager) =>
			updateStudent(manager, this.storageService, (rules) => validateSocietyInput(manager, rules), studentGradeId, input),
		)
		return { message: UPDATE_SUCCESS }
	}
}
