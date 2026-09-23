import { Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common"
import { DataSource } from "typeorm"

import { EPOCH_SECONDS, LOCAL_TIMESTAMP, indoDateTimeDot } from "@admin/academic/academic-format"
import type { SubGradeWriteInput } from "@admin/dto/sub-grade-admin.dto"

export type SubGradeRow = {
	id: number
	label: string | null
	createdAt: string
	createdAtTs: number
}

export type SubGradeDetail = {
	id: number
	label: string | null
}

/** Raw shape of the list query: the BIGINT columns arrive from `pg` as strings. */
type SubGradeSqlRow = {
	id: string
	label: string | null
	localCreatedAt: string | null
	createdAtTs: string | null
}

// `SubGrade::latest()->get()`. `id DESC` only breaks ties `created_at` leaves undefined.
const SUB_GRADE_LIST_SQL = `SELECT s.id,
		s.label,
		${LOCAL_TIMESTAMP("s.created_at")} AS "localCreatedAt",
		${EPOCH_SECONDS("s.created_at")} AS "createdAtTs"
	FROM tbr_sub_grades s
	ORDER BY s.created_at DESC, s.id DESC`

const SUB_GRADE_DETAIL_SQL = `SELECT s.id, s.label FROM tbr_sub_grades s WHERE s.id = $1`

// `Lang::get('admin.*')` — resources/lang/id/admin.php, verbatim.
const CREATE_SUCCESS = "Data berhasil disimpan ke dalam basis data."
const CREATE_FAILED = "Terjadi kesalahan. Data gagal disimpan ke dalam basis data."
const UPDATE_SUCCESS = "Data berhasil diupdate."
const UPDATE_FAILED = "Data gagal diupdate."
const DELETE_SUCCESS = "Data berhasil dihapus dari basis data."
const DELETE_FAILED = "Data gagal dihapus dari basis data."

/**
 * Port of the legacy `SubGradeController` (Subkelas) — the right card of the Kelas page.
 *
 * Sub-grades are a flat global list: `tbr_sub_grades` holds only a label, with no link to a
 * grade and no capacity. `tbr_student_grades.sub_grade` stores the label string, so a delete
 * leaves those rows pointing at a label that no longer exists — kept as legacy.
 *
 * Like the Kelas list, this one gains `createdAtTs` so the date column sorts chronologically
 * (legacy used bare `formatDate()` and sorted the Indonesian string — bug B-7).
 *
 * Legacy declares no uniqueness rule on `label`, so duplicate subkelas are accepted here too.
 */
@Injectable()
export class SubGradeAdminService {
	private readonly logger = new Logger(SubGradeAdminService.name)

	constructor(private readonly dataSource: DataSource) {}

	/** `SubGrade::latest()->get()`. */
	async findAll(): Promise<SubGradeRow[]> {
		const rows = await this.dataSource.query<SubGradeSqlRow[]>(SUB_GRADE_LIST_SQL)

		return rows.map((row) => ({
			id: Number(row.id),
			label: row.label,
			createdAt: indoDateTimeDot(row.localCreatedAt),
			createdAtTs: Number(row.createdAtTs ?? 0),
		}))
	}

	/** `SubGradeController@edit` — the payload the edit modal is built from. */
	async findOne(id: number): Promise<SubGradeDetail> {
		const rows = await this.dataSource.query<SubGradeSqlRow[]>(SUB_GRADE_DETAIL_SQL, [id])
		const subGrade = rows[0]
		if (!subGrade) throw new NotFoundException("Subkelas tidak ditemukan.")

		return { id: Number(subGrade.id), label: subGrade.label }
	}

	/** `SubGrade::create($request->only('label'))`. */
	async create(dto: SubGradeWriteInput): Promise<{ message: string }> {
		try {
			await this.dataSource.query(
				`INSERT INTO tbr_sub_grades (label, created_at, updated_at) VALUES ($1, now(), now())`,
				[dto.label],
			)
		} catch (error: unknown) {
			this.logger.error("[Subkelas] gagal menyimpan subkelas", error)
			throw new InternalServerErrorException(CREATE_FAILED)
		}

		return { message: CREATE_SUCCESS }
	}

	/** `$sub_grade->update($request->only('label'))`. */
	async update(id: number, dto: SubGradeWriteInput): Promise<{ message: string }> {
		await this.findOne(id)

		try {
			await this.dataSource.query(`UPDATE tbr_sub_grades SET label = $2, updated_at = now() WHERE id = $1`, [
				id,
				dto.label,
			])
		} catch (error: unknown) {
			this.logger.error("[Subkelas] gagal mengupdate subkelas", error)
			throw new InternalServerErrorException(UPDATE_FAILED)
		}

		return { message: UPDATE_SUCCESS }
	}

	/**
	 * `$sub_grade->delete()` — hard, no cascade and no dependency check, like legacy.
	 * `tbr_student_grades.sub_grade` stores the label string and is left dangling.
	 */
	async remove(id: number): Promise<{ message: string }> {
		await this.findOne(id)

		try {
			await this.dataSource.query(`DELETE FROM tbr_sub_grades WHERE id = $1`, [id])
		} catch (error: unknown) {
			this.logger.error("[Subkelas] gagal menghapus subkelas", error)
			throw new InternalServerErrorException(DELETE_FAILED)
		}

		return { message: DELETE_SUCCESS }
	}
}
