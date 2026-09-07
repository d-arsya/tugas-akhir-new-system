import { Column, Entity } from "typeorm"
import { BaseEntity } from "@core/database/base.entity"

@Entity({ name: "tbr_setting_schools" })
export class SettingSchool extends BaseEntity {
	@Column({ nullable: true, type: "varchar" })
	logo: string | null

	@Column({ nullable: true, type: "varchar" })
	favicon: string | null

	@Column({ nullable: true, type: "varchar" })
	name: string | null

	@Column({ nullable: true, type: "varchar" })
	slogan: string | null

	@Column({ nullable: true, type: "bigint" })
	phone: string | null

	@Column({ name: "province_id", nullable: true, type: "int" })
	provinceId: number | null

	@Column({ name: "regency_id", nullable: true, type: "int" })
	regencyId: number | null

	@Column({ name: "district_id", nullable: true, type: "int" })
	districtId: number | null

	@Column({ name: "full_address", nullable: true, type: "varchar" })
	fullAddress: string | null
}
