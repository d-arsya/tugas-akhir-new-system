import { Column, Entity } from "typeorm"
import { BaseEntity } from "@core/database/base.entity"

@Entity({ name: "tbr_provinces" })
export class Province extends BaseEntity {
	@Column({ nullable: true, type: "varchar" })
	name: string | null
}
