import { Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
// Nest DI reads constructor parameter types at runtime (emitDecoratorMetadata), so these stay value imports
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { DataSource, Repository, type EntityManager } from "typeorm"

import type { AdminAlumniMessage } from "@roja/types"

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { StorageService } from "../../../core/storage/storage.service"
import { syncStudentWalletActive } from "../../../shared/ewallet/student-wallet"
import { replaceDiseaseHistories } from "../../../shared/society/disease-history"
import { storeSocietyUpload } from "../../../shared/society/files"
import { readSocietyMultipart, validateSocietyInput, type SocietyUpload } from "../../../shared/society/society-rules"
import { Alumni } from "@admin/common/entities/alumni.entity"
import { Student } from "@santri/entities/student.entity"
import { StudentGrade } from "@santri/entities/student-grade.entity"

import * as sql from "./alumni-sql"

// OWNER: AK-A. Legacy `AlumniController` writes: `update`, `destroy`, `destroyByGraduationYear`. Each runs in
// one transaction (decision register §5.4); the messages are `resources/lang/id/admin.php`.

const UPDATE_SUCCESS = "Data berhasil diupdate."
const UPDATE_FAILED = "Data gagal diupdate."
const DELETE_SUCCESS = "Data berhasil dihapus dari basis data."
const DELETE_FAILED = "Data gagal dihapus dari basis data."
const NOT_FOUND = "Data alumni tidak ditemukan."

/**
 * Rows an `UPDATE … RETURNING` touched. TypeORM's Postgres runner answers UPDATE / DELETE with
 * `[rows, rowCount]` rather than the rows, so the count is the second element.
 */
const affectedRows = (result: unknown): number => {
	if (Array.isArray(result) && result.length === 2 && typeof result[1] === "number") return result[1]
	return Array.isArray(result) ? result.length : 0
}

/** Column names come from the rule lists; checked again before they reach SQL. */
const SAFE_COLUMN = /^[a-z_]+$/

/**
 * `$alumni->update($all_data)`: every validated column plus the new attachment keys. Eloquent only saves
 * (and touches `updated_at`) when something changed, hence the `IS DISTINCT FROM` guard on the timestamp.
 */
const updateAlumni = async (manager: EntityManager, id: number, columns: Record<string, string | number | boolean | null>): Promise<void> => {
	const names = Object.keys(columns).filter((name) => SAFE_COLUMN.test(name))
	if (names.length === 0) return
	const values = names.map((name) => columns[name] ?? null)
	// The guard gets its own copies: one parameter used in `SET col = $n` and `col IS DISTINCT FROM $n`
	// can be deduced as two types (varchar vs text) and Postgres rejects that
	const params: unknown[] = [...values, ...values]
	const sets = names.map((name, index) => `${name} = $${index + 1}`)
	const changed = names.map((name, index) => `${name} IS DISTINCT FROM $${names.length + index + 1}`).join(" OR ")
	params.push(id)
	await manager.query(
		`UPDATE tbr_alumnis SET ${sets.join(", ")}, updated_at = CASE WHEN ${changed} THEN now() ELSE updated_at END WHERE id = $${params.length}`,
		params,
	)
}

const lockAlumni = (manager: EntityManager, id: number): Promise<Alumni | null> =>
	manager.findOne(Alumni, { select: { id: true, studentId: true }, where: { id }, lock: { mode: "pessimistic_write" } })

const liveGradeOwner = (manager: EntityManager, gradeId: number): Promise<{ id: string; student_id: string | null } | undefined> =>
	manager
		.createQueryBuilder(StudentGrade, "sg")
		.select("sg.id", "id")
		.addSelect("s.id", "student_id")
		.leftJoin(Student, "s", "s.id = sg.studentId AND s.deletedAt IS NULL")
		.where("sg.id = :gradeId", { gradeId })
		.andWhere("sg.deletedAt IS NULL")
		.getRawOne()

@Injectable()
export class AlumniWriteService {
	private readonly logger = new Logger(AlumniWriteService.name)

	constructor(
		private readonly dataSource: DataSource,
		private readonly storageService: StorageService,
		@InjectRepository(Alumni) private readonly alumni: Repository<Alumni>,
	) {}

	/** Route-model binding: a missing alumnus is a 404 before anything runs. */
	private async assertExists(id: number): Promise<void> {
		if (!(await this.alumni.existsBy({ id }))) throw new NotFoundException(NOT_FOUND)
	}

	/**
	 * `update(AlumniRequest, Alumni)` (318-341): validate, upload the new attachments (`array_filter` keeps the
	 * old key when nothing was chosen), update the row, rewrite the disease history (an absent list clears it,
	 * as `input('disease_name', [])` does).
	 */
	async update(
		id: number,
		body: Record<string, unknown>,
		files: Record<string, SocietyUpload[] | undefined> | undefined,
	): Promise<AdminAlumniMessage> {
		await this.assertExists(id)
		const posted = readSocietyMultipart(body, files)
		const validated = await validateSocietyInput(this.dataSource.manager, {
			variant: "alumni-update",
			values: posted.values,
			diseases: posted.diseases,
			files: posted.files,
			ignoreId: id,
		})

		try {
			const attachments: Record<string, string> = {}
			for (const [column, upload] of Object.entries(validated.uploads)) {
				attachments[column] = await storeSocietyUpload(this.storageService, upload)
			}
			await this.dataSource.transaction(async (manager) => {
				await lockAlumni(manager, id)
				await updateAlumni(manager, id, { ...validated.columns, ...attachments })
				await replaceDiseaseHistories(manager, "alumni", id, validated.diseases)
			})
		} catch (error) {
			this.logger.error(`alumni ${id} update failed: ${(error as Error).message}`)
			throw new InternalServerErrorException(UPDATE_FAILED)
		}
		return { message: UPDATE_SUCCESS }
	}

	/**
	 * `destroy(Alumni)` (408-435): put the santri's grade row back (`grade_status = active`,
	 * `grade_note = prev_grade_note`), unblock the account (then the wallet follows, legacy observer), delete
	 * the alumnus. A live grade row whose account is gone fails the whole delete, as legacy's null `->update`
	 * did — here nothing is left half-done.
	 */
	async destroy(id: number): Promise<AdminAlumniMessage> {
		await this.assertExists(id)
		try {
			await this.dataSource.transaction(async (manager) => {
				const alumni = await lockAlumni(manager, id)
				const gradeId = alumni?.studentId ?? null
				if (gradeId !== null) {
					const owner = await liveGradeOwner(manager, gradeId)
					if (owner) {
						await manager.query(sql.RESTORE_GRADE_SQL, [gradeId])
						if (!owner.student_id) throw new Error(`grade row ${gradeId} has no live account`)
						const unblocked = affectedRows(await manager.query(sql.UNBLOCK_STUDENT_SQL, [owner.student_id]))
						// The observer fires on an actual update only
						if (unblocked > 0) await syncStudentWalletActive(manager, Number(owner.student_id))
					}
				}
				await manager.delete(Alumni, { id })
			})
		} catch (error) {
			this.logger.error(`alumni ${id} delete failed: ${(error as Error).message}`)
			throw new InternalServerErrorException(DELETE_FAILED)
		}
		return { message: DELETE_SUCCESS }
	}

	/**
	 * `destroyByGraduationYear` (442-471), kept as legacy behaves on this data (user decision): every alumnus of
	 * the year is deleted, archive rows included; no grade row is restored and no account unblocked (its loop
	 * looks the grade ids up in `tbr_students`, which matches nothing).
	 */
	async destroyByYear(year: number): Promise<AdminAlumniMessage> {
		try {
			await this.dataSource.transaction(async (manager) => {
				await manager.query(sql.DELETE_YEAR_SQL, [year])
			})
		} catch (error) {
			this.logger.error(`alumni year ${year} delete failed: ${(error as Error).message}`)
			throw new InternalServerErrorException(DELETE_FAILED)
		}
		return { message: DELETE_SUCCESS }
	}
}
