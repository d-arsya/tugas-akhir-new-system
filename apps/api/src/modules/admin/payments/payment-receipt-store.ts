// Where a rendered receipt lives between the payment that produced it and the admin who downloads
// it. Legacy re-rendered on every click (`downloadTransaction:822-845`); this generates once, when
// the payment is recorded, and keeps the PDF on S3.
//
// Two rules shape the rest of this file:
//
//   1. **Recording money must not depend on storage.** The receipt is derived from the payment, so
//      a bucket that is full, unreachable or misconfigured can never be a reason for a transaction
//      to fail or roll back. `generateInBackground` runs after the database transaction has
//      committed, returns nothing, and cannot reject.
//   2. **There has to be an on-demand path anyway.** 9,712 transactions predate this code and have
//      no stored receipt, and a failed upload leaves a newer one in the same position. `receipt()`
//      renders whatever is missing and stores it on the way past, so the first download of an old
//      payment is also its last render.

import { Logger, NotFoundException } from "@nestjs/common"
import type { DataSource } from "typeorm"

import { StorageService } from "@core/storage/storage.service"
import {
	NOT_FOUND,
	type ReceiptData,
	type ReceiptItem,
	type ReceiptSchool,
	type ReceiptTransaction,
} from "@admin/payments/payment-format"
import { RECEIPT_CONTENT_TYPE, renderReceiptPdf } from "@admin/payments/payment-receipt-pdf"
import { StudentGrade } from "@santri/entities/student-grade.entity"
import { StudentInvoiceTransaction } from "@santri/entities/student-invoice-transaction.entity"
import { StudentInvoice } from "@santri/entities/student-invoice.entity"
import { StudentTransaction } from "@santri/entities/student-transaction.entity"
import { Student } from "@santri/entities/student.entity"
import { District } from "@shared/location/entities/district.entity"
import { Province } from "@shared/location/entities/province.entity"
import { Regency } from "@shared/location/entities/regency.entity"
import { SettingSchool } from "@shared/school/entities/setting-school.entity"

/**
 * The three rows behind both receipt documents — `downloadTransaction` and
 * `printTransaction` read the same figures and differ only in layout.
 */
export const loadReceiptData = async (
	dataSource: DataSource,
	transactionId: number,
): Promise<ReceiptData> => {
	const transaction = await dataSource
		.createQueryBuilder(StudentTransaction, "t")
		.select("t.id", "id")
		.addSelect("t.studentTransactionCode", "transactionCode")
		.addSelect("t.paidAt", "paidAt")
		.addSelect("t.amount", "amount")
		.addSelect("t.desc", "desc")
		.addSelect("t.status", "status")
		.addSelect("sg.fullname", "fullname")
		.addSelect("sg.grade", "grade")
		.addSelect("sg.subGrade", "subGrade")
		.addSelect("s.nis", "nis")
		.leftJoin(StudentGrade, "sg", "sg.id = t.studentGradeId")
		.leftJoin(Student, "s", "s.id = sg.studentId")
		.where("t.id = :transactionId", { transactionId })
		.getRawOne<ReceiptTransaction>()
	if (!transaction) throw new NotFoundException(NOT_FOUND)

	const [items, school] = await Promise.all([
		dataSource
			.createQueryBuilder(StudentInvoiceTransaction, "lnk")
			.select("lnk.id", "id")
			.addSelect("lnk.studentInvoiceId", "invoiceId")
			.addSelect("lnk.pay", "pay")
			.addSelect("i.name", "name")
			.leftJoin(StudentInvoice, "i", "i.id = lnk.studentInvoiceId")
			.where("lnk.studentTransactionId = :transactionId", { transactionId })
			.orderBy("lnk.id", "ASC")
			.getRawMany<ReceiptItem>(),
		dataSource
			.createQueryBuilder(SettingSchool, "ss")
			.select("ss.name", "name")
			.addSelect("ss.phone", "phone")
			.addSelect("ss.fullAddress", "fullAddress")
			.addSelect("d.name", "districtName")
			.addSelect("r.name", "regencyName")
			.addSelect("p.name", "provinceName")
			.leftJoin(District, "d", "d.id = ss.districtId")
			.leftJoin(Regency, "r", "r.id = ss.regencyId")
			.leftJoin(Province, "p", "p.id = ss.provinceId")
			.orderBy("ss.id", "ASC")
			.limit(1)
			.getRawOne<ReceiptSchool>(),
	])

	return { transaction, items, school: school ?? null }
}

