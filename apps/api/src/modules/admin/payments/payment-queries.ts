import type { EntityManager } from "typeorm"

import type { LinkSqlRow } from "@admin/payments/payment-format"
import { StudentInvoiceTransaction } from "@santri/entities/student-invoice-transaction.entity"
import { StudentTransaction } from "@santri/entities/student-transaction.entity"

export const findInvoiceLinks = async (manager: EntityManager, invoiceIds: number[]): Promise<LinkSqlRow[]> => {
	if (invoiceIds.length === 0) return []
	return manager
		.createQueryBuilder(StudentInvoiceTransaction, "lnk")
		.select("lnk.id", "id")
		.addSelect("lnk.studentInvoiceId", "studentInvoiceId")
		.addSelect("lnk.studentTransactionId", "studentTransactionId")
		.addSelect("lnk.pay", "pay")
		.addSelect("lnk.amount", "amount")
		.addSelect("trx.status", "transactionStatus")
		.leftJoin(StudentTransaction, "trx", "trx.id = lnk.studentTransactionId")
		.where("lnk.studentInvoiceId IN (:...invoiceIds)", { invoiceIds })
		.orderBy("lnk.id", "ASC")
		.getRawMany<LinkSqlRow>()
}

export const lockTransaction = (manager: EntityManager, transactionId: number): Promise<StudentTransaction | null> =>
	manager.findOne(StudentTransaction, { where: { id: transactionId }, lock: { mode: "pessimistic_write" } })
