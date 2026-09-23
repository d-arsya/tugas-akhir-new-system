import { Column, Entity } from "typeorm"
import { BaseEntity } from "../../../core/database/base.entity"

@Entity({ name: "tbr_student_cost_capabilities" })
export class StudentCostCapability extends BaseEntity {
	@Column({ name: "student_cap_id", nullable: true, type: "bigint" })
	studentCapId: number | null

	@Column({ name: "accountancy_id", nullable: true, type: "bigint" })
	accountancyId: number | null

	@Column({ name: "amount", nullable: true, type: "bigint" })
	amount: number | null
}
