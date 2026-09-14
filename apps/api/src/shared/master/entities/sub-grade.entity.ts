import { Column, Entity } from "typeorm"
import { BaseEntity } from "../../../core/database/base.entity"

@Entity({ name: "tbr_sub_grades" })
export class SubGrade extends BaseEntity {
	@Column({ nullable: true, type: "varchar" })
	label: string | null
}
