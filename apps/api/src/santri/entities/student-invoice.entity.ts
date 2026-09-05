import { Column, Entity } from "typeorm"
import { BaseEntity } from "../../core/database/base.entity"

@Entity({ name: "tbr_student_invoices" })
export class StudentInvoice extends BaseEntity {
	@Column({ name: "student_id", nullable: true, type: "int" })
	studentId: number | null

	@Column({ name: "name", nullable: true, type: "varchar" })
	name: string | null

	@Column({ name: "amount", nullable: true, type: "int" })
	amount: number | null

	@Column({ name: "status", nullable: true, type: "varchar" })
	status: "paid" | "unpaid" | null

	@Column({ name: "payment_method", nullable: true, type: "varchar" })
	paymentMethod: "cash" | "installment" | null

	@Column({ name: "due_date", nullable: true, type: "date" })
	dueDate: string | null

	@Column({ name: "reminder", nullable: true, type: "date" })
	reminder: string | null

	@Column({ name: "note", nullable: true, type: "varchar" })
	note: string | null

	@Column({ name: "accountancy_id", nullable: true, type: "bigint" })
	accountancyId: string | null

	@Column({ name: "due_date_academic_year", nullable: true, type: "varchar" })
	dueDateAcademicYear: string | null

	@Column({ name: "due_date_grade", nullable: true, type: "varchar" })
	dueDateGrade: string | null

	@Column({ name: "due_date_sub_grade", nullable: true, type: "varchar" })
	dueDateSubGrade: string | null

	@Column({ name: "unique_id", nullable: true, type: "varchar" })
	uniqueId: string | null

	@Column({ name: "validity_status", nullable: true, type: "boolean" })
	validityStatus: boolean | null

	@Column({ name: "student_grade_id", nullable: true, type: "bigint" })
	studentGradeId: string | null
}
