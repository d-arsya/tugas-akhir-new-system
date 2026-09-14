import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Accountancy } from "../entities/accountancy.entity"
import { StudentCostTerm } from "../entities/student-cost-term.entity"
import { StudentCost } from "../entities/student-cost.entity"
import { StudentGrade } from "../../santri/entities/student-grade.entity"
import { StudentInvoice } from "../../santri/entities/student-invoice.entity"
import { StudentTransaction } from "../../santri/entities/student-transaction.entity"
import { StudentInvoiceTransaction } from "../../santri/entities/student-invoice-transaction.entity"
import {
	CreateAccountancyDto,
	UpdateAccountancyDto,
	DelegateAccountancyChildrenDto,
	CreateCostTermDto,
	UpdateCostTermDto,
	BulkApplyCostTermDto,
	CreatePaymentTransactionDto,
	CancelTransactionDto,
} from "../dto/billing-admin.dto"

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
	) {}

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

	async getReportsIncome() {
		return this.transactionRepo.find({ where: { status: "valid" } })
	}

	async getReportsArrears() {
		return this.invoiceRepo.find({ where: { status: "unpaid" } })
	}
}
