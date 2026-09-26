import { useEffect, useState, type FormEvent, type JSX } from "react"

import type { SystemSetting } from "@roja/types"

import { LegacyCardText, LegacyCardTitle } from "@/components/legacy/legacy-card"
import LegacyFormRow from "@/components/legacy/legacy-form-row"
import LegacyRadioGroup from "@/components/legacy/legacy-radio-group"
import { useUpdateTwoFactor } from "@/hooks/use-system-setting"

import SystemSubmitRow, { SYSTEM_FIELD_CLASS } from "./system-submit-row"

type SecurityTabProps = {
	setting: SystemSetting | undefined
	onSaved: () => void
}

const TWO_FACTOR_OPTIONS = [
	{ value: "1", label: "Aktif", id: "enabled_2fa" },
	{ value: "0", label: "Nonaktif", id: "disabled_2fa" },
]

const SecurityTab = ({ setting, onSaved }: SecurityTabProps): JSX.Element => {
	const [enabled2fa, setEnabled2fa] = useState("0")

	useEffect(() => {
		if (setting) setEnabled2fa(setting.enabled2fa ? "1" : "0")
	}, [setting])

	const { submit, submitting } = useUpdateTwoFactor(onSaved)

	const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
		event.preventDefault()
		submit(enabled2fa === "1")
	}

	return (
		<>
			<LegacyCardTitle>Keamanan</LegacyCardTitle>
			<LegacyCardText>
				Kami menyediakan fasilitas keamanan untuk akun Anda. Kami merekomendasikan untuk selalu mengaktifkan two factor
				authentication. Jika Anda tidak membutuhkannya, silakan dinonaktifkan.
			</LegacyCardText>

			<form onSubmit={onSubmit}>
				<LegacyFormRow label="Two factor authentication" htmlFor="enabled_2fa" hint="optional" labelCols={4}>
					<div className={SYSTEM_FIELD_CLASS}>
						<LegacyRadioGroup
							inline
							name="enabled_2fa"
							value={enabled2fa}
							options={TWO_FACTOR_OPTIONS}
							onChange={setEnabled2fa}
						/>
					</div>
				</LegacyFormRow>

				<SystemSubmitRow loading={submitting} />
			</form>
		</>
	)
}

export default SecurityTab
