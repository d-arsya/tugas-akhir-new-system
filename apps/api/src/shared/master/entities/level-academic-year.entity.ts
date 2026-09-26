import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity({ name: "tbr_level_academic_years" })
export class LevelAcademicYear {
	@PrimaryGeneratedColumn()
	id: number

	@Column({ name: "level_id", nullable: true, type: "int" })
	levelId: number | null

	@Column({ name: "academic_year_id", nullable: true, type: "int" })
	academicYearId: number | null

	@Column({ nullable: true, type: "int", default: 0 })
	quota: number | null
}
