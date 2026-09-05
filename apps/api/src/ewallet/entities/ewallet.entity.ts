import { Column, Entity } from "typeorm"
import { BaseEntity } from "../../core/database/base.entity"

@Entity({ name: "tbr_ewallets" })
export class Ewallet extends BaseEntity {
	@Column({ name: "unique_id", nullable: true, type: "bigint" })
	uniqueId: string | null

	@Column({ name: "ewalletable_type", nullable: true, type: "varchar" })
	ewalletableType: string | null

	@Column({ name: "ewalletable_id", nullable: true, type: "varchar" })
	ewalletableId: string | null

	@Column({ name: "student_name", nullable: true, type: "varchar" })
	studentName: string | null

	@Column({ name: "student_grade_level", nullable: true, type: "varchar" })
	studentGradeLevel: string | null

	@Column({ name: "student_grade_number", nullable: true, type: "varchar" })
	studentGradeNumber: string | null

	@Column({ name: "student_father_fullname", nullable: true, type: "varchar" })
	studentFatherFullname: string | null

	@Column({ name: "pin", nullable: true, type: "int" })
	pin: number | null

	@Column({ name: "is_active", nullable: true, type: "boolean", default: true })
	isActive: boolean | null

	@Column({ name: "reset_pin_token", nullable: true, type: "varchar" })
	resetPinToken: string | null

	@Column({ name: "reset_pin_expired", nullable: true, type: "timestamp" })
	resetPinExpired: Date | null

	@Column({ name: "ewalletable_name", nullable: true, type: "varchar" })
	ewalletableName: string | null

	@Column({ name: "total_balance", nullable: true, type: "bigint" })
	totalBalance: string | null
}
