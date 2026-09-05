import { Column, Entity } from "typeorm"
import { BaseEntity } from "../../core/database/base.entity"

@Entity({ name: "tbr_student_transactions" })
export class StudentTransaction extends BaseEntity {
	@Column({ name: "student_transaction_code", nullable: true, type: "bigint" })
	studentTransactionCode: string | null

	@Column({ name: "paid_at", nullable: true, type: "timestamp" })
	paidAt: Date | null

	@Column({ name: "amount", nullable: true, type: "int" })
	amount: number | null

	@Column({ name: "desc", nullable: true, type: "varchar" })
	desc: string | null

	@Column({ name: "note", nullable: true, type: "text" })
	note: string | null

	@Column({ name: "status", nullable: true, type: "varchar", default: "valid" })
	status: "valid" | "invalid" | null

	@Column({ name: "cancel_note", nullable: true, type: "text" })
	cancelNote: string | null

	@Column({ name: "student_grade_id", nullable: true, type: "bigint" })
	studentGradeId: string | null
}
