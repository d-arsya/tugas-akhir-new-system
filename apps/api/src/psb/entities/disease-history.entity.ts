import { Column, Entity } from "typeorm"
import { BaseEntity } from "../../core/database/base.entity"

@Entity({ name: "tbr_disease_histories" })
export class DiseaseHistory extends BaseEntity {
	@Column({ name: "society_id", nullable: true, type: "int" })
	societyId: number | null

	@Column({ type: "varchar", length: 20, default: "registrant" })
	society: "registrant" | "student" | "alumni"

	@Column({ name: "disease_name", nullable: true, type: "varchar" })
	diseaseName: string | null

	@Column({ name: "disease_status", nullable: true, type: "varchar", length: 30 })
	diseaseStatus: "sembuh" | "masa perawatan" | "belum sembuh" | null
}
