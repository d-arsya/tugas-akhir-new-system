import { Column, Entity, ManyToOne, JoinColumn } from "typeorm"
import { BaseEntity } from "../../database/base.entity"
import { Regency } from "./regency.entity"

@Entity({ name: "tbr_districts" })
export class District extends BaseEntity {
	@Column({ name: "regency_id", type: "int" })
	regencyId: number

	@Column({ type: "varchar", length: 255, nullable: true })
	name: string | null

	@ManyToOne(() => Regency, (regency) => regency.districts)
	@JoinColumn({ name: "regency_id" })
	regency: Regency
}
