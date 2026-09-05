import { Column, Entity } from "typeorm"
import { BaseEntity } from "../../core/database/base.entity"

@Entity({ name: "tbr_student_invoice_transactions" })
export class StudentInvoiceTransaction extends BaseEntity {
	@Column({ name: "student_transaction_id", nullable: true, type: "int" })
	studentTransactionId: number | null

	@Column({ name: "student_invoice_id", nullable: true, type: "int" })
	studentInvoiceId: number | null

	@Column({ name: "pay", nullable: true, type: "int" })
	pay: number | null

	@Column({ name: "amount", nullable: true, type: "int" })
	amount: number | null
}
