import { Column, Entity } from "typeorm"
import { BaseEntity } from "../../../core/database/base.entity"

@Entity({ name: "tbr_level_academic_years" })
export class LevelAcademicYear extends BaseEntity {
	@Column({ name: "level_id", nullable: true, type: "int" })
	levelId: number | null

	@Column({ name: "academic_year_id", nullable: true, type: "int" })
	academicYearId: number | null

	@Column({ nullable: true, type: "int", default: 0 })
	quota: number | null
}
