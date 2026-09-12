import { Column, Entity } from "typeorm"
import { BaseEntity } from "@core/database/base.entity"

@Entity({ name: "tbr_two_factor_merchants" })
export class MerchantTwoFactor extends BaseEntity {
	@Column({ name: "merchant_id", nullable: true, type: "varchar" })
	merchantId: string | null

	@Column({ name: "two_factor_ip", nullable: true, type: "varchar" })
	twoFactorIp: string | null

	@Column({ name: "two_factor_code", nullable: true, type: "varchar" })
	twoFactorCode: string | null

	@Column({ name: "two_factor_expires_at", nullable: true, type: "timestamp" })
	twoFactorExpiresAt: Date | null
}
