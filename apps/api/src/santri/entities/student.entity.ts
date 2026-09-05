import { Column, Entity } from "typeorm"
import { BaseEntity } from "../../core/database/base.entity"

@Entity({ name: "tbr_students" })
export class Student extends BaseEntity {
	@Column({ name: "nis", nullable: true, type: "varchar", unique: true })
	nis: string | null

	@Column({ name: "email", nullable: true, type: "varchar", unique: true })
	email: string | null

	@Column({ name: "password", nullable: true, type: "varchar" })
	password: string | null

	@Column({ name: "email_verified_at", nullable: true, type: "varchar" })
	emailVerifiedAt: string | null

	@Column({ name: "remember_token", nullable: true, type: "varchar" })
	rememberToken: string | null

	@Column({ name: "enabled_2fa", type: "boolean", default: true })
	enabled2fa: boolean

	@Column({ name: "is_blocked", nullable: true, type: "boolean", default: false })
	isBlocked: boolean | null

	@Column({ name: "blocked_at", nullable: true, type: "timestamp" })
	blockedAt: Date | null

	@Column({ name: "academic_year_id", nullable: true, type: "bigint" })
	academicYearId: number | null

	@Column({ name: "source", nullable: true, type: "varchar" })
	source: "pendaftaran" | "santri lama" | "mutasi" | null

	@Column({ name: "student_status", nullable: true, type: "varchar" })
	studentStatus: "active" | "inactive" | null

	@Column({ name: "deleted_at", nullable: true, type: "timestamp" })
	deletedAt: Date | null
}
