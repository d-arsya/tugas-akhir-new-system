import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, In } from "typeorm"
import { Accountancy } from "@admin/entities/accountancy.entity"
import { StudentCostTerm } from "@admin/entities/student-cost-term.entity"
import { StudentCost } from "@admin/entities/student-cost.entity"
import { StudentGrade } from "../../santri/entities/student-grade.entity"
import { StudentInvoice } from "../../santri/entities/student-invoice.entity"
import { StudentTransaction } from "../../santri/entities/student-transaction.entity"
import { StudentInvoiceTransaction } from "../../santri/entities/student-invoice-transaction.entity"
import { Student } from "../../santri/entities/student.entity"
import {
	CreateAccountancyDto,
	UpdateAccountancyDto,
	DelegateAccountancyChildrenDto,
	CreateCostTermDto,
	UpdateCostTermDto,
	BulkApplyCostTermDto,
	CreatePaymentTransactionDto,
	CancelTransactionDto,
	ReportIncomeFilterDto,
	ReportArrearsFilterDto,
} from "@admin/dto/billing-admin.dto"

@Injectable()
export class BillingAdminService {
	constructor(
		@InjectRepository(Accountancy)
		private readonly accountancyRepo: Repository<Accountancy>,
		@InjectRepository(StudentCostTerm)
		private readonly costTermRepo: Repository<StudentCostTerm>,
		@InjectRepository(StudentCost)
		private readonly costRepo: Repository<StudentCost>,
		@InjectRepository(StudentGrade)
		private readonly studentGradeRepo: Repository<StudentGrade>,
		@InjectRepository(StudentInvoice)
		private readonly invoiceRepo: Repository<StudentInvoice>,
		@InjectRepository(StudentTransaction)
		private readonly transactionRepo: Repository<StudentTransaction>,
		@InjectRepository(StudentInvoiceTransaction)
		private readonly invoiceTxRepo: Repository<StudentInvoiceTransaction>,
		@InjectRepository(Student)
		private readonly studentRepo: Repository<Student>,
	) { }

	// --- Chart of Accounts ---
	async getAccountancyTree() {
		return this.accountancyRepo.find({ order: { id: "ASC" } })
	}

	async createAccountancy(dto: CreateAccountancyDto) {
		const acc = this.accountancyRepo.create({
			name: dto.name,
			isParent: dto.isParent ?? false,
			parentId: dto.parentId ?? null,
			group: dto.group ?? null,
			isStudentCost: dto.isStudentCost ?? false,
			note: dto.note ?? null,
		})
		return this.accountancyRepo.save(acc)
	}

	async updateAccountancy(id: number, dto: UpdateAccountancyDto) {
		const acc = await this.accountancyRepo.findOneBy({ id })
		if (!acc) throw new NotFoundException(`Accountancy #${id} not found`)
		Object.assign(acc, dto)
		return this.accountancyRepo.save(acc)
	}

	async deleteAccountancy(id: number) {
		const acc = await this.accountancyRepo.findOneBy({ id })
		if (!acc) throw new NotFoundException(`Accountancy #${id} not found`)
		await this.accountancyRepo.remove(acc)
		return { success: true, message: `Accountancy #${id} deleted` }
	}

	async delegateChildren(id: number, dto: DelegateAccountancyChildrenDto) {
		await this.accountancyRepo.update({ parentId: String(id) }, { parentId: dto.newParentId })
		return { success: true, message: "Children delegated successfully" }
	}

	// --- Cost Terms per Class ---
	async getCostTerms(academicYearId: number, gradeId: number) {
		return this.costTermRepo.find({
			where: { academicYearId, grade: String(gradeId) },
		})
	}

	async createCostTerm(academicYearId: number, gradeId: number, accountancyId: number, dto: CreateCostTermDto) {
		const term = this.costTermRepo.create({
			accountancyId,
			academicYearId,
			grade: String(gradeId),
			type: dto.type,
			period: dto.period,
			monthOf: dto.monthOf ?? null,
			dayOf: dto.dayOf ?? null,
			timeSpan: dto.timeSpan ?? null,
			reminder: dto.reminder ?? null,
			applied: false,
		})
		const savedTerm = await this.costTermRepo.save(term)

		for (const amt of dto.amounts) {
			const cost = this.costRepo.create({
				costTermId: savedTerm.id,
				amount: amt,
			})
			await this.costRepo.save(cost)
		}

		return savedTerm
	}

