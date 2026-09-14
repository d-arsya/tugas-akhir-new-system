import { Column, Entity } from "typeorm"
import { BaseEntity } from "../../../core/database/base.entity"

export type AdminUserRole = "Superadmin" | "Admin" | "Bendahara" | "Kasir E-Wallet" | "Merchant"

@Entity({ name: "tbr_users" })
export class User extends BaseEntity {
	@Column({ nullable: true, type: "varchar" })
	name: string | null

	@Column({ nullable: true, type: "varchar", unique: true })
	email: string | null

	@Column({ nullable: true, type: "varchar", length: 10 })
	gender: "male" | "female" | null

	@Column({ name: "is_blocked", nullable: true, type: "boolean", default: false })
	isBlocked: boolean | null

	@Column({ name: "blocked_at", nullable: true, type: "timestamp" })
	blockedAt: Date | null

	@Column({ nullable: true, type: "varchar", default: "Admin" })
	role: AdminUserRole | null

	@Column({ nullable: true, type: "varchar" })
	password: string | null

	@Column({ name: "weak_password", nullable: true, type: "boolean", default: false })
	weakPassword: boolean | null

	@Column({ name: "remember_token", nullable: true, type: "varchar" })
	rememberToken: string | null
}
