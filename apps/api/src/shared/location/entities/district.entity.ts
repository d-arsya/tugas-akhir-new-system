import { Column, Entity } from "typeorm"
import { BaseEntity } from "@core/database/base.entity"

@Entity({ name: "tbr_districts" })
export class District extends BaseEntity {
	@Column({ name: "regency_id", nullable: true, type: "int" })
	regencyId: number | null

	@Column({ nullable: true, type: "varchar" })
	name: string | null
}