	async updateCostTerm(academicYearId: number, gradeId: number, accountancyId: number, dto: UpdateCostTermDto) {
		const term = await this.costTermRepo.findOne({
			where: { academicYearId, grade: String(gradeId), accountancyId },
		})
		if (!term) throw new NotFoundException("Cost term not found")
		if (term.applied) throw new BadRequestException("Cannot edit cost term that has been applied")

		Object.assign(term, dto)
		return this.costTermRepo.save(term)
	}

	async bulkApplyCostTerms(academicYearId: number, gradeId: number, dto: BulkApplyCostTermDto) {
		const students = await this.studentGradeRepo.find({
			where: { grade: gradeId, gradeStatus: "active" },
		})

		for (const termId of dto.costTermIds) {
			const term = await this.costTermRepo.findOneBy({ id: termId })
			if (!term) continue

			const costs = await this.costRepo.find({ where: { costTermId: term.id } })
			const amount = costs[0]?.amount || 0

			for (const s of students) {
				const invoice = this.invoiceRepo.create({
					studentId: s.studentId ?? null,
					studentGradeId: String(s.id),
					accountancyId: String(term.accountancyId),
					amount: Number(amount),
					status: "unpaid",
				})
				await this.invoiceRepo.save(invoice)
			}

			term.applied = true
			await this.costTermRepo.save(term)
		}

		return { success: true, count: dto.costTermIds.length }
	}

	// --- Student Billing & Invoices ---
	async getStudentInvoices(studentGradeId: number) {
		return this.invoiceRepo.find({ where: { studentGradeId: String(studentGradeId) } })
	}

	async getStudentTransactions(studentGradeId: number) {
		return this.transactionRepo.find({ where: { studentGradeId: String(studentGradeId) } })
	}

	async createPayment(studentGradeId: number, dto: CreatePaymentTransactionDto) {
		const txCode = String(Date.now())
		const tx = this.transactionRepo.create({
			studentGradeId: String(studentGradeId),
			amount: dto.paidAmount,
			studentTransactionCode: txCode,
			status: "valid",
			note: dto.note ?? null,
			paidAt: new Date(),
		})
		const savedTx = await this.transactionRepo.save(tx)

		let remainingPaid = dto.paidAmount
		for (const invId of dto.invoiceIds) {
			const inv = await this.invoiceRepo.findOneBy({ id: invId })
			if (!inv) continue

			const unpaidAmount = inv.amount || 0
			const currentAlloc = Math.min(remainingPaid, unpaidAmount)

			if (currentAlloc >= unpaidAmount) {
				inv.status = "paid"
				inv.paymentMethod = "cash"
			} else {
				inv.status = "unpaid"
				inv.paymentMethod = "installment"
			}
			await this.invoiceRepo.save(inv)

			const pivot = this.invoiceTxRepo.create({
				studentTransactionId: savedTx.id,
				studentInvoiceId: inv.id,
				amount: currentAlloc,
				pay: currentAlloc,
			})
			await this.invoiceTxRepo.save(pivot)

			remainingPaid -= currentAlloc
			if (remainingPaid <= 0) break
		}

		return savedTx
	}

	async cancelTransaction(id: number, dto: CancelTransactionDto) {
		const tx = await this.transactionRepo.findOneBy({ id })
		if (!tx) throw new NotFoundException(`Transaction #${id} not found`)

		tx.status = "invalid"
		tx.cancelNote = dto.cancelNote
		await this.transactionRepo.save(tx)

		const pivots = await this.invoiceTxRepo.find({ where: { studentTransactionId: id } })
		for (const p of pivots) {
			if (!p.studentInvoiceId) continue
			const inv = await this.invoiceRepo.findOneBy({ id: p.studentInvoiceId })
			if (inv) {
				inv.status = "unpaid"
				await this.invoiceRepo.save(inv)
			}
		}

		return { success: true, message: "Transaction cancelled successfully" }
	}

