import { Column, Entity } from "typeorm"
import { BaseEntity } from "@core/database/base.entity"

@Entity({ name: "tbr_two_factor_students" })
export class TwoFactorStudent extends BaseEntity {
	@Column({ name: "student_id", nullable: true, type: "varchar" })
	studentId: string | null

	@Column({ name: "two_factor_ip", nullable: true, type: "varchar" })
	twoFactorIp: string | null

	@Column({ name: "two_factor_code", nullable: true, type: "varchar" })
	twoFactorCode: string | null

	@Column({ name: "two_factor_expires_at", nullable: true, type: "timestamp" })
	twoFactorExpiresAt: Date | null
}
