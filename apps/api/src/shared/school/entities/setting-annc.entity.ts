import { Column, Entity } from "typeorm"
import { BaseEntity } from "@core/database/base.entity"

@Entity({ name: "tbr_setting_anncs" })
export class SettingAnnc extends BaseEntity {
	@Column({ name: "success_desc", nullable: true, type: "text" })
	successDesc: string | null

	@Column({ name: "failed_desc", nullable: true, type: "text" })
	failedDesc: string | null

	@Column({ name: "failed_indent_test_desc", nullable: true, type: "text" })
	failedIndentTestDesc: string | null

	@Column({ name: "date_start", nullable: true, type: "date" })
	dateStart: string | null

	@Column({ name: "date_end", nullable: true, type: "date" })
	dateEnd: string | null

	@Column({ nullable: true, type: "text" })
	information: string | null

	@Column({ name: "additional_information", nullable: true, type: "text" })
	additionalInformation: string | null
}