	async getReportsIncome(filter?: ReportIncomeFilterDto) {
		const qb = this.transactionRepo.createQueryBuilder("tx")
			.where("tx.status = :status", { status: "valid" })
			.orderBy("tx.paid_at", "DESC")

		if (filter?.dateStart) {
			qb.andWhere("tx.paid_at >= :dateStart", { dateStart: new Date(filter.dateStart) })
		}
		if (filter?.dateEnd) {
			const endDate = new Date(filter.dateEnd)
			endDate.setHours(23, 59, 59, 999)
			qb.andWhere("tx.paid_at <= :dateEnd", { dateEnd: endDate })
		}

		const txs = await qb.getMany()
		const result = []

		for (const tx of txs) {
			let studentName = "-"
			let nis = "-"
			let gradeName = "-"
			let subGradeName = "-"
			let feeName = tx.desc || tx.note || "Biaya Pendidikan"

			if (tx.studentGradeId) {
				const sg = await this.studentGradeRepo.findOneBy({ id: Number(tx.studentGradeId) })
				if (sg) {
					if (filter?.grade && String(sg.grade) !== String(filter.grade)) continue
					if (filter?.subGrade && String(sg.subGrade) !== String(filter.subGrade)) continue
					studentName = sg.fullname || "-"
					gradeName = sg.grade ? `Kelas ${sg.grade}` : "-"
					subGradeName = sg.subGrade || "-"

					if (sg.studentId) {
						const student = await this.studentRepo.findOneBy({ id: sg.studentId })
						if (student?.nis) nis = student.nis
					}
				}
			}

			const pivot = await this.invoiceTxRepo.findOne({ where: { studentTransactionId: tx.id } })
			if (pivot?.studentInvoiceId) {
				const inv = await this.invoiceRepo.findOneBy({ id: pivot.studentInvoiceId })
				if (inv?.accountancyId) {
					const acc = await this.accountancyRepo.findOneBy({ id: Number(inv.accountancyId) })
					if (acc?.name) feeName = acc.name
				} else if (inv?.name) {
					feeName = inv.name
				}
			}

			result.push({
				id: tx.id,
				transactionCode: tx.studentTransactionCode || `TX-${tx.id}`,
				paidAt: tx.paidAt,
				amount: Number(tx.amount) || 0,
				note: tx.note || tx.desc || "-",
				studentName,
				nis,
				grade: gradeName,
				subGrade: subGradeName,
				feeName,
			})
		}

		return result
	}

	async getReportsIncomeRecap(filter?: ReportIncomeFilterDto) {
		const list = await this.getReportsIncome(filter)
		const map = new Map<string, { feeName: string; totalAmount: number; count: number }>()

		for (const item of list) {
			const key = item.feeName || "Biaya Santri"
			const existing = map.get(key) || { feeName: key, totalAmount: 0, count: 0 }
			existing.totalAmount += item.amount
			existing.count += 1
			map.set(key, existing)
		}

		return Array.from(map.values()).sort((a, b) => b.totalAmount - a.totalAmount)
	}

