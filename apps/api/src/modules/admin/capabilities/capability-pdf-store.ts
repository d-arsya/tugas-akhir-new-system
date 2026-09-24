// Where a rendered agreement lives between the publish that produced it and the admin who
// downloads it. Legacy re-rendered on every click (`downloadPDF:900-926`); on the user's decision
// this generates once, when a capability is published, and keeps the PDF on S3.
//
// Two rules shape the rest of this file, the same two that shape `payment-receipt-store.ts`:
//
//   1. **Publishing must not depend on storage.** The agreement is derived from the capability, so
//      a bucket that is full, unreachable or misconfigured can never be a reason for a publish to
//      fail or roll back. `generateCapabilityPdfInBackground` runs after the database transaction
//      has committed, returns nothing, and cannot reject. A grade publish queues ~98 of them.
//   2. **There has to be an on-demand path anyway.** 1,473 capabilities predate this code and have
//      no stored PDF, and a failed upload leaves a newer one in the same position. `document()`
//      renders whatever is missing and stores it on the way past, so the first download of an old
//      agreement is also its last render.

import { Logger, NotFoundException } from "@nestjs/common"
import type { DataSource } from "typeorm"
import type { CapabilityStatus } from "@roja/types"

import type { StorageService } from "@core/storage/storage.service"
import type {
	CapabilityDocumentData,
	CapabilityDocumentItem,
	CapabilityDocumentSchool,
	CapabilityDocumentStudent,
} from "@admin/capabilities/capability-document"
import * as docSql from "@admin/capabilities/capability-document-sql"
import { CAPABILITY_NOT_FOUND, STUDENT_NOT_FOUND } from "@admin/capabilities/capability-format"
import { CAPABILITY_CONTENT_TYPE, renderCapabilityPdf } from "@admin/capabilities/capability-pdf"
import * as sql from "@admin/capabilities/capability-sql"

const message = (error: unknown): string => (error instanceof Error ? error.message : String(error))

/** `approve` and `changed` capabilities never change again; `disapprove` ones do. */
const isFrozen = (data: CapabilityDocumentData): boolean => data.status === "approve" || data.status === "changed"

/**
 * The three row sets behind both agreement documents — `@print` and `@downloadPDF` read the same
 * figures and differ only in layout.
 *
 * The `(capability, studentGrade)` pair is validated here too: legacy binds the two independently,
 * so `/{A}/student-grade/{B}` printed santri B's identity over capability A's amounts.
 */
export const loadCapabilityDocument = async (
	dataSource: DataSource,
	capabilityId: number,
	studentGradeId: number,
): Promise<Omit<CapabilityDocumentData, "logo" | "logoUrl">> => {
	const [capability] = await dataSource.query<
		{ id: string; studentGradeId: string | null; status: CapabilityStatus | null; approveDate: string | null }[]
	>(sql.CAPABILITY_SQL, [capabilityId])
	if (!capability) throw new NotFoundException(CAPABILITY_NOT_FOUND)
	if (Number(capability.studentGradeId ?? 0) !== studentGradeId) throw new NotFoundException(CAPABILITY_NOT_FOUND)

	const [student] = await dataSource.query<CapabilityDocumentStudent[]>(docSql.CAPABILITY_DOCUMENT_STUDENT_SQL, [
		studentGradeId,
	])
	if (!student) throw new NotFoundException(STUDENT_NOT_FOUND)

	const [items, schools] = await Promise.all([
		dataSource.query<CapabilityDocumentItem[]>(docSql.CAPABILITY_DOCUMENT_ITEMS_SQL, [
			capabilityId,
			student.academicYearId,
			student.grade,
		]),
		dataSource.query<CapabilityDocumentSchool[]>(docSql.CAPABILITY_DOCUMENT_SCHOOL_SQL),
	])

	return {
		status: capability.status,
		approveDate: capability.approveDate,
		student,
		items,
		school: schools[0] ?? null,
	}
}

/**
 * The object key for one capability's agreement.
 *
 * Keyed by the capability id, which is what makes it collision-free and makes re-generation
 * idempotent: the same capability always writes the same key, so a second render replaces the
 * first rather than leaving an orphan. The santri's `student_grade_id` rides along because the two
 * are fixed together for the capability's whole life and it makes an object self-describing in the
 * bucket.
 */
export const capabilityKey = (capabilityId: number, studentGradeId: number): string =>
	`capabilities/student-capabilities/${studentGradeId}/${capabilityId}.pdf`

/**
 * A plain collaborator rather than a Nest provider, exactly as `PaymentReceiptStore` is: it needs
 * nothing from the container that its owner cannot hand it, and registering one would mean editing
 * `admin.module.ts`, which no workstream in this round owns.
 */
