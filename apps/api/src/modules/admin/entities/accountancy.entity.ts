import { Column, Entity } from "typeorm"
import { BaseEntity } from "../../../core/database/base.entity"

@Entity({ name: "tbr_accountancies" })
export class Accountancy extends BaseEntity {
	@Column({ name: "name", type: "varchar" })
	name: string

	@Column({ name: "is_parent", type: "boolean", default: false })
	isParent: boolean

	@Column({ name: "parent_id", nullable: true, type: "varchar" })
	parentId: string | null

	@Column({ name: "group", nullable: true, type: "varchar", length: 20 })
	group: "income" | "expense" | null

	@Column({ name: "is_student_cost", type: "boolean", default: false })
	isStudentCost: boolean

	@Column({ name: "note", nullable: true, type: "text" })
	note: string | null
}
