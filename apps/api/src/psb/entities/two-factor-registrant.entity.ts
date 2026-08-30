import { Column, Entity } from "typeorm"
import { BaseEntity } from "../../core/database/base.entity"

@Entity({ name: "tbr_two_factor_registrants" })
export class TwoFactorRegistrant extends BaseEntity {
	@Column({ name: "registrant_id", nullable: true, type: "varchar" })
	registrantId: string | null

	@Column({ name: "two_factor_ip", nullable: true, type: "varchar" })
	twoFactorIp: string | null

	@Column({ name: "two_factor_code", nullable: true, type: "varchar" })
	twoFactorCode: string | null

	@Column({ name: "two_factor_expires_at", nullable: true, type: "timestamp" })
	twoFactorExpiresAt: Date | null
}
