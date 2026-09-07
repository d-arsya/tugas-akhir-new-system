import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { In, LessThan, Repository } from "typeorm"
import { StudentInvoiceTransaction } from "@santri/entities/student-invoice-transaction.entity"
import { StudentInvoice } from "@santri/entities/student-invoice.entity"
import { StudentTransaction } from "@santri/entities/student-transaction.entity"

@Injectable()
export class PaymentHistoryService {
	constructor(
		@InjectRepository(StudentInvoice)
		private readonly invoiceRepository: Repository<StudentInvoice>,
		@InjectRepository(StudentTransaction)
		private readonly transactionRepository: Repository<StudentTransaction>,
		@InjectRepository(StudentInvoiceTransaction)
		private readonly invoiceTransactionRepository: Repository<StudentInvoiceTransaction>,
	) {}

	async getSummary(studentId: number) {
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
			}
		}

		const invoiceIds = invoices.map((inv) => inv.id)
		const invoiceTxns = await this.invoiceTransactionRepository.find({
			where: { studentInvoiceId: In(invoiceIds) },
		})

		const txnIds = [...new Set(invoiceTxns.map((it) => it.studentTransactionId).filter((id): id is number => id !== null))]
		const validTxns = txnIds.length
			? await this.transactionRepository.find({
					where: { id: In(txnIds), status: "valid" },
			  })
			: []
		const validTxnIdSet = new Set(validTxns.map((t) => t.id))

		let totalBilled = 0
		let totalPaid = 0

		const formattedInvoices = invoices.map((inv) => {
			const invAmount = Number(inv.amount || 0)
			totalBilled += invAmount

			const invTxns = invoiceTxns.filter(
				(it) => it.studentInvoiceId === inv.id && it.studentTransactionId && validTxnIdSet.has(it.studentTransactionId),
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

		return {
			totalBilled,
			totalPaid,
			remaining,
			invoices: formattedInvoices,
		}
	}

	async getInvoiceList(studentId: number) {
		const summary = await this.getSummary(studentId)
		return summary.invoices
	}

	async getInvoiceDetail(invoiceId: number, studentId: number) {
		const invoice = await this.invoiceRepository.findOne({
			where: { id: invoiceId, studentId, validityStatus: true },
		})

		if (!invoice) {
			throw new NotFoundException("Tagihan tidak ditemukan")
		}

		const invoiceTxns = await this.invoiceTransactionRepository.find({
			where: { studentInvoiceId: invoiceId },
		})

		const txnIds = [...new Set(invoiceTxns.map((it) => it.studentTransactionId).filter((id): id is number => id !== null))]
		const validTxns = txnIds.length
			? await this.transactionRepository.find({
					where: { id: In(txnIds), status: "valid" },
					order: { paidAt: "DESC" },
			  })
			: []

		const validTxnMap = new Map(validTxns.map((t) => [t.id, t]))

		const transactions = invoiceTxns
			.filter((it) => it.studentTransactionId && validTxnMap.has(it.studentTransactionId))
			.map((it) => {
				const parentTxn = validTxnMap.get(it.studentTransactionId!)!
				const payAmount = Number(it.pay ?? it.amount ?? parentTxn.amount ?? 0)
				return {
					id: parentTxn.id,
					transactionCode: parentTxn.studentTransactionCode,
					paidAt: parentTxn.paidAt,
					amount: payAmount,
					description: parentTxn.desc,
					note: parentTxn.note,
					status: parentTxn.status,
				}
			})

		const invAmount = Number(invoice.amount || 0)
		let totalPaid = transactions.reduce((sum, t) => sum + t.amount, 0)
		if (invoice.status === "paid" && totalPaid < invAmount) {
			totalPaid = invAmount
		}

		const costRemain = Math.max(0, invAmount - totalPaid)

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
			transactions,
			totalPaid,
			costRemain,
		}
	}
}
