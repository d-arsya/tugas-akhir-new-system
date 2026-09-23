import { Column, Entity } from "typeorm"
import { BaseEntity } from "../../../core/database/base.entity"

/**
 * Legacy `student_cost_terms` (App\Models\StudentCostTerm). Every column is
 * nullable in the migration, and `applied` really is NULL on a freshly stored
 * term — legacy only sets it from the "Terapkan item yang di checklist" action.
 *
 * `grade` stores the Grade **label** as text (see the Data Master research file,
 * §C.7): that is what `store()` writes, and what the Kesanggupan module reads.
 */
@Entity({ name: "tbr_student_cost_terms" })
export class StudentCostTerm extends BaseEntity {
	@Column({ name: "accountancy_id", nullable: true, type: "int" })
	accountancyId: number | null

	@Column({ name: "academic_year_id", nullable: true, type: "int" })
	academicYearId: number | null

	@Column({ name: "type", nullable: true, type: "text" })
	type: "maximum" | "option" | null

	@Column({ name: "period", nullable: true, type: "text" })
	period: "once" | "monthly" | null

	@Column({ name: "month_of", nullable: true, type: "int" })
	monthOf: number | null

	@Column({ name: "day_of", nullable: true, type: "int" })
	dayOf: number | null

	@Column({ name: "time_span", nullable: true, type: "int" })
	timeSpan: number | null

	@Column({ name: "reminder", nullable: true, type: "int" })
	reminder: number | null

	@Column({ name: "grade", nullable: true, type: "varchar" })
	grade: string | null

	@Column({ name: "applied", nullable: true, type: "boolean" })
	applied: boolean | null
}
