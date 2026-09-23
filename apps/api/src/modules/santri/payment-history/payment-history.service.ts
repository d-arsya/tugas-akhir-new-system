import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { In, LessThan, Repository } from "typeorm"
import { StudentGrade } from "@santri/entities/student-grade.entity"
import { StudentInvoiceTransaction } from "@santri/entities/student-invoice-transaction.entity"
import { StudentInvoice } from "@santri/entities/student-invoice.entity"
import { StudentTransaction } from "@santri/entities/student-transaction.entity"
import { Student } from "@santri/entities/student.entity"
import {
	calculatePaid,
	resolveStatusLabel,
	selectCountedLinks,
	toAmount,
	toId,
} from "@shared/billing/invoice-calculator"

@Injectable()
export class PaymentHistoryService {
	constructor(
		@InjectRepository(Student)
		private readonly studentRepository: Repository<Student>,
		@InjectRepository(StudentGrade)
		private readonly studentGradeRepository: Repository<StudentGrade>,
		@InjectRepository(StudentInvoice)
		private readonly invoiceRepository: Repository<StudentInvoice>,
		@InjectRepository(StudentTransaction)
		private readonly transactionRepository: Repository<StudentTransaction>,
		@InjectRepository(StudentInvoiceTransaction)
		private readonly invoiceTransactionRepository: Repository<StudentInvoiceTransaction>,
	) { }

	/** Ids of the transactions behind these links that are still `valid` — cancelled ones never count. */
	private async validTransactionIds(links: StudentInvoiceTransaction[]): Promise<Set<number>> {
		const ids = [
			...new Set(
				links
					.map((link) => toId(link.studentTransactionId))
					.filter((id): id is number => id !== null),
			),
		]
		if (!ids.length) return new Set<number>()
		const valid = await this.transactionRepository.find({
			where: { id: In(ids), status: "valid" },
		})
		return new Set(valid.map((transaction) => Number(transaction.id)))
	}

	async getSummary(studentId: number, page = 1, limit = 10, status?: string, search?: string) {
		const invoices = await this.invoiceRepository.find({
			where: [
				{ studentId, validityStatus: true, status: "paid" },
				{ studentId, validityStatus: true, paymentMethod: "installment" },
				{ studentId, validityStatus: true, reminder: LessThan(new Date().toISOString()) },
			],
			order: { dueDate: "ASC" },
		})

		if (!invoices.length) {
			return {
				data: {
					totalBilled: 0,
					totalPaid: 0,
					remaining: 0,
					invoices: [],
				},
				meta: {
					page,
					limit,
					total: 0,
					totalPages: 0,
				},
			}
		}

		const invoiceIds = invoices.map((inv) => Number(inv.id))
		const links = await this.invoiceTransactionRepository.find({
			where: { studentInvoiceId: In(invoiceIds) },
		})
		const validIds = await this.validTransactionIds(links)

		let totalBilled = 0
		let totalPaid = 0

		const formattedInvoices = invoices.map((inv) => {
			const invAmount = toAmount(inv.amount)
			const paid = calculatePaid(inv, links, validIds)

			totalBilled += invAmount
			totalPaid += paid

			return {
				id: inv.id,
				name: inv.name,
				amount: invAmount,
				paidAmount: paid,
				remainingAmount: Math.max(0, invAmount - paid),
				status: inv.status,
				statusLabel: resolveStatusLabel(inv, paid),
				paymentMethod: inv.paymentMethod,
				dueDate: inv.dueDate,
				reminder: inv.reminder,
				note: inv.note,
			}
		})

		const remaining = Math.max(0, totalBilled - totalPaid)

		let filteredInvoices = formattedInvoices
		if (search) {
			const q = search.toLowerCase()
			filteredInvoices = filteredInvoices.filter(
				(inv) =>
					(inv.name && inv.name.toLowerCase().includes(q)) ||
					(inv.status && String(inv.status).toLowerCase().includes(q)),
			)
		}
		if (status) {
			filteredInvoices = filteredInvoices.filter((inv) => {
				const st = String(inv.status)
				if (status === "sudah") return st === "paid"
				if (status === "belum") return st === "unpaid"
				if (status === "angsur") return st === "installment" || inv.paymentMethod === "installment" || inv.statusLabel === "Cicilan"
				return st === status
			})
		}

		const total = filteredInvoices.length
		const startIndex = (page - 1) * limit
		const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + limit)

		return {
			data: {
				totalBilled,
				totalPaid,
				remaining,
				invoices: paginatedInvoices,
			},
			meta: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit) || 1,
			},
		}
	}

	async getInvoiceList(studentId: number, page = 1, limit = 10) {
		const summary = await this.getSummary(studentId, page, limit)
		return {
			data: summary.data.invoices,
			meta: summary.meta,
		}
	}

	async getInvoiceDetail(invoiceId: number, studentId: number, page = 1, limit = 10) {
		const invoice = await this.invoiceRepository.findOne({
			where: { id: invoiceId, studentId, validityStatus: true },
		})

		if (!invoice) {
			throw new NotFoundException("Tagihan tidak ditemukan")
		}

		const student = await this.studentRepository.findOne({
			where: { id: studentId },
		})

		if (!student) {
			throw new NotFoundException("Data santri tidak ditemukan")
		}

		const activeGrade = await this.studentGradeRepository.findOne({
			where: { studentId, gradeStatus: "active" },
			order: { id: "DESC" },
		})

		const studentName = activeGrade?.fullname ?? student.nis ?? "Santri"

		const links = await this.invoiceTransactionRepository.find({
			where: { studentInvoiceId: invoiceId },
		})
		const validIds = await this.validTransactionIds(links)

		const orderedValid = validIds.size
			? await this.transactionRepository.find({
				where: { id: In([...validIds]), status: "valid" },
				order: { paidAt: "DESC" },
			})
			: []
		const validTxnMap = new Map(orderedValid.map((t) => [Number(t.id), t]))

		const allTransactions = selectCountedLinks(invoiceId, links, validIds).map((link) => {
			const parentTxn = validTxnMap.get(Number(toId(link.studentTransactionId)))!
			return {
				id: parentTxn.id,
				transactionCode: parentTxn.studentTransactionCode,
				paidAt: parentTxn.paidAt,
				amount: toAmount(parentTxn.amount),
				invoicePayAmount: toAmount(link.pay ?? link.amount ?? parentTxn.amount),
				desc: parentTxn.desc,
				description: parentTxn.desc,
				note: parentTxn.note,
				status: parentTxn.status,
			}
		})

		const invAmount = toAmount(invoice.amount)
		const totalPaid = calculatePaid(invoice, links, validIds)

		const costRemain = Math.max(0, invAmount - totalPaid)
		const totalTxnsCount = allTransactions.length
		const startIndex = (page - 1) * limit
		const paginatedTransactions = allTransactions.slice(startIndex, startIndex + limit)

		return {
			invoice: {
				id: invoice.id,
				name: invoice.name,
				amount: invAmount,
				status: invoice.status,
				paymentMethod: invoice.paymentMethod,
				dueDate: invoice.dueDate,
				reminder: invoice.reminder,
				note: invoice.note,
			},
			student: {
				id: student.id,
				nis: student.nis,
				fullName: studentName,
			},
			studentName,
			studentNis: student.nis ?? "",
			transactions: paginatedTransactions,
			totalPaid,
			costRemain,
			meta: {
				page,
				limit,
				total: totalTxnsCount,
				totalPages: Math.ceil(totalTxnsCount / limit) || 1,
			},
		}
	}
}