	async getReportsArrears(filter?: ReportArrearsFilterDto) {
		const page = Math.max(1, filter?.page ?? 1)
		const limit = Math.max(1, filter?.limit ?? 20)
		const skip = (page - 1) * limit
		const now = new Date()

		const qb = this.invoiceRepo.createQueryBuilder("inv")
			.where("inv.status = :status", { status: "unpaid" })
			.andWhere("inv.dueDate < :now", { now })
			.andWhere("(inv.validityStatus = :validity OR inv.validityStatus IS NULL)", { validity: true })

		if (filter?.dateStart) {
			qb.andWhere("inv.dueDate >= :dateStart", { dateStart: filter.dateStart })
		}
		if (filter?.dateEnd) {
			qb.andWhere("inv.dueDate <= :dateEnd", { dateEnd: filter.dateEnd })
		}
		if (filter?.academicYearId) {
			qb.andWhere("(inv.dueDateAcademicYear = :ayId OR inv.dueDateAcademicYear IS NULL)", { ayId: String(filter.academicYearId) })
		}
		if (filter?.grade) {
			qb.andWhere("inv.dueDateGrade = :grade", { grade: String(filter.grade) })
		}
		if (filter?.subGrade) {
			qb.andWhere("inv.dueDateSubGrade = :subGrade", { subGrade: String(filter.subGrade) })
		}
		if (filter?.accountancyId) {
			qb.andWhere("inv.accountancyId = :accId", { accId: String(filter.accountancyId) })
		}

		const total = await qb.getCount()

		qb.orderBy("inv.dueDate", "ASC")
			.skip(skip)
			.take(limit)

		const invoices = await qb.getMany()
		if (invoices.length === 0) {
			return { items: [], total, page, limit, totalPages: 1 }
		}

		const invoiceIds = invoices.map((i) => i.id)

		// Batch fetch partial payments from transactions (O(1) Map lookup)
		const txs = await this.invoiceTxRepo.findBy({ studentInvoiceId: In(invoiceIds) })
		const payMap = new Map<number, number>()
		for (const tx of txs) {
			if (tx.studentInvoiceId && tx.pay) {
				const curr = payMap.get(tx.studentInvoiceId) || 0
				payMap.set(tx.studentInvoiceId, curr + Number(tx.pay))
			}
		}

		// Batch fetch student grades, students, and accountancy records
		const sgIds = [...new Set(invoices.map((i) => Number(i.studentGradeId)).filter(Boolean))]
		const accIds = [...new Set(invoices.map((i) => Number(i.accountancyId)).filter(Boolean))]

		const studentGrades = sgIds.length > 0 ? await this.studentGradeRepo.findBy({ id: In(sgIds) }) : []
		const sgMap = new Map(studentGrades.map((sg) => [sg.id, sg]))

		const studentIds = [...new Set(studentGrades.map((sg) => sg.studentId).filter(Boolean))]
		const students = studentIds.length > 0 ? await this.studentRepo.findBy({ id: In(studentIds) }) : []
		const studentMap = new Map(students.map((s) => [s.id, s]))

		const accounts = accIds.length > 0 ? await this.accountancyRepo.findBy({ id: In(accIds) }) : []
		const accMap = new Map(accounts.map((acc) => [acc.id, acc]))

		const nowTime = now.getTime()
		const items = invoices.map((inv) => {
			let studentName = "-"
			let nis = "-"
			let gradeName = inv.dueDateGrade ? `Kelas ${inv.dueDateGrade}` : "-"
			let subGradeName = inv.dueDateSubGrade || "-"
			let feeName = inv.name || "Tagihan Biaya"

			if (inv.studentGradeId) {
				const sg = sgMap.get(Number(inv.studentGradeId))
				if (sg) {
					studentName = sg.fullname || "-"
					if (!inv.dueDateGrade && sg.grade) gradeName = `Kelas ${sg.grade}`
					if (!inv.dueDateSubGrade && sg.subGrade) subGradeName = sg.subGrade

					if (sg.studentId) {
						const student = studentMap.get(sg.studentId)
						if (student?.nis) nis = student.nis
					}
				}
			}

			if (inv.accountancyId) {
				const acc = accMap.get(Number(inv.accountancyId))
				if (acc?.name) feeName = acc.name
			}

			const paid = payMap.get(Number(inv.id)) || 0
			const rawAmt = Number(inv.amount) || 0
			const finalAmount = inv.paymentMethod === "installment" && inv.status === "unpaid"
				? rawAmt - paid
				: rawAmt

			const dueTime = inv.dueDate ? new Date(inv.dueDate).getTime() : nowTime
			const diffDays = Math.max(0, Math.floor((nowTime - dueTime) / (1000 * 60 * 60 * 24)))

			let agingBucket: "0-30" | "31-60" | "61-90" | "90+" = "0-30"
			if (diffDays > 90) agingBucket = "90+"
			else if (diffDays > 60) agingBucket = "61-90"
			else if (diffDays > 30) agingBucket = "31-60"

			return {
				id: inv.id,
				uniqueId: inv.uniqueId || `INV-${inv.id}`,
				studentName,
				nis,
				feeName,
				amount: finalAmount,
				dueDate: inv.dueDate,
				agingDays: diffDays,
				agingBucket,
				grade: gradeName,
				subGrade: subGradeName,
				academicYear: inv.dueDateAcademicYear ?? undefined,
			}
		})

		const totalPages = Math.ceil(total / limit) || 1

		return {
			items,
			total,
			page,
			limit,
			totalPages,
		}
	}

