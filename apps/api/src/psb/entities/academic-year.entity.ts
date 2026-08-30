import { Column, Entity } from "typeorm"
import { BaseEntity } from "../../core/database/base.entity"

@Entity({ name: "tbr_academic_years" })
export class AcademicYear extends BaseEntity {
	@Column({ nullable: true, type: "varchar" })
	year: string | null

	@Column({ name: "active_kbm", nullable: true, type: "date" })
	activeKbm: string | null

	@Column({ nullable: true, type: "text" })
	note: string | null

	@Column({ name: "serial_number", nullable: true, type: "varchar" })
	serialNumber: string | null

	@Column({ nullable: true, type: "varchar", length: 20 })
	type: "reguler" | "indent" | null

	@Column({ nullable: true, type: "boolean" })
	status: boolean | null

	@Column({ name: "cost_date_start", nullable: true, type: "date" })
	costDateStart: string | null

	@Column({ name: "cost_date_end", nullable: true, type: "date" })
	costDateEnd: string | null

	@Column({ name: "is_current", nullable: true, type: "boolean", default: false })
	isCurrent: boolean | null
}
