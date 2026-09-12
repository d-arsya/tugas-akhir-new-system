import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm"

@Entity({ name: "tbr_merchant_password_resets" })
export class MerchantPasswordReset {
	@Column({ type: "varchar" })
	email: string

	@PrimaryColumn({ type: "varchar" })
	token: string

	@CreateDateColumn({ name: "created_at", nullable: true })
	createdAt: Date | null
}
