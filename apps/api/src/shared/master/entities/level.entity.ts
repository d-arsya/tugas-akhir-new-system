import { Column, Entity } from "typeorm"
import { BaseEntity } from "../../../core/database/base.entity"

@Entity({ name: "tbr_levels" })
export class Level extends BaseEntity {
	@Column({ nullable: true, type: "varchar" })
	name: string | null

	@Column({ nullable: true, type: "varchar", default: "show" })
	status: "show" | "hide" | null
}
