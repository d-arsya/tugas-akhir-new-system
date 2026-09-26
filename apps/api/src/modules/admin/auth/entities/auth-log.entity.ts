import { Column, Entity } from "typeorm"
import { BaseEntity } from "@core/database/base.entity"

export type LoginStatus = "Logged In" | "Failed" | "Logged Out" | "Verification"

@Entity({ name: "tbr_auth_logs" })
export class AuthLog extends BaseEntity {
	@Column({ name: "user_id", nullable: true, type: "int" })
	userId: number | null

	@Column({ nullable: true, type: "varchar" })
	email: string | null

	@Column({ name: "remember_me", nullable: true, type: "varchar" })
	rememberMe: string | null

	@Column({ name: "ip_address", nullable: true, type: "varchar" })
	ipAddress: string | null

	@Column({ name: "session_id", nullable: true, type: "varchar" })
	sessionId: string | null

	@Column({ nullable: true, type: "varchar" })
	guard: string | null

	@Column({ name: "user_agent", nullable: true, type: "text" })
	userAgent: string | null

	@Column({ nullable: true, type: "varchar" })
	os: string | null

	@Column({ nullable: true, type: "varchar" })
	duration: string | null

	@Column({ name: "login_at", nullable: true, type: "timestamp" })
	loginAt: Date | null

	@Column({ name: "logout_at", nullable: true, type: "timestamp" })
	logoutAt: Date | null

	@Column({ name: "login_status", nullable: true, type: "varchar" })
	loginStatus: LoginStatus | null
}
