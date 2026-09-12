import { Column, Entity } from "typeorm"
import { BaseEntity } from "@core/database/base.entity"

@Entity({ name: "tbr_merchants" })
export class Merchant extends BaseEntity {
	@Column({ name: "name", nullable: true, type: "varchar" })
	name: string | null

	@Column({ name: "email", nullable: true, type: "varchar", unique: true })
	email: string | null

	@Column({ name: "photo", nullable: true, type: "varchar" })
	photo: string | null

	@Column({ name: "unique_number", type: "varchar", unique: true })
	uniqueNumber: string

	@Column({ name: "phone", nullable: true, type: "varchar" })
	phone: string | null

	@Column({ name: "address", nullable: true, type: "text" })
	address: string | null

	@Column({ name: "merchant_name", nullable: true, type: "varchar" })
	merchantName: string | null

	@Column({ name: "gender", nullable: true, type: "varchar" })
	gender: string | null

	@Column({ name: "email_verified_at", nullable: true, type: "timestamp" })
	emailVerifiedAt: Date | null

	@Column({ name: "is_blocked", nullable: true, type: "boolean", default: false })
	isBlocked: boolean | null

	@Column({ name: "blocked_at", nullable: true, type: "timestamp" })
	blockedAt: Date | null

	@Column({ name: "password", type: "varchar" })
	password: string

	@Column({ name: "enabled_2fa", type: "boolean", default: true })
	enabled2fa: boolean

	@Column({ name: "remember_token", nullable: true, type: "varchar" })
	rememberToken: string | null
}
