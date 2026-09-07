import { Column, Entity } from "typeorm"
import { BaseEntity } from "@core/database/base.entity"

@Entity({ name: "tbr_ewallet_transactions" })
export class EwalletTransaction extends BaseEntity {
	@Column({ name: "ewallet_id", nullable: true, type: "bigint" })
	ewalletId: string | null

	@Column({ name: "code", nullable: true, type: "varchar" })
	code: string | null

	@Column({ name: "name", nullable: true, type: "varchar" })
	name: string | null

	@Column({ name: "type", nullable: true, type: "varchar" })
	type: "income" | "expense" | "purchase" | null

	@Column({ name: "amount", nullable: true, type: "bigint" })
	amount: string | null

	@Column({ name: "status", nullable: true, type: "varchar" })
	status: string | null

	@Column({ name: "payment_method", nullable: true, type: "varchar" })
	paymentMethod: string | null

	@Column({ name: "payment_date", nullable: true, type: "timestamp" })
	paymentDate: Date | null

	@Column({ name: "payment_attachment", nullable: true, type: "varchar" })
	paymentAttachment: string | null

	@Column({ name: "payment_amount", nullable: true, type: "bigint" })
	paymentAmount: string | null

	@Column({ name: "payment_account", nullable: true, type: "varchar" })
	paymentAccount: string | null

	@Column({ name: "payment_on_behalf_of", nullable: true, type: "varchar" })
	paymentOnBehalfOf: string | null

	@Column({ name: "payment_note", nullable: true, type: "text" })
	paymentNote: string | null

	@Column({ name: "invalid_note", nullable: true, type: "text" })
	invalidNote: string | null

	@Column({ name: "transfer_news_number", nullable: true, type: "smallint" })
	transferNewsNumber: number | null
}
