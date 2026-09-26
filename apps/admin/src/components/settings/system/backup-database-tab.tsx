import { useEffect, useState, type FormEvent, type JSX } from "react"

import type { SystemSetting } from "@roja/types"

import LegacyButton from "@/components/legacy/legacy-button"
import { LegacyCardText, LegacyCardTitle, LegacyDivider } from "@/components/legacy/legacy-card"
import LegacyFormRow from "@/components/legacy/legacy-form-row"
import LegacyInput from "@/components/legacy/legacy-input"
import { useDownloadDatabase, useUpdateBackupFrequency } from "@/hooks/use-system-setting"
import { digitsOnly } from "@/lib/digits-only"
import { RIPPLE_CLASS, triggerRipple } from "@/lib/ripple"

import SystemSubmitRow, { SYSTEM_FIELD_CLASS } from "./system-submit-row"

type BackupDatabaseTabProps = {
	setting: SystemSetting | undefined
	onSaved: () => void
}

const BackupDatabaseTab = ({ setting, onSaved }: BackupDatabaseTabProps): JSX.Element => {
	const [backupFrequency, setBackupFrequency] = useState("")

	useEffect(() => {
		setBackupFrequency(setting ? String(setting.backupFrequency) : "")
	}, [setting])

	const { submit, submitting } = useUpdateBackupFrequency(onSaved)
	const download = useDownloadDatabase()

	const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
		event.preventDefault()
		// An empty field sends NaN (null in JSON) on purpose, so the server's required rule answers
		submit(Number.parseInt(backupFrequency, 10))
	}

	return (
		<>
			<LegacyCardTitle>Backup database</LegacyCardTitle>
			<LegacyCardText>
				File backup database akan dikirimkan melalui email superadmin. Silakan tentukan frekuensi backup database setiap
				saat untuk sistem ini.
			</LegacyCardText>

			<form onSubmit={onSubmit}>
				<div className="mb-[16px]">
					<LegacyFormRow label="Frekuensi" htmlFor="backup_frequency" hint="optional" labelCols={4} className="mb-[8px]">
						<div className={SYSTEM_FIELD_CLASS}>
							<LegacyInput
								type="number"
								min={1}
								id="backup_frequency"
								name="backup_frequency"
								value={backupFrequency}
								onKeyDown={digitsOnly}
								onChange={(event) => setBackupFrequency(event.target.value)}
								append="Hari"
							/>
						</div>
					</LegacyFormRow>
				</div>

				<SystemSubmitRow loading={submitting} />
			</form>

			<LegacyDivider />

			<div className="mb-[8px] text-center">
				<p className="mt-0 mb-[16px] leading-[24px]">Klik tombol di bawah ini untuk mendownload file backup secara langsung.</p>
				<LegacyButton
					variant="secondary"
					loading={download.isPending}
					className={RIPPLE_CLASS}
					onClick={(event) => {
						triggerRipple(event)
						download.mutate()
					}}
				>
					Download
				</LegacyButton>
			</div>
		</>
	)
}

export default BackupDatabaseTab
