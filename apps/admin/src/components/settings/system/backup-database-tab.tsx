import { useEffect, useState, type FormEvent, type JSX, type KeyboardEvent } from "react"

import type { SystemSetting } from "@roja/types"

import LegacyButton from "@/components/legacy/legacy-button"
import { LegacyCardText, LegacyCardTitle, LegacyDivider } from "@/components/legacy/legacy-card"
import LegacyFormRow from "@/components/legacy/legacy-form-row"
import LegacyInput from "@/components/legacy/legacy-input"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"
import { useDownloadDatabase } from "@/hooks/use-system-setting"
import { adminApi } from "@/lib/api"
import { RIPPLE_CLASS, triggerRipple } from "@/lib/ripple"
import SystemSubmitRow, { SYSTEM_FIELD_CLASS } from "./system-submit-row"

type BackupDatabaseTabProps = {
	setting: SystemSetting | undefined
	onSaved: () => void
}

// `onkeypress="return isNumberKey(event)"` (public/assets/js/input-number-strict.js): digits only
const digitsOnly = (event: KeyboardEvent<HTMLInputElement>): void => {
	if (event.ctrlKey || event.metaKey || event.altKey) return
	if (event.key.length === 1 && !/\d/.test(event.key)) event.preventDefault()
}

// Port of `setting/partials/backup-db.blade.php` (form.main_form)
const BackupDatabaseTab = ({ setting, onSaved }: BackupDatabaseTabProps): JSX.Element => {
	const [backupFrequency, setBackupFrequency] = useState("")

	useEffect(() => {
		setBackupFrequency(setting ? String(setting.backupFrequency) : "")
	}, [setting])

	const { submit, submitting } = useLegacySubmit<number, { message: string }>({
		mutationFn: (value) => adminApi.updateBackupFrequency(value),
		onDone: onSaved,
	})
	const download = useDownloadDatabase()

	const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
		event.preventDefault()
		// An empty field parses to NaN, which serialises as null — the same "required" failure the
		// legacy `ConvertEmptyStringsToNull` produces for an empty `backup_frequency`
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
				{/* `.form-group > .form-group.row.mb-2` */}
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
				{/* `p.mb-3` over Porto's `p { line-height: 24px; margin: 0 0 20px }` */}
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
