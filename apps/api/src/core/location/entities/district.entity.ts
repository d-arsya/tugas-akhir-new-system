import { Column, Entity, ManyToOne, OneToMany, JoinColumn } from "typeorm"
import { BaseEntity } from "../../database/base.entity"
import type { Regency } from "./regency.entity"
import type { Village } from "./village.entity"

@Entity({ name: "tbr_districts" })
export class District extends BaseEntity {
	@Column({ name: "regency_id", type: "int" })
	regencyId: number

	@Column({ type: "varchar", length: 255, nullable: true })
	name: string | null

	@ManyToOne("Regency", (regency: any) => regency.districts)
	@JoinColumn({ name: "regency_id" })
	regency: Regency

	@OneToMany("Village", (village: any) => village.district)
	villages: Village[]
}
