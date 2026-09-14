import { Column, Entity } from "typeorm"
import { BaseEntity } from "../../../core/database/base.entity"

@Entity({ name: "tbr_grades" })
export class Grade extends BaseEntity {
	@Column({ name: "level_id", nullable: true, type: "int" })
	levelId: number | null

	@Column({ nullable: true, type: "int" })
	label: number | null
}
