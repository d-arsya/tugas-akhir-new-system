import { Column, Entity } from "typeorm"
import { BaseEntity } from "../../../core/database/base.entity"

@Entity({ name: "tbr_majors" })
export class Major extends BaseEntity {
	@Column({ name: "level_id", nullable: true, type: "int" })
	levelId: number | null

	@Column({ nullable: true, type: "varchar" })
	name: string | null

	@Column({ nullable: true, type: "text" })
	desc: string | null
}
