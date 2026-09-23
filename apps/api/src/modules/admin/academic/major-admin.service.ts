import { Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common"
import { DataSource } from "typeorm"

import { EPOCH_SECONDS, LOCAL_TIMESTAMP, indoDateTimeDot } from "@admin/academic/academic-format"
import type { MajorWriteInput } from "@admin/dto/major-admin.dto"

export type MajorRow = {
	id: number
	name: string | null
	levelId: number | null
	/** Null when the level was deleted — legacy's `hasOne(...)->withDefault()` renders blank. */
	levelName: string | null
	desc: string | null
	createdAt: string
	createdAtTs: number
}

export type MajorDetail = {
	id: number
	name: string | null
	levelId: number | null
	desc: string | null
}

/** Raw shape of the list query: every BIGINT arrives from `pg` as a string. */
type MajorListSqlRow = {
	id: string
	name: string | null
	levelId: string | null
	levelName: string | null
	desc: string | null
	localCreatedAt: string | null
	createdAtTs: string | null
}

type MajorDetailSqlRow = {
	id: string
	name: string | null
	levelId: string | null
	desc: string | null
}

// `Major::latest()->get()` joined to the level. `hasOne(Level::class, 'id', 'level_id')->withDefault()`
// answers a blank model for an orphaned `level_id`, so a LEFT JOIN reproduces it exactly: the cell
// renders empty rather than throwing. `id DESC` only breaks ties `created_at` leaves undefined.
const MAJOR_LIST_SQL = `SELECT m.id,
		m.name,
		m.level_id AS "levelId",
		l.name AS "levelName",
		m."desc" AS "desc",
		${LOCAL_TIMESTAMP("m.created_at")} AS "localCreatedAt",
		${EPOCH_SECONDS("m.created_at")} AS "createdAtTs"
	FROM tbr_majors m
	LEFT JOIN tbr_levels l ON l.id = m.level_id
	ORDER BY m.created_at DESC, m.id DESC`

const MAJOR_DETAIL_SQL = `SELECT m.id, m.name, m.level_id AS "levelId", m."desc" AS "desc"
	FROM tbr_majors m
	WHERE m.id = $1`

// `MajorController` hard-codes these two literals instead of reading `admin.create-success` /
// `admin.create-failed`; the text happens to match. Kept verbatim.
const CREATE_SUCCESS = "Data berhasil disimpan ke dalam basis data."
const CREATE_FAILED = "Terjadi kesalahan. Data gagal disimpan ke dalam basis data."
const DELETE_SUCCESS = "Data berhasil dihapus dari basis data."
// Legacy's destroy() catch drops the trailing full stop that `admin.delete-failed` has. Verbatim.
const DELETE_FAILED = "Data gagal dihapus dari basis data"

/**
 * Port of the legacy `MajorController` (Jurusan).
 *
 * Legacy messages are kept verbatim, including the two oddities: `update()` answers the
 * *create* wording ("Data berhasil disimpan ke dalam basis data."), and the delete failure
 * reads "Data gagal dihapus dari basis data" with no trailing full stop.
 *
 * Delete is a hard delete with no cascade, like legacy: rows in `tbr_student_grades.major_name`
 * reference the major by name and are left untouched.
 */
@Injectable()
export class MajorAdminService {
	private readonly logger = new Logger(MajorAdminService.name)

	constructor(private readonly dataSource: DataSource) {}

	/** `Major::latest()->get()` with the level joined; LEFT JOIN so an orphan renders blank. */
	async findAll(): Promise<MajorRow[]> {
		const rows = await this.dataSource.query<MajorListSqlRow[]>(MAJOR_LIST_SQL)

		return rows.map((row) => ({
			id: Number(row.id),
			name: row.name,
			levelId: row.levelId === null ? null : Number(row.levelId),
			levelName: row.levelName,
			desc: row.desc,
			createdAt: indoDateTimeDot(row.localCreatedAt),
			createdAtTs: Number(row.createdAtTs ?? 0),
		}))
	}

	/** `MajorController@edit` — the payload the magnific-popup edit modal is built from. */
	async findOne(id: number): Promise<MajorDetail> {
		const rows = await this.dataSource.query<MajorDetailSqlRow[]>(MAJOR_DETAIL_SQL, [id])
		const major = rows[0]
		if (!major) throw new NotFoundException("Jurusan tidak ditemukan.")

		return {
			id: Number(major.id),
			name: major.name,
			levelId: major.levelId === null ? null : Number(major.levelId),
			desc: major.desc,
		}
	}

	/** `Major::create(['level_id' => $request->level, 'name' => …, 'desc' => …])`. */
	async create(dto: MajorWriteInput): Promise<{ message: string }> {
		try {
			await this.dataSource.query(
				`INSERT INTO tbr_majors (level_id, name, "desc", created_at, updated_at)
				VALUES ($1, $2, $3, now(), now())`,
				[dto.levelId, dto.name, dto.desc ?? null],
			)
		} catch (error: unknown) {
			this.logger.error("[Jurusan] gagal menyimpan jurusan", error)
			throw new InternalServerErrorException(CREATE_FAILED)
		}

		return { message: CREATE_SUCCESS }
	}

	/** `$major->update([...])` — answers the *create* wording, exactly as legacy does. */
	async update(id: number, dto: MajorWriteInput): Promise<{ message: string }> {
		await this.findOne(id)

		try {
			await this.dataSource.query(
				`UPDATE tbr_majors SET level_id = $2, name = $3, "desc" = $4, updated_at = now() WHERE id = $1`,
				[id, dto.levelId, dto.name, dto.desc ?? null],
			)
		} catch (error: unknown) {
			this.logger.error("[Jurusan] gagal mengupdate jurusan", error)
			throw new InternalServerErrorException(CREATE_FAILED)
		}

		return { message: CREATE_SUCCESS }
	}

	/** `$major->delete()` — hard, no cascade and no dependency check, like legacy. */
	async remove(id: number): Promise<{ message: string }> {
		await this.findOne(id)

		try {
			await this.dataSource.query(`DELETE FROM tbr_majors WHERE id = $1`, [id])
		} catch (error: unknown) {
			this.logger.error("[Jurusan] gagal menghapus jurusan", error)
			throw new InternalServerErrorException(DELETE_FAILED)
		}

		return { message: DELETE_SUCCESS }
	}
}
