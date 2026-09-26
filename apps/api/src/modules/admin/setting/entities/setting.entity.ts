import { Column, Entity } from "typeorm"

import { BaseEntity } from "@core/database/base.entity"

export type SmtpEncryption = "ssl" | "tls"

/**
 * Legacy `settings` — a single row read with `Setting::first()`, edited on Lainnya > Sistem.
 * `backup_frequency` is a bigint in Postgres, so it arrives as a string and needs `Number()`.
 */
@Entity({ name: "tbr_settings" })
export class Setting extends BaseEntity {
	@Column({ name: "backup_frequency", nullable: true, type: "bigint" })
	backupFrequency: string | null

	// Present in the legacy schema but never read by the app
	@Column({ name: "mail_from_address", nullable: true, type: "varchar" })
	mailFromAddress: string | null

	@Column({ name: "from_name", nullable: true, type: "varchar" })
	fromName: string | null

	@Column({ name: "smtp_host", nullable: true, type: "varchar" })
	smtpHost: string | null

	@Column({ name: "smtp_port", nullable: true, type: "varchar" })
	smtpPort: string | null

	@Column({ name: "type_of_encryption", nullable: true, type: "varchar" })
	typeOfEncryption: SmtpEncryption | null

	@Column({ name: "smtp_username", nullable: true, type: "varchar" })
	smtpUsername: string | null

	@Column({ name: "smtp_password", nullable: true, type: "varchar" })
	smtpPassword: string | null

	@Column({ name: "enabled_2fa", nullable: true, type: "boolean" })
	enabled2fa: boolean | null
}