export class CapabilityPdfStore {
	private readonly logger = new Logger(CapabilityPdfStore.name)

	constructor(private readonly storageService: StorageService) {}

	/**
	 * The agreement's bytes: the stored copy when there is one, a fresh render otherwise. A render
	 * is uploaded on the way back, so the fallback repairs itself.
	 */
	async document(capabilityId: number, studentGradeId: number, data: CapabilityDocumentData): Promise<Buffer> {
		// An unagreed capability is still being edited, so a stored copy of it would go stale on the
		// next Simpan. It is rendered fresh every time — which is all legacy ever did — and never stored.
		if (!isFrozen(data)) return renderCapabilityPdf(data)

		const key = capabilityKey(capabilityId, studentGradeId)

		try {
			const stored = await this.storageService.getBuffer(key)
			if (stored !== null) return stored
		} catch (error) {
			// Storage is down rather than empty. Fall through and render: the admin came here for an
			// agreement, not for a report on the bucket.
			this.logger.warn(`Kesanggupan ${key} tidak terbaca dari S3, dirender ulang: ${message(error)}`)
		}

		const buffer = await renderCapabilityPdf(data)
		await this.upload(key, buffer)
		return buffer
	}

	/**
	 * Generates and stores the agreement for a capability that has just been published.
	 *
	 * Deliberately not awaited by its caller and deliberately unable to reject: the capability and
	 * its invoices are already committed, and the worst a failure here may cost is one render on the
	 * next download. The loader is a thunk so the row reads stay off the request that published.
	 */
	generateInBackground(
		capabilityId: number,
		studentGradeId: number,
		load: () => Promise<CapabilityDocumentData>,
	): void {
		void load()
			.then(async (data) => {
				if (!isFrozen(data)) return
				await this.upload(capabilityKey(capabilityId, studentGradeId), await renderCapabilityPdf(data))
			})
			.catch((error: unknown) => {
				this.logger.error(
					`Kesanggupan ${capabilityId} gagal dibuat, akan dibuat saat diunduh: ${message(error)}`,
				)
			})
	}

	/** Best effort: an agreement that cannot be stored is still an agreement that can be served. */
	private async upload(key: string, buffer: Buffer): Promise<void> {
		try {
			await this.storageService.uploadBuffer(buffer, key, CAPABILITY_CONTENT_TYPE)
		} catch (error) {
			this.logger.error(`Kesanggupan ${key} gagal diunggah ke S3: ${message(error)}`)
		}
	}
}

/**
 * **The entry point for the publish path (brief, seam 3 / P2-B).**
 *
 * One call, after the publish transaction has committed:
 *
 * ```ts
 * generateCapabilityPdfInBackground(this.storageService, this.dataSource, capabilityId, studentGradeId)
 * ```
 *
 * It returns `void`, never throws, never rejects, and never touches the database inside the
 * caller's transaction. Everything it needs — the row reads, the logo fetch, the render and the
 * upload — happens on its own microtask.
 */
export const generateCapabilityPdfInBackground = (
	storageService: StorageService,
	dataSource: DataSource,
	capabilityId: number,
	studentGradeId: number,
): void => {
	try {
		new CapabilityPdfStore(storageService).generateInBackground(capabilityId, studentGradeId, () =>
			loadCapabilityPdfData(storageService, dataSource, capabilityId, studentGradeId),
		)
	} catch (error) {
		// Constructing the store cannot realistically throw, but a publish must not be able to fail
		// on the way out of its own success path.
		new Logger(CapabilityPdfStore.name).error(
			`Kesanggupan ${capabilityId} gagal dijadwalkan: ${message(error)}`,
		)
	}
}

/**
 * The document's rows plus the school logo, which the download blade reads off the filesystem with
 * `storage_file_path()` and which lives on S3 here. A logo that cannot be fetched is not an error:
 * the blade's own `@else` branch prints the brand heading instead.
 */
export const loadCapabilityPdfData = async (
	storageService: StorageService,
	dataSource: DataSource,
	capabilityId: number,
	studentGradeId: number,
): Promise<CapabilityDocumentData> => {
	const base = await loadCapabilityDocument(dataSource, capabilityId, studentGradeId)
	return { ...base, logoUrl: null, logo: await loadLogo(storageService, base.school?.logo ?? null) }
}

const loadLogo = async (storageService: StorageService, path: string | null): Promise<Buffer | null> => {
	if (!path || /^https?:\/\//i.test(path)) return null
	try {
		return await storageService.getBuffer(path.replace(/^\/?storage\//, ""))
	} catch (error) {
		new Logger(CapabilityPdfStore.name).warn(`Logo sekolah tidak terbaca dari S3: ${message(error)}`)
		return null
	}
}