/**
 * The object key for one transaction's receipt.
 *
 * Keyed by the transaction id, which is what makes it collision-free and makes re-generation
 * idempotent: the same payment always writes the same key, so a second render replaces the first
 * rather than leaving an orphan. The transaction code rides along because it is immutable and
 * makes an object self-describing in the bucket; it is reduced to the characters a key can hold,
 * and a transaction without one — none exist, but the column is nullable — falls back to a
 * constant, so the id alone still decides the key.
 */
export const receiptKey = (transactionId: number, transactionCode: string | null): string => {
	const code = (transactionCode ?? "").replace(/[^A-Za-z0-9_-]/g, "")
	return `receipts/student-transactions/${transactionId}/${code === "" ? "receipt" : code}.pdf`
}

/**
 * A plain collaborator rather than a Nest provider: registering one would mean editing
 * `admin.module.ts`, which this round does not own, and it needs nothing from the container that
 * `PaymentAdminService` cannot hand it.
 */
export class PaymentReceiptStore {
	private readonly logger = new Logger(PaymentReceiptStore.name)

	constructor(private readonly storageService: StorageService) {}

	/**
	 * The receipt bytes for a transaction: the stored copy when there is one, a fresh render
	 * otherwise. A render is uploaded on the way back, so the fallback repairs itself.
	 *
	 * Rendering is deterministic for a given payment — the pivot rows it prices never change once
	 * written, and `renderReceiptPdf` pins the document's creation date to `paid_at` — so a stored
	 * copy and a fresh one are the same bytes, and it does not matter which the admin receives.
	 */
	async receipt(transactionId: number, data: ReceiptData): Promise<Buffer> {
		const key = receiptKey(transactionId, data.transaction.transactionCode)

		try {
			const stored = await this.storageService.getBuffer(key)
			if (stored !== null) return stored
		} catch (error) {
			// Storage is down rather than empty. Fall through and render: the admin came here for a
			// receipt, not for a report on the bucket.
			this.logger.warn(`Kuitansi ${key} tidak terbaca dari S3, dirender ulang: ${message(error)}`)
		}

		const buffer = await renderReceiptPdf(data)
		await this.upload(key, buffer)
		return buffer
	}

	/**
	 * Generates and stores the receipt for a payment that has just been committed.
	 *
	 * Deliberately not awaited by its caller and deliberately unable to reject: the payment is
	 * already recorded, and the worst a failure here may cost is one render on the next download.
	 * The loader is a thunk so the row read stays off the request that recorded the payment too.
	 */
	generateInBackground(transactionId: number, load: () => Promise<ReceiptData>): void {
		void load()
			.then(async (data) => {
				const key = receiptKey(transactionId, data.transaction.transactionCode)
				await this.upload(key, await renderReceiptPdf(data))
			})
			.catch((error: unknown) => {
				this.logger.error(
					`Kuitansi pembayaran ${transactionId} gagal dibuat, akan dibuat saat diunduh: ${message(error)}`,
				)
			})
	}

	/** Best effort: a receipt that cannot be stored is still a receipt that can be served. */
	private async upload(key: string, buffer: Buffer): Promise<void> {
		try {
			await this.storageService.uploadBuffer(buffer, key, RECEIPT_CONTENT_TYPE)
		} catch (error) {
			this.logger.error(`Kuitansi ${key} gagal diunggah ke S3: ${message(error)}`)
		}
	}
}

const message = (error: unknown): string => (error instanceof Error ? error.message : String(error))
