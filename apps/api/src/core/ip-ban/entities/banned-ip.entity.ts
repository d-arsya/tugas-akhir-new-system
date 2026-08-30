import { Column, Entity } from "typeorm"
import { BaseEntity } from "../../database/base.entity"

@Entity({ name: "tbr_banned_ips" })
export class BannedIp extends BaseEntity {
	@Column({ name: "ip_address", type: "varchar", length: 255 })
	ipAddress: string
}
