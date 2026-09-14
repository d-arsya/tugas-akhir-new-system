import { Column, Entity } from "typeorm"
import { BaseEntity } from "../../../core/database/base.entity"

@Entity({ name: "tbr_student_costs" })
export class StudentCost extends BaseEntity {
	@Column({ name: "cost_term_id", type: "int" })
	costTermId: number

	@Column({ name: "amount", type: "decimal", precision: 12, scale: 2 })
	amount: number

	@Column({ name: "name", nullable: true, type: "varchar" })
	name: string | null
}
