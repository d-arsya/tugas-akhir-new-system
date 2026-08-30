import { Column, Entity } from "typeorm"
import { BaseEntity } from "../../core/database/base.entity"

@Entity({ name: "tbr_setting_forms" })
export class SettingForm extends BaseEntity {
	@Column({ nullable: true, type: "varchar" })
	type: string | null

	@Column({ nullable: true, type: "text" })
	helper: string | null

	@Column({ nullable: true, type: "varchar" })
	group: string | null

	@Column({ name: "sub_group", nullable: true, type: "varchar" })
	subGroup: string | null

	@Column({ nullable: true, type: "varchar" })
	default: string | null

	@Column({ name: "custom_name", nullable: true, type: "varchar" })
	customName: string | null

	@Column({ nullable: true, type: "boolean", default: false })
	status: boolean | null

	@Column({ nullable: true, type: "boolean", default: false })
	visibility: boolean | null

	@Column({ name: "registrant_required", nullable: true, type: "boolean", default: false })
	registrantRequired: boolean | null

	@Column({ name: "admin_required", nullable: true, type: "boolean", default: false })
	adminRequired: boolean | null
}
