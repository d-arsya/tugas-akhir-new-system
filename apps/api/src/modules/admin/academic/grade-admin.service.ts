import { Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { DataSource, Not, Repository } from "typeorm"

import { throwFieldErrors } from "@core/errors/field-errors"
import { EPOCH_SECONDS, LOCAL_TIMESTAMP } from "@admin/common/sql"
import { indoDateTimeDot } from "@admin/common/date-format"
import type { GradeWriteInput } from "@admin/academic/dto/grade-admin.dto"
import { Grade } from "@shared/master/entities/grade.entity"

export type GradeRow = {
	id: number
	label: number | null
	/** Legacy prefixes the label: `"Kelas " . $grade->label`. */
	name: string
	levelId: number | null
	levelName: string | null
	createdAt: string
	createdAtTs: number
}

export type GradeDetail = {
	id: number
	levelId: number | null
	label: number | null
}

/** Raw shape of the list query: every BIGINT arrives from `pg` as a string. */
type GradeListSqlRow = {
	id: string
	label: string | null
	levelId: string | null
	levelName: string | null
	localCreatedAt: string | null
	createdAtTs: string | null
}

// `Grade::orderBy('label', 'desc')->get()`, with the level LEFT JOINed instead of legacy's
// per-row `Level::find($grade->level_id)->name` (bug B-6: no null guard, so one orphaned
// grade made the whole endpoint 500). `id DESC` only breaks ties `label` leaves undefined.
const GRADE_LIST_SQL = `SELECT g.id,
		g.label,
		g.level_id AS "levelId",
		l.name AS "levelName",
		${LOCAL_TIMESTAMP("g.created_at")} AS "localCreatedAt",
		${EPOCH_SECONDS("g.created_at")} AS "createdAtTs"
	FROM tbr_grades g
	LEFT JOIN tbr_levels l ON l.id = g.level_id
	ORDER BY g.label DESC, g.id DESC`

// `Lang::get('admin.*')` — resources/lang/id/admin.php, verbatim.
const CREATE_SUCCESS = "Data berhasil disimpan ke dalam basis data."
const CREATE_FAILED = "Terjadi kesalahan. Data gagal disimpan ke dalam basis data."
const UPDATE_SUCCESS = "Data berhasil diupdate."
const UPDATE_FAILED = "Data gagal diupdate."
const DELETE_SUCCESS = "Data berhasil dihapus dari basis data."
const DELETE_FAILED = "Data gagal dihapus dari basis data."

// `GradeRequest::messages()` — `'label.unique' => 'Kelas sudah ada sebelumnya'`, with no
// trailing full stop. Verbatim, because it is user-visible.
const LABEL_TAKEN = "Kelas sudah ada sebelumnya"

/**
 * Port of the legacy `GradeController` (Kelas).
 *
 * Two legacy bugs are fixed rather than replicated (plan decisions):
 *   * B-6 — `Level::find($grade->level_id)->name` had no null guard, so a grade whose level
 *     was deleted made the whole list endpoint 500. The port LEFT JOINs and renders blank.
 *   * B-7 — the list used bare `formatDate()` instead of `datatableDate()`, so "Dibuat Pada"
 *     sorted alphabetically on the Indonesian date string ("01 April" before "01 Januari").
 *     The row now carries `createdAtTs`.
 *
 * `label` is globally unique across every level (legacy `unique:grades,label`), which is why
 * "Kelas 1" cannot exist under both SMP and SMA. Kept as legacy.
 */
@Injectable()
export class GradeAdminService {
	private readonly logger = new Logger(GradeAdminService.name)

	constructor(
		private readonly dataSource: DataSource,
		@InjectRepository(Grade) private readonly grades: Repository<Grade>,
	) {}

	/** `Grade::orderBy('label', 'desc')->get()`. */
	async findAll(): Promise<GradeRow[]> {
		const rows = await this.dataSource.query<GradeListSqlRow[]>(GRADE_LIST_SQL)

		return rows.map((row) => ({
			id: Number(row.id),
			label: row.label === null ? null : Number(row.label),
			// `"Kelas ".$grade->label` — a null label concatenates to the bare prefix in PHP too
			name: `Kelas ${row.label ?? ""}`,
			levelId: row.levelId === null ? null : Number(row.levelId),
			levelName: row.levelName,
			createdAt: indoDateTimeDot(row.localCreatedAt),
			createdAtTs: Number(row.createdAtTs ?? 0),
		}))
	}

	/** `GradeController@edit` — the payload the edit modal is built from. */
	async findOne(id: number): Promise<GradeDetail> {
		const grade = await this.grades.findOne({ select: { id: true, levelId: true, label: true }, where: { id } })
		if (!grade) throw new NotFoundException("Kelas tidak ditemukan.")

		return {
			id: Number(grade.id),
			levelId: grade.levelId === null ? null : Number(grade.levelId),
			label: grade.label === null ? null : Number(grade.label),
		}
	}

	/** `Grade::create($request->validated())` — `unique:grades,label` runs first. */
	async create(dto: GradeWriteInput): Promise<{ message: string }> {
		await this.assertLabelFree(dto.label, null)

		try {
			await this.grades.save(this.grades.create({ levelId: dto.levelId, label: dto.label }))
		} catch (error: unknown) {
			this.logger.error("[Kelas] gagal menyimpan kelas", error)
			throw new InternalServerErrorException(CREATE_FAILED)
		}

		return { message: CREATE_SUCCESS }
	}

	/** `$grade->update($request->validated())` — `unique:grades,label,{id}` ignores its own row. */
	async update(id: number, dto: GradeWriteInput): Promise<{ message: string }> {
		await this.findOne(id)
		await this.assertLabelFree(dto.label, id)

		try {
			await this.grades.update({ id }, { levelId: dto.levelId, label: dto.label })
		} catch (error: unknown) {
			this.logger.error("[Kelas] gagal mengupdate kelas", error)
			throw new InternalServerErrorException(UPDATE_FAILED)
		}

		return { message: UPDATE_SUCCESS }
	}

	/**
	 * `$grade->delete()` — hard, no cascade and no dependency check, like legacy.
	 * `tbr_student_grades.grade` stores the label as a number and is left dangling.
	 */
	async remove(id: number): Promise<{ message: string }> {
		await this.findOne(id)

		try {
			await this.grades.delete({ id })
		} catch (error: unknown) {
			this.logger.error("[Kelas] gagal menghapus kelas", error)
			throw new InternalServerErrorException(DELETE_FAILED)
		}

		return { message: DELETE_SUCCESS }
	}

	/**
	 * `unique:grades,label,{id}`: global across every level, ignoring its own row on update.
	 * zod cannot express it, so it is raised here in the `{ field: [message] }` shape a failed
	 * validation would have produced.
	 */
	private async assertLabelFree(label: number, ignoreId: number | null): Promise<void> {
		const taken = await this.grades.existsBy(ignoreId === null ? { label } : { label, id: Not(ignoreId) })
		if (taken) throwFieldErrors({ label: [LABEL_TAKEN] })
	}
}
