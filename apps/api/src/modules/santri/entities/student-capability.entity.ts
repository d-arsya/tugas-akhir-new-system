import { Column, Entity } from "typeorm"
import { BaseEntity } from "../../../core/database/base.entity"

@Entity({ name: "tbr_student_capabilities" })
export class StudentCapability extends BaseEntity {
	@Column({ name: "student_id", nullable: true, type: "bigint" })
	studentId: number | null

	@Column({ name: "student_grade_id", nullable: true, type: "bigint" })
	studentGradeId: number | null

	@Column({ name: "approve_date", nullable: true, type: "timestamptz" })
	approveDate: Date | null

	@Column({ name: "status", nullable: true, type: "text" })
	status: "approve" | "disapprove" | "changed" | null

	@Column({ name: "note", nullable: true, type: "varchar" })
	note: string | null
}
