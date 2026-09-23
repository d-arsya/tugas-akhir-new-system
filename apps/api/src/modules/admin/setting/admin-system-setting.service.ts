import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"

import { Setting, type SmtpEncryption } from "@admin/entities/setting.entity"

export type SystemSetting = {
	id: number
	backupFrequency: number
	fromName: string | null
	smtpHost: string | null
	smtpPort: string | null
	typeOfEncryption: SmtpEncryption | null
	smtpUsername: string | null
	smtpPassword: string | null
	enabled2fa: boolean
}

export type SmtpPayload = {
	fromName: string
	smtpHost: string
	typeOfEncryption: SmtpEncryption
	smtpUsername: string
	smtpPassword: string
}

export type DatabaseBackupFile = {
	fileName: string
	body: string
}

// `resources/lang/id/admin.php`
const UPDATE_SUCCESS = "Data berhasil diupdate."
const UPDATE_FAILED = "Data gagal diupdate."

// Legacy app timezone (config/app.php) — the backup file name is stamped in this zone
const APP_TIMEZONE = "Asia/Jakarta"

// SettingController::getTypeOfEncryptionPort
const ENCRYPTION_PORTS: Record<SmtpEncryption, string> = { ssl: "465", tls: "587" }

// `formatDate(now(), 'd_m_Y_H_i_s')`
const stampedNow = (): string => {
	const parts = new Intl.DateTimeFormat("en-GB", {
		timeZone: APP_TIMEZONE,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	}).formatToParts(new Date())
	const part = (type: Intl.DateTimeFormatPartTypes): string =>
		parts.find((entry) => entry.type === type)?.value ?? "00"
	return `${part("day")}_${part("month")}_${part("year")}_${part("hour")}_${part("minute")}_${part("second")}`
}

// WS-D: legacy SettingController updates on the single settings row
@Injectable()
export class AdminSystemSettingService {
	private readonly logger = new Logger(AdminSystemSettingService.name)

	constructor(
		@InjectRepository(Setting) private readonly settingRepository: Repository<Setting>,
		private readonly configService: ConfigService,
	) {}

	// `Setting::first()` — the table holds exactly one configuration row
	private async firstSetting(): Promise<Setting> {
		const setting = await this.settingRepository.findOne({ where: {}, order: { id: "ASC" } })
		if (!setting) throw new InternalServerErrorException(UPDATE_FAILED)
		return setting
	}

	async getSetting(): Promise<SystemSetting> {
		const setting = await this.firstSetting()
		return {
			id: Number(setting.id),
			// bigint column: TypeORM hands it over as a string
			backupFrequency: Number(setting.backupFrequency ?? 0),
			fromName: setting.fromName,
			smtpHost: setting.smtpHost,
			smtpPort: setting.smtpPort,
			typeOfEncryption: setting.typeOfEncryption,
			smtpUsername: setting.smtpUsername,
			// Legacy prints it in clear in the SMTP form, so the port keeps doing the same
			smtpPassword: setting.smtpPassword,
			enabled2fa: setting.enabled2fa === true,
		}
	}

	async updateBackupFrequency(backupFrequency: number): Promise<{ message: string }> {
		return this.save((setting) => {
			setting.backupFrequency = String(backupFrequency)
		})
	}

	/**
	 * Legacy also opened a live SMTP connection to validate the account before saving. The port
	 * drops that test: outgoing mail goes through the external email-service, and these stored
	 * values are not read by it yet — they are kept only so the screen stays 1:1 with legacy.
	 */
	async updateSmtp(payload: SmtpPayload): Promise<{ message: string }> {
		return this.save((setting) => {
			setting.fromName = payload.fromName
			setting.smtpHost = payload.smtpHost
			setting.typeOfEncryption = payload.typeOfEncryption
			setting.smtpUsername = payload.smtpUsername
			setting.smtpPassword = payload.smtpPassword
			// `SettingRequest::getCustomValidatedData()` derives the port from the encryption
			setting.smtpPort = ENCRYPTION_PORTS[payload.typeOfEncryption]
		})
	}

	// Stores the flag only; the login flow is untouched, which matches how legacy behaves on pgsql
	async updateTwoFactor(enabled2fa: boolean): Promise<{ message: string }> {
		return this.save((setting) => {
			setting.enabled2fa = enabled2fa
		})
	}

	/**
	 * TODO: stream the real dump once the separate database service is in place; legacy produced a
	 * `.sql` file here with spatie/db-dumper and deleted it after sending.
	 */
	buildDatabaseBackup(): DatabaseBackupFile {
		const appName = this.configService.get<string>("APP_NAME") ?? "ROJA"
		return {
			fileName: `${appName}_${stampedNow()}.txt`,
			body: "File backup database akan disediakan oleh layanan database terpisah.\n",
		}
	}

	// Legacy wraps every update in try/catch and answers 500 'Data gagal diupdate.'
	private async save(apply: (setting: Setting) => void): Promise<{ message: string }> {
		try {
			const setting = await this.firstSetting()
			apply(setting)
			await this.settingRepository.save(setting)
			return { message: UPDATE_SUCCESS }
		} catch (error) {
			this.logger.error(error instanceof Error ? error.message : String(error))
			throw new InternalServerErrorException(UPDATE_FAILED)
		}
	}
}
