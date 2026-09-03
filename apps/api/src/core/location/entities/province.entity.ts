import { Column, Entity, OneToMany } from "typeorm"
import { BaseEntity } from "../../database/base.entity"
import type { Regency } from "./regency.entity"

@Entity({ name: "tbr_provinces" })
export class Province extends BaseEntity {
	@Column({ type: "varchar", length: 255, nullable: true })
	name: string | null

	@OneToMany("Regency", (regency: any) => regency.province)
	regencies: Regency[]
}
