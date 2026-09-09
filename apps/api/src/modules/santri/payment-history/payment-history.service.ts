import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { In, LessThan, Repository } from "typeorm"
import { StudentGrade } from "@santri/entities/student-grade.entity"
import { StudentInvoiceTransaction } from "@santri/entities/student-invoice-transaction.entity"
import { StudentInvoice } from "@santri/entities/student-invoice.entity"
import { StudentTransaction } from "@santri/entities/student-transaction.entity"
import { Student } from "@santri/entities/student.entity"

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

	async getSummary(studentId: number, page = 1, limit = 10) {
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
				totalBilled: 0,
				totalPaid: 0,
				remaining: 0,
				invoices: [],
				meta: {
					page,
					limit,
					total: 0,
					totalPages: 0,
				},
			}
		}

		const invoiceIds = invoices.map((inv) => Number(inv.id))
		const invoiceTxns = await this.invoiceTransactionRepository.find({
			where: { studentInvoiceId: In(invoiceIds) },
		})

		const txnIds = [
			...new Set(
				invoiceTxns
					.map((it) => (it.studentTransactionId !== null && it.studentTransactionId !== undefined ? Number(it.studentTransactionId) : null))
					.filter((id): id is number => id !== null && !isNaN(id)),
			),
		]
		const validTxns = txnIds.length
			? await this.transactionRepository.find({
				where: { id: In(txnIds), status: "valid" },
			})
			: []
		const validTxnMap = new Map(validTxns.map((t) => [Number(t.id), t]))

		let totalBilled = 0
		let totalPaid = 0

		const formattedInvoices = invoices.map((inv) => {
			const invAmount = Number(inv.amount || 0)
			totalBilled += invAmount

			const invTxns = invoiceTxns.filter(
				(it) =>
					it.studentInvoiceId !== null &&
					it.studentTransactionId !== null &&
					Number(it.studentInvoiceId) === Number(inv.id) &&
					validTxnMap.has(Number(it.studentTransactionId)),
			)

			let paid = invTxns.reduce((sum, item) => sum + Number(item.pay ?? item.amount ?? 0), 0)
			if (inv.status === "paid" && paid < invAmount) {
				paid = invAmount
			}

			totalPaid += paid
			const remaining = Math.max(0, invAmount - paid)

			let statusLabel: "Lunas" | "Cicilan" | "Belum Bayar" = "Belum Bayar"
			if (inv.status === "paid" || paid >= invAmount) {
				statusLabel = "Lunas"
			} else if (paid > 0 || inv.paymentMethod === "installment") {
				statusLabel = "Cicilan"
			}

			return {
				id: inv.id,
				name: inv.name,
				amount: invAmount,
				paidAmount: paid,
				remainingAmount: remaining,
				status: inv.status,
				statusLabel,
				paymentMethod: inv.paymentMethod,
				dueDate: inv.dueDate,
				reminder: inv.reminder,
				note: inv.note,
			}
		})

		const remaining = Math.max(0, totalBilled - totalPaid)
		const total = formattedInvoices.length
		const startIndex = (page - 1) * limit
		const paginatedInvoices = formattedInvoices.slice(startIndex, startIndex + limit)

		return {
			totalBilled,
			totalPaid,
			remaining,
			invoices: paginatedInvoices,
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
			data: summary.invoices,
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

		const invoiceTxns = await this.invoiceTransactionRepository.find({
			where: { studentInvoiceId: invoiceId },
		})

		const txnIds = [
			...new Set(
				invoiceTxns
					.map((it) => (it.studentTransactionId !== null && it.studentTransactionId !== undefined ? Number(it.studentTransactionId) : null))
					.filter((id): id is number => id !== null && !isNaN(id)),
			),
		]
		const validTxns = txnIds.length
			? await this.transactionRepository.find({
				where: { id: In(txnIds), status: "valid" },
				order: { paidAt: "DESC" },
			})
			: []

		const validTxnMap = new Map(validTxns.map((t) => [Number(t.id), t]))

		const allTransactions = invoiceTxns
			.filter(
				(it) =>
					it.studentTransactionId !== null &&
					it.studentTransactionId !== undefined &&
					validTxnMap.has(Number(it.studentTransactionId)),
			)
			.map((it) => {
				const parentTxn = validTxnMap.get(Number(it.studentTransactionId))!
				const totalTxnAmount = Number(parentTxn.amount ?? 0)
				const invoicePayAmount = Number(it.pay ?? it.amount ?? parentTxn.amount ?? 0)
				return {
					id: parentTxn.id,
					transactionCode: parentTxn.studentTransactionCode,
					paidAt: parentTxn.paidAt,
					amount: totalTxnAmount,
					invoicePayAmount,
					desc: parentTxn.desc,
					description: parentTxn.desc,
					note: parentTxn.note,
					status: parentTxn.status,
				}
			})

		const invAmount = Number(invoice.amount || 0)
		let totalPaid = invoiceTxns.reduce((sum, it) => sum + Number(it.pay ?? it.amount ?? 0), 0)
		if (invoice.status === "paid" && totalPaid < invAmount) {
			totalPaid = invAmount
		}

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
