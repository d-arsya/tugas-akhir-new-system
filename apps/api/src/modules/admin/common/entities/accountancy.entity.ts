import { Column, Entity } from "typeorm"
import { BaseEntity } from "@core/database/base.entity"

@Entity({ name: "tbr_accountancies" })
export class Accountancy extends BaseEntity {
	@Column({ name: "name", nullable: true, type: "varchar", length: 191 })
	name: string | null

	@Column({ name: "is_parent", nullable: true, type: "boolean" })
	isParent: boolean | null

	@Column({ name: "parent_id", nullable: true, type: "varchar", length: 191 })
	parentId: string | null

	@Column({ name: "group", nullable: true, type: "text" })
	group: "income" | "expense" | null

	@Column({ name: "is_student_cost", nullable: true, type: "boolean" })
	isStudentCost: boolean | null

	@Column({ name: "note", nullable: true, type: "varchar", length: 191 })
	note: string | null
}
