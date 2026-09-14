import { Column, Entity } from "typeorm"
import { BaseEntity } from "../../../core/database/base.entity"

@Entity({ name: "tbr_student_cost_terms" })
export class StudentCostTerm extends BaseEntity {
	@Column({ name: "accountancy_id", type: "int" })
	accountancyId: number

	@Column({ name: "academic_year_id", type: "int" })
	academicYearId: number

	@Column({ name: "type", type: "varchar", length: 20, default: "maximum" })
	type: "maximum" | "option"

	@Column({ name: "period", type: "varchar", length: 20, default: "once" })
	period: "once" | "monthly"

	@Column({ name: "month_of", nullable: true, type: "int" })
	monthOf: number | null

	@Column({ name: "day_of", nullable: true, type: "int" })
	dayOf: number | null

	@Column({ name: "time_span", nullable: true, type: "int" })
	timeSpan: number | null

	@Column({ name: "reminder", nullable: true, type: "int" })
	reminder: number | null

	@Column({ name: "grade", type: "varchar", length: 10 })
	grade: string

	@Column({ name: "applied", type: "boolean", default: false })
	applied: boolean
}
