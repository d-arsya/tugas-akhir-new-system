import { Column, Entity } from "typeorm"
import { BaseEntity } from "../../../core/database/base.entity"

@Entity({ name: "tbr_alumnis" })
export class Alumni extends BaseEntity {
	@Column({ name: "student_id", nullable: true, type: "bigint" })
	studentId: number | null

	@Column({ name: "nis", nullable: true, type: "varchar" })
	nis: string | null

	@Column({ name: "level_id", nullable: true, type: "bigint" })
	levelId: number | null

	@Column({ name: "major_name", nullable: true, type: "varchar" })
	majorName: string | null

	@Column({ name: "grade", nullable: true, type: "int" })
	grade: number | null

	@Column({ name: "academic_year", nullable: true, type: "varchar" })
	academicYear: string | null

	@Column({ name: "academic_year_id", nullable: true, type: "varchar" })
	academicYearId: string | null

	@Column({ name: "graduate_at", nullable: true, type: "timestamp" })
	graduateAt: Date | null

	@Column({ name: "fullname", nullable: true, type: "varchar" })
	fullname: string | null

	@Column({ name: "gender", nullable: true, type: "varchar" })
	gender: string | null

	@Column({ name: "alumni_talent", nullable: true, type: "varchar" })
	alumniTalent: string | null

	@Column({ name: "advanced_study", nullable: true, type: "varchar" })
	advancedStudy: string | null

	@Column({ name: "profession", nullable: true, type: "varchar" })
	profession: string | null

	@Column({ name: "marriage_status", nullable: true, type: "varchar" })
	marriageStatus: string | null

	@Column({ name: "alumni_phone", nullable: true, type: "varchar" })
	alumniPhone: string | null

	@Column({ name: "alumni_email", nullable: true, type: "varchar" })
	alumniEmail: string | null
}
