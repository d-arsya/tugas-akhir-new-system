import { Column, Entity, ManyToOne, OneToMany, JoinColumn } from "typeorm"
import { BaseEntity } from "../../database/base.entity"
import { Province } from "./province.entity"
import { District } from "./district.entity"

@Entity({ name: "tbr_regencies" })
export class Regency extends BaseEntity {
	@Column({ name: "province_id", type: "int" })
	provinceId: number

	@Column({ type: "varchar", length: 255, nullable: true })
	name: string | null

	@ManyToOne(() => Province, (province) => province.regencies)
	@JoinColumn({ name: "province_id" })
	province: Province

	@OneToMany(() => District, (district) => district.regency)
	districts: District[]
}
