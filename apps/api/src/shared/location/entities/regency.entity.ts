import { Column, Entity } from "typeorm"
import { BaseEntity } from "@core/database/base.entity"

@Entity({ name: "tbr_regencies" })
export class Regency extends BaseEntity {
	@Column({ name: "province_id", nullable: true, type: "int" })
	provinceId: number | null

	@Column({ nullable: true, type: "varchar" })
	name: string | null
}
