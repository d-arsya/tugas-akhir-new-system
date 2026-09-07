import { Column, Entity } from "typeorm"
import { BaseEntity } from "@core/database/base.entity"

@Entity({ name: "tbr_ewallet_transaction_details" })
export class EwalletTransactionDetail extends BaseEntity {
	@Column({ name: "ewallet_id", nullable: true, type: "bigint" })
	ewalletId: string | null

	@Column({ name: "ewallet_transaction_id", nullable: true, type: "bigint" })
	ewalletTransactionId: string | null
}
