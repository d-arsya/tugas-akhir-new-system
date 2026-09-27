import { Injectable, NotFoundException, UnprocessableEntityException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { InjectRepository } from "@nestjs/typeorm"
import { DataSource, Repository } from "typeorm"
import type {
	CapabilityAcademicYearRow,
	CapabilityGradeRow,
	CapabilityHistoryRow,
	CapabilityItemPage,
	CapabilityItemRow,
	CapabilityStudentPage,
	CapabilityStudentRow,
	InvoiceStudentCard,
} from "@roja/types"

import type { Env } from "@core/config/env.validation"
import { StorageService } from "@core/storage/storage.service"
import {
	alertFor,
	CAPABILITY_NOT_FOUND,
	costPeriodText,
	GRADE_NOT_FOUND,
	GRADE_NOTE,
	gradeName,
	MASTER_COST_UNDEFINED,
	statusLabel,
	STUDENT_NOT_FOUND,
	toHistoryRow,
	toItemRow,
	YEAR_NOT_FOUND,
	type CapabilitySqlRow,
	type CardSqlRow,
	type GradeSqlRow,
	type HistorySqlRow,
	type ItemSqlRow,
	type StudentSqlRow,
	type YearSqlRow,
} from "@admin/capabilities/capability-format"
import { capabilityFileName } from "@admin/capabilities/capability-document"
import { CAPABILITY_CONTENT_TYPE } from "@admin/capabilities/capability-pdf"
import {
	CapabilityPdfStore,
	loadCapabilityDocument,
	loadCapabilityPdfData,
} from "@admin/capabilities/capability-pdf-store"
import { renderCapabilityPrint } from "@admin/capabilities/capability-print"
import * as sql from "@admin/capabilities/capability-sql"
import { AcademicYear } from "@shared/master/entities/academic-year.entity"
import { Grade } from "@shared/master/entities/grade.entity"
import { StudentCapability } from "@santri/entities/student-capability.entity"

/** What levels 4 and 5 both need before they can answer: the card plus the two resolved ids. */
type StudentContext = { student: InvoiceStudentCard; academicYearId: number; gradeId: number; grade: string }

/**
 * Port of the legacy `StudentCapabilityController` read half: the five-level drill-down from
 * academic year down to one capability's line items, plus the tick list the level-3 page parks
 * before handing off to mass create/edit. Owned by WS P2-A.
 *
 * Every list here is complete rather than paged — legacy runs no yajra in this controller at all
 * and the browser does the paging, so the contract answers plain arrays.
 */
@Injectable()
export class CapabilityAdminService {
	private readonly pdfStore: CapabilityPdfStore

	constructor(
		private readonly dataSource: DataSource,
		private readonly configService: ConfigService<Env, true>,
		private readonly storageService: StorageService,
		@InjectRepository(AcademicYear) private readonly academicYears: Repository<AcademicYear>,
		@InjectRepository(Grade) private readonly grades: Repository<Grade>,
		@InjectRepository(StudentCapability) private readonly capabilities: Repository<StudentCapability>,
	) {
		this.pdfStore = new CapabilityPdfStore(storageService)
	}

	/** Level 1 — `@academicYearList`. */
	async findAcademicYears(): Promise<CapabilityAcademicYearRow[]> {
		const rows = await this.dataSource.query<YearSqlRow[]>(sql.CAPABILITY_YEARS_SQL)
		return rows.map((row) => ({
			id: Number(row.id),
			year: row.year,
			costPeriod: costPeriodText(row.costDateStart, row.costDateEnd),
			statusLabel: row.statusLabel,
		}))
	}

	/** Level 2 — `@gradeList`. */
	async findGrades(academicYearId: number): Promise<CapabilityGradeRow[]> {
		const year = await this.findYear(academicYearId)
		const rows = await this.dataSource.query<GradeSqlRow[]>(sql.CAPABILITY_GRADES_SQL, [academicYearId, year.year])

		return rows.map((row) => ({
			id: Number(row.id),
			label: row.label === null ? null : Number(row.label),
			name: gradeName(row.label === null ? null : Number(row.label)),
			masterCostDefined: row.masterCostDefined,
			studentCount: row.studentCount,
			note: GRADE_NOTE,
			// `Grade::studentCapabilityAction()` — no applied term and the action opens the
			// "Master biaya belum ditentukan!" modal instead of linking to level 3
			canDrillDown: row.masterCostDefined,
		}))
	}

	/**
	 * Level 3 — `@capabilityList`, behind `@capability`'s guard.
	 *
	 * Legacy answers the guard with `redirect()->route('studentCapability.grade')`, which an XHR
	 * client cannot act on; a 422 carrying the modal's own copy is the same refusal in a form the
	 * caller can render.
	 */
	async findStudents(academicYearId: number, gradeId: number): Promise<CapabilityStudentRow[]> {
		const year = await this.findYear(academicYearId)
		const grade = await this.findGrade(gradeId)

		const [applied] = await this.dataSource.query<{ exists: boolean }[]>(sql.CAPABILITY_TERMS_EXIST_SQL, [
			academicYearId,
			grade.label,
		])
		if (!applied?.exists) throw new UnprocessableEntityException(MASTER_COST_UNDEFINED)

		const rows = await this.dataSource.query<StudentSqlRow[]>(sql.CAPABILITY_STUDENTS_SQL, [year.year, grade.label])

		return rows.map((row) => ({
			studentGradeId: Number(row.studentGradeId),
			nis: row.nis,
			fullName: row.fullName,
			parentOrGuardian: row.parentOrGuardian,
			subGrade: row.subGrade,
			capabilityCount: row.capabilityCount,
			hasCapability: row.capabilityCount > 0,
		}))
	}

	/** Level 4 — `@studentCapability`: the card and which of the three banners to show. */
	async findStudentPage(studentGradeId: number): Promise<CapabilityStudentPage> {
		const context = await this.findStudentContext(studentGradeId)

		const newest = await this.capabilities.findOne({
			select: { id: true, status: true },
			where: { studentGradeId },
			order: { createdAt: "DESC", id: "DESC" },
		})

		return {
			student: context.student,
			alert: alertFor(newest?.status ?? null, newest !== null),
			academicYearId: context.academicYearId,
			gradeId: context.gradeId,
		}
	}

	/** Level 4 — `@studentCapabilityList`, oldest first, which is also the `#1`/`#2` ordinal. */
	async findHistory(studentGradeId: number): Promise<CapabilityHistoryRow[]> {
		await this.findStudentContext(studentGradeId)
		const rows = await this.dataSource.query<HistorySqlRow[]>(sql.CAPABILITY_HISTORY_SQL, [studentGradeId])
		return rows.map((row, index) => toHistoryRow(row, index + 1))
	}

	/** Level 5 — `@studentCapabilityItem`: the card, the capability's badge and whether it is editable. */
	async findItemPage(capabilityId: number, studentGradeId: number): Promise<CapabilityItemPage> {
		const context = await this.findStudentContext(studentGradeId)
		const capability = await this.findCapability(capabilityId, studentGradeId)

		return {
			student: context.student,
			capability: {
				id: Number(capability.id),
				ordinal: capability.ordinal,
				status: capability.status,
				statusLabel: statusLabel(capability.status),
				note: capability.note,
				approveDate: capability.approveDate,
			},
			// Legacy renders the checkboxes, Simpan and "Telah Disepakati" only while unagreed
			editable: capability.status === "disapprove",
			academicYearId: context.academicYearId,
			gradeId: context.gradeId,
		}
	}

	/** Level 5 — `@studentCapabilityItemList`. */
	async findItems(capabilityId: number, studentGradeId: number): Promise<CapabilityItemRow[]> {
		const context = await this.findStudentContext(studentGradeId)
		const capability = await this.findCapability(capabilityId, studentGradeId)

		const rows = await this.dataSource.query<ItemSqlRow[]>(sql.CAPABILITY_ITEMS_SQL, [
			context.academicYearId,
			context.grade,
			capabilityId,
			capability.status === "disapprove",
		])
		return rows.map(toItemRow)
	}

	/** `@print` — `print/capability.blade.php`; the logo travels as a URL, since a browser fetches it. */
	async print(capabilityId: number, studentGradeId: number): Promise<{ body: string; contentType: string }> {
		const data = await loadCapabilityDocument(this.dataSource, capabilityId, studentGradeId)
		return renderCapabilityPrint({
			...data,
			logoUrl: this.storageUrl(data.school?.logo ?? null),
			logo: null,
		})
	}

	/**
	 * `@downloadPDF` — the stored agreement, or a fresh render stored on the way past (the
	 * self-healing half of "generate on publish"). See `CapabilityPdfStore.document`.
	 */
	async download(
		capabilityId: number,
		studentGradeId: number,
	): Promise<{ body: Buffer; fileName: string; contentType: string }> {
		const data = await loadCapabilityPdfData(this.storageService, this.dataSource, capabilityId, studentGradeId)
		return {
			body: await this.pdfStore.document(capabilityId, studentGradeId, data),
			fileName: capabilityFileName(data.student.fullname),
			contentType: CAPABILITY_CONTENT_TYPE,
		}
	}

	// ─── internals ───────────────────────────────────────────────

	/**
	 * The card plus `getAcademicYearId()` / `getGradeId()`, both of which legacy writes as an
	 * unguarded `->first()->id`. A santri whose `current_academic_year` or grade label has no row
	 * is a 500 in legacy and a 404 here.
	 */
	private async findStudentContext(studentGradeId: number): Promise<StudentContext> {
		const [row] = await this.dataSource.query<CardSqlRow[]>(sql.CAPABILITY_STUDENT_CARD_SQL, [studentGradeId])
		if (!row) throw new NotFoundException(STUDENT_NOT_FOUND)
		if (row.costAcademicYearId === null) throw new NotFoundException(YEAR_NOT_FOUND)
		if (row.gradeId === null) throw new NotFoundException(GRADE_NOT_FOUND)

		return {
			student: {
				studentGradeId: Number(row.studentGradeId),
				studentId: Number(row.studentId ?? 0),
				nis: row.nis,
				fullName: row.fullName,
				photoUrl: this.storageUrl(row.photoPath),
				academicYear: row.academicYear,
				levelName: row.levelName,
				grade: row.grade,
				subGrade: row.subGrade,
				fatherName: row.fatherName,
			},
			academicYearId: Number(row.costAcademicYearId),
			gradeId: Number(row.gradeId),
			// `student_cost_terms.grade` is a varchar holding the label; `student_grades.grade` a bigint
			grade: row.grade ?? "",
		}
	}

	/**
	 * One capability, checked against the santri it is being viewed under.
	 *
	 * Legacy binds `{student_capability}` and `{student_grade}` independently and never compares
	 * them, so `/student-capability/{A}/student-grade/{B}` renders santri B's card over capability
	 * A's items — and, on the publish route, bills B for A's amounts.
	 */
	private async findCapability(capabilityId: number, studentGradeId: number): Promise<CapabilitySqlRow> {
		const [row] = await this.dataSource.query<CapabilitySqlRow[]>(sql.CAPABILITY_SQL, [capabilityId])
		if (!row) throw new NotFoundException(CAPABILITY_NOT_FOUND)
		if (Number(row.studentGradeId ?? 0) !== studentGradeId) throw new NotFoundException(CAPABILITY_NOT_FOUND)
		return row
	}

	private async findYear(academicYearId: number): Promise<Pick<AcademicYear, "id" | "year">> {
		const year = await this.academicYears.findOne({ select: { id: true, year: true }, where: { id: academicYearId } })
		if (!year) throw new NotFoundException(YEAR_NOT_FOUND)
		return year
	}

	/** Every route here takes the grade **id**; two legacy URLs pass the label and get away with it. */
	private async findGrade(gradeId: number): Promise<Pick<Grade, "id" | "label">> {
		const grade = await this.grades.findOne({ select: { id: true, label: true }, where: { id: gradeId } })
		if (!grade) throw new NotFoundException(GRADE_NOT_FOUND)
		return grade
	}

	/** PHP `storage_url()`: an absolute URL passes through, anything else is an S3 key. */
	private storageUrl(path: string | null): string | null {
		if (!path) return null
		if (/^https?:\/\//i.test(path)) return path
		const base = (this.configService.get("AWS_S3_URL", { infer: true }) ?? "").replace(/\/+$/, "")
		const bucket = this.configService.get("AWS_S3_BUCKET", { infer: true }) ?? ""
		const key = path.replace(/^\/?storage\//, "")
		return base && bucket ? `${base}/${bucket}/${key}` : key
	}
}
