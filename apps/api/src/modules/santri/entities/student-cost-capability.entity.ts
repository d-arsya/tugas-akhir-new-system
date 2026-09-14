import { Column, Entity } from "typeorm"
import { BaseEntity } from "../../../core/database/base.entity"

@Entity({ name: "tbr_student_cost_capabilities" })
export class StudentCostCapability extends BaseEntity {
	@Column({ name: "student_cap_id", nullable: true, type: "int" })
	studentCapId: number | null

	@Column({ name: "accountancy_id", nullable: true, type: "int" })
	accountancyId: number | null

	@Column({ name: "amount", nullable: true, type: "int" })
	amount: number | null
}
