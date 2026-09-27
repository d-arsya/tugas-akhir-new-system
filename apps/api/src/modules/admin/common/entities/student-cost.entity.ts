import { Column, Entity } from "typeorm"
import { BaseEntity } from "@core/database/base.entity"

@Entity({ name: "tbr_student_costs" })
export class StudentCost extends BaseEntity {
	@Column({ name: "stuco_term_id", nullable: true, type: "bigint" })
	stucoTermId: number | null

	@Column({ name: "amount", nullable: true, type: "bigint" })
	amount: number | null
}
