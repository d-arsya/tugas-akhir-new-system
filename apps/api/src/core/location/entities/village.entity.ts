import { Column, Entity, ManyToOne, JoinColumn } from "typeorm"
import { BaseEntity } from "../../database/base.entity"
import type { District } from "./district.entity"

@Entity({ name: "tbr_villages" })
export class Village extends BaseEntity {
	@Column({ name: "district_id", type: "int" })
	districtId: number

	@Column({ type: "varchar", length: 255, nullable: true })
	name: string | null

	@Column({ type: "varchar", length: 255, nullable: true })
	code: string | null

	@ManyToOne("District", (district: any) => district.villages)
	@JoinColumn({ name: "district_id" })
	district: District
}
