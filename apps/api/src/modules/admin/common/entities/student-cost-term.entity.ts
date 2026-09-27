import { Column, Entity } from "typeorm"
import { BaseEntity } from "@core/database/base.entity"

@Entity({ name: "tbr_student_cost_terms" })
export class StudentCostTerm extends BaseEntity {
	@Column({ name: "accountancy_id", nullable: true, type: "bigint" })
	accountancyId: number | null

	@Column({ name: "academic_year_id", nullable: true, type: "bigint" })
	academicYearId: number | null

	@Column({ name: "type", nullable: true, type: "text" })
	type: "maximum" | "option" | null

	@Column({ name: "period", nullable: true, type: "text" })
	period: "once" | "monthly" | null

	@Column({ name: "month_of", nullable: true, type: "bigint" })
	monthOf: number | null

	@Column({ name: "day_of", nullable: true, type: "bigint" })
	dayOf: number | null

	@Column({ name: "time_span", nullable: true, type: "bigint" })
	timeSpan: number | null

	@Column({ name: "reminder", nullable: true, type: "bigint" })
	reminder: number | null

	@Column({ name: "grade", nullable: true, type: "varchar" })
	grade: string | null

	@Column({ name: "applied", nullable: true, type: "boolean" })
	applied: boolean | null
}
