import type { AdminApi } from "@roja/api-client"
import type { SystemSetting } from "@roja/types"

// WS-D owns this file: Sistem mocks (backup frequency, SMTP, 2FA toggle, database download).
// Values mirror the single row in `tbr_settings`.

type SystemHijack = Pick<
	AdminApi,
	"getSystemSetting" | "updateBackupFrequency" | "updateSmtp" | "updateTwoFactor" | "downloadDatabase"
>

const delay = (ms = 250): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

let systemState: SystemSetting = {
	id: 1,
	backupFrequency: 1,
	fromName: "Pondok Pesantren Roja",
	smtpHost: "smtp.mailtrap.io",
	smtpPort: "587",
	typeOfEncryption: "tls",
	smtpUsername: "smtp_user",
	smtpPassword: "secret",
	enabled2fa: false,
}

const pad = (value: number): string => String(value).padStart(2, "0")

const backupFileName = (): string => {
	const now = new Date()
	return `ROJA_${pad(now.getDate())}_${pad(now.getMonth() + 1)}_${now.getFullYear()}_${pad(now.getHours())}_${pad(now.getMinutes())}_${pad(now.getSeconds())}.txt`
}

export const systemHijack: SystemHijack = {
	getSystemSetting: async () => {
		await delay(200)
		return systemState
	},

	updateBackupFrequency: async (backupFrequency) => {
		await delay(300)
		systemState = { ...systemState, backupFrequency }
		return { message: "Data berhasil diupdate." }
	},

	updateSmtp: async (data) => {
		await delay(300)
		systemState = { ...systemState, ...data, smtpPort: data.typeOfEncryption === "ssl" ? "465" : "587" }
		return { message: "Data berhasil diupdate." }
	},

	updateTwoFactor: async (enabled2fa) => {
		await delay(300)
		systemState = { ...systemState, enabled2fa }
		return { message: "Data berhasil diupdate." }
	},

	// The real dump comes from a separate service later, so this is a placeholder file
	downloadDatabase: async () => {
		await delay(400)
		const blob = new Blob(["File backup database akan disediakan oleh layanan database terpisah.\n"], {
			type: "text/plain",
		})
		return { blob, fileName: backupFileName() }
	},
}
