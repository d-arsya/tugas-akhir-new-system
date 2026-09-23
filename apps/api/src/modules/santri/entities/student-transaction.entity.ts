import { Column, Entity } from "typeorm"
import { BaseEntity } from "@core/database/base.entity"

@Entity({ name: "tbr_student_transactions" })
export class StudentTransaction extends BaseEntity {
	@Column({ name: "student_transaction_code", nullable: true, type: "bigint" })
	studentTransactionCode: string | null

	@Column({ name: "paid_at", nullable: true, type: "timestamptz" })
	paidAt: Date | null

	@Column({ name: "amount", nullable: true, type: "bigint" })
	amount: number | null

	@Column({ name: "desc", nullable: true, type: "varchar" })
	desc: string | null

	@Column({ name: "note", nullable: true, type: "text" })
	note: string | null

	@Column({ name: "status", type: "text", default: "valid" })
	status: "valid" | "invalid"

	@Column({ name: "cancel_note", nullable: true, type: "text" })
	cancelNote: string | null

	@Column({ name: "student_grade_id", nullable: true, type: "bigint" })
	studentGradeId: string | null
}
