import { Column, Entity } from "typeorm"
import { BaseEntity } from "../../../core/database/base.entity"

/**
 * Legacy `student_costs` (App\Models\StudentCost).
 * Columns verified against the live schema: id, stuco_term_id, amount, timestamps.
 * There is no `name` column, and the FK is `stuco_term_id` — not `cost_term_id`.
 */
@Entity({ name: "tbr_student_costs" })
export class StudentCost extends BaseEntity {
	@Column({ name: "stuco_term_id", nullable: true, type: "bigint" })
	stucoTermId: number | null

	@Column({ name: "amount", nullable: true, type: "bigint" })
	amount: number | null
}
