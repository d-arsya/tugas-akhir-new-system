import { useEffect, useState, type FormEvent, type JSX } from "react"

import type { SmtpEncryption, SmtpPayload, SystemSetting } from "@roja/types"

import { LegacyCardText, LegacyCardTitle } from "@/components/legacy/legacy-card"
import LegacyFormRow from "@/components/legacy/legacy-form-row"
import LegacyInput from "@/components/legacy/legacy-input"
import LegacyRadioGroup from "@/components/legacy/legacy-radio-group"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"
import { adminApi } from "@/lib/api"
import SystemSubmitRow, { SYSTEM_FIELD_CLASS } from "./system-submit-row"

type EmailTabProps = {
	setting: SystemSetting | undefined
	onSaved: () => void
}

type SmtpForm = {
	fromName: string
	smtpHost: string
	typeOfEncryption: SmtpEncryption
	smtpUsername: string
	smtpPassword: string
}

// The blade prints `checked` on the SSL radio unconditionally, so it is also the fallback here
const EMPTY_FORM: SmtpForm = {
	fromName: "",
	smtpHost: "",
	typeOfEncryption: "ssl",
	smtpUsername: "",
	smtpPassword: "",
}

const ENCRYPTIONS = [
	{ value: "ssl", label: "SSL 465", id: "type_of_encryption_ssl" },
	{ value: "tls", label: "TLS 587", id: "type_of_encryption_tls" },
]

// Port of `setting/partials/email.blade.php` (form.secondary_form)
const EmailTab = ({ setting, onSaved }: EmailTabProps): JSX.Element => {
	const [form, setForm] = useState<SmtpForm>(EMPTY_FORM)

	useEffect(() => {
		if (!setting) return
		setForm({
			fromName: setting.fromName ?? "",
			smtpHost: setting.smtpHost ?? "",
			typeOfEncryption: setting.typeOfEncryption ?? "ssl",
			smtpUsername: setting.smtpUsername ?? "",
			// Legacy renders the stored password in clear in this form, so the port does the same
			smtpPassword: setting.smtpPassword ?? "",
		})
	}, [setting])

	const { submit, submitting } = useLegacySubmit<SmtpPayload, { message: string }>({
		mutationFn: (payload) => adminApi.updateSmtp(payload),
		onDone: onSaved,
	})

	const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
		event.preventDefault()
		submit(form)
	}

	const field = (key: keyof SmtpForm, id: string): JSX.Element => (
		<div className={SYSTEM_FIELD_CLASS}>
			<LegacyInput
				type="text"
				id={id}
				name={id}
				value={form[key]}
				onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
			/>
		</div>
	)

	return (
		<>
			<LegacyCardTitle>Email</LegacyCardTitle>
			<LegacyCardText>
				Anda perlu melakukan konfigurasi email terlebih dahulu sebelum sistem ini digunakan. Jika ingin menggunkan
				konfigurasi dari google, bisa Anda pelajari melalui link{" "}
				<a
					href="https://support.google.com/mail/answer/7126229?hl=en"
					target="_blank"
					rel="noreferrer"
					className="text-[var(--secondary)] no-underline"
				>
					Support Google
				</a>
				.
			</LegacyCardText>

			<form onSubmit={onSubmit}>
				<LegacyFormRow label="From name" htmlFor="from_name" hint="required" labelCols={4}>
					{field("fromName", "from_name")}
				</LegacyFormRow>

				<LegacyFormRow label="SMTP host" htmlFor="smtp_host" hint="required" labelCols={4}>
					{field("smtpHost", "smtp_host")}
				</LegacyFormRow>

				<LegacyFormRow label="Type of encryption" htmlFor="type_of_encryption_ssl" hint="required" labelCols={4}>
					<div className={SYSTEM_FIELD_CLASS}>
						<LegacyRadioGroup
							inline
							name="type_of_encryption"
							value={form.typeOfEncryption}
							options={ENCRYPTIONS}
							onChange={(value) =>
								setForm((current) => ({ ...current, typeOfEncryption: value === "tls" ? "tls" : "ssl" }))
							}
						/>
					</div>
				</LegacyFormRow>

				<LegacyFormRow label="SMTP username" htmlFor="smtp_username" hint="required" labelCols={4}>
					{field("smtpUsername", "smtp_username")}
				</LegacyFormRow>

				{/* `.form-group.row.mb-3` — the same 16px the default `.form-group` gives */}
				<LegacyFormRow label="SMTP password" htmlFor="smtp_password" hint="required" labelCols={4}>
					{field("smtpPassword", "smtp_password")}
				</LegacyFormRow>

				<SystemSubmitRow loading={submitting} />
			</form>
		</>
	)
}

export default EmailTab
