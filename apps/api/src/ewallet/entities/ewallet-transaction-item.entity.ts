import { Column, Entity } from "typeorm"
import { BaseEntity } from "../../core/database/base.entity"

@Entity({ name: "tbr_ewallet_transaction_items" })
export class EwalletTransactionItem extends BaseEntity {
	@Column({ name: "ewallet_transaction_id", nullable: true, type: "bigint" })
	ewalletTransactionId: string | null

	@Column({ name: "description", type: "text" })
	description: string

	@Column({ name: "price", type: "int" })
	price: number
}