	async getArrearsAgingSummary(filter?: ReportArrearsFilterDto) {
		const now = new Date()
		const qb = this.invoiceRepo.createQueryBuilder("inv")
			.where("inv.status = :status", { status: "unpaid" })
			.andWhere("inv.dueDate < :now", { now })
			.andWhere("(inv.validityStatus = :validity OR inv.validityStatus IS NULL)", { validity: true })

		if (filter?.dateStart) {
			qb.andWhere("inv.dueDate >= :dateStart", { dateStart: filter.dateStart })
		}
		if (filter?.dateEnd) {
			qb.andWhere("inv.dueDate <= :dateEnd", { dateEnd: filter.dateEnd })
		}
		if (filter?.academicYearId) {
			qb.andWhere("(inv.dueDateAcademicYear = :ayId OR inv.dueDateAcademicYear IS NULL)", { ayId: String(filter.academicYearId) })
		}
		if (filter?.grade) {
			qb.andWhere("inv.dueDateGrade = :grade", { grade: String(filter.grade) })
		}
		if (filter?.subGrade) {
			qb.andWhere("inv.dueDateSubGrade = :subGrade", { subGrade: String(filter.subGrade) })
		}
		if (filter?.accountancyId) {
			qb.andWhere("inv.accountancyId = :accId", { accId: String(filter.accountancyId) })
		}

		const invoices = await qb.getMany()
		if (invoices.length === 0) {
			return {
				totalAmount: 0,
				totalCount: 0,
				buckets: {
					"0-30": { label: "≤ 30 Hari", count: 0, totalAmount: 0, color: "emerald" },
					"31-60": { label: "31 - 60 Hari", count: 0, totalAmount: 0, color: "amber" },
					"61-90": { label: "61 - 90 Hari", count: 0, totalAmount: 0, color: "orange" },
					"90+": { label: "> 90 Hari", count: 0, totalAmount: 0, color: "rose" },
				},
			}
		}

		const invoiceIds = invoices.map((i) => i.id)
		const txs = await this.invoiceTxRepo.createQueryBuilder("tx")
			.where("tx.student_invoice_id IN (:...invoiceIds)", { invoiceIds: invoiceIds.length > 0 ? invoiceIds : [0] })
			.getMany()

		const payMap = new Map<number, number>()
		for (const tx of txs) {
			if (tx.studentInvoiceId && tx.pay) {
				const curr = payMap.get(Number(tx.studentInvoiceId)) || 0
				payMap.set(Number(tx.studentInvoiceId), curr + Number(tx.pay))
			}
		}

		const nowTime = now.getTime()
		const summary = {
			totalAmount: 0,
			totalCount: invoices.length,
			buckets: {
				"0-30": { label: "≤ 30 Hari", count: 0, totalAmount: 0, color: "emerald" },
				"31-60": { label: "31 - 60 Hari", count: 0, totalAmount: 0, color: "amber" },
				"61-90": { label: "61 - 90 Hari", count: 0, totalAmount: 0, color: "orange" },
				"90+": { label: "> 90 Hari", count: 0, totalAmount: 0, color: "rose" },
			},
		}

		for (const inv of invoices) {
			const paid = payMap.get(Number(inv.id)) || 0
			const rawAmt = Number(inv.amount) || 0
			const finalAmount = inv.paymentMethod === "installment" && inv.status === "unpaid"
				? rawAmt - paid
				: rawAmt

			summary.totalAmount += finalAmount
			const dueTime = inv.dueDate ? new Date(inv.dueDate).getTime() : nowTime
			const diffDays = Math.max(0, Math.floor((nowTime - dueTime) / (1000 * 60 * 60 * 24)))

			let key: "0-30" | "31-60" | "61-90" | "90+" = "0-30"
			if (diffDays > 90) key = "90+"
			else if (diffDays > 60) key = "61-90"
			else if (diffDays > 30) key = "31-60"

			const b = summary.buckets[key]
			if (b) {
				b.count += 1
				b.totalAmount += finalAmount
			}
		}

		return summary
	}
}

