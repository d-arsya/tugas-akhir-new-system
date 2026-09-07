import { Column, Entity } from "typeorm"
import { BaseEntity } from "@core/database/base.entity"

@Entity({ name: "tbr_villages" })
export class Village extends BaseEntity {
	@Column({ name: "district_id", nullable: true, type: "int" })
	districtId: number | null

	@Column({ nullable: true, type: "varchar" })
	code: string | null

	@Column({ nullable: true, type: "varchar" })
	name: string | null
}
