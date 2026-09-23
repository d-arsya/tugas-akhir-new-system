import { useState, type FormEvent, type JSX } from "react"

import type { CreatePasswordPayload } from "@roja/types"

import LegacyButton from "@/components/legacy/legacy-button"
import LegacyCheckbox from "@/components/legacy/legacy-checkbox"
import LegacyInput from "@/components/legacy/legacy-input"
import LegacyPasswordMeter, { passwordStrength } from "@/components/legacy/legacy-password-meter"

type FormValues = Pick<CreatePasswordPayload, "password" | "passwordConfirmation" | "weakPassword">

type CreatePasswordFormProps = {
	email: string
	onSubmit: (values: FormValues) => void
	submitting: boolean
	// `@error('password')` renders under the field; `@error('weak_password')` renders as a top alert
	errors: Record<string, string[]>
}

const LABEL_CLASS = "mb-[8px] block text-[12px] leading-[20px] text-[var(--body-txt-inverse)]"

// Port of `resources/views/auth/passwords/create.blade.php` (+ `assets/js/auth-password-meter.js`)
const CreatePasswordForm = ({ email, onSubmit, submitting, errors }: CreatePasswordFormProps): JSX.Element => {
	const [password, setPassword] = useState("")
	const [passwordConfirmation, setPasswordConfirmation] = useState("")
	const [weakConfirmed, setWeakConfirmed] = useState(false)
	const weak = passwordStrength(password) === 1

	const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
		event.preventDefault()
		onSubmit({
			password,
			passwordConfirmation,
			// The legacy form posts `weak_password=""` (→ null) while the box is on screen but unchecked,
			// and leaves the field out entirely when the password is not weak
			...(weak ? { weakPassword: weakConfirmed ? true : null } : {}),
		})
	}

	return (
		<form onSubmit={handleSubmit} noValidate>
			<div className="mb-[16px]">
				<label className={LABEL_CLASS} htmlFor="create-password-email">
					Alamat Email
				</label>
				<LegacyInput id="create-password-email" type="email" name="email" value={email} autoComplete="off" readOnly />
			</div>

			<div className="mb-[16px]">
				<label className={LABEL_CLASS} htmlFor="create-password">
					Password
				</label>
				<LegacyInput
					id="create-password"
					type="password"
					name="password"
					autoComplete="off"
					autoFocus
					value={password}
					onChange={(event) => setPassword(event.target.value)}
				/>
				{errors["password"]?.map((message) => (
					<span key={message} className="mt-[4px] block text-[11px] text-[var(--danger)]">
						{message}
					</span>
				))}
			</div>

			{/* The page restyles `.strength`: grey track, 4px radius, 10px margins (create.blade.php @push('style')) */}
			<div className="[&>div]:my-[10px] [&>div]:overflow-hidden [&>div]:rounded-[4px] [&>div]:bg-[#ccc] [&_span]:rounded-none">
				<LegacyPasswordMeter password={password} weakConfirmed={weakConfirmed} onWeakConfirmedChange={setWeakConfirmed} />
			</div>

			<div className="mb-[24px]">
				<label className={LABEL_CLASS} htmlFor="create-password-confirmation">
					Konfirmasi Password
				</label>
				<LegacyInput
					id="create-password-confirmation"
					type="password"
					name="password_confirmation"
					autoComplete="off"
					value={passwordConfirmation}
					onChange={(event) => setPasswordConfirmation(event.target.value)}
				/>
			</div>

			{/* `addCheckbox()` — this page spells the label "password", unlike the Profil Saya meter */}
			{weak ? (
				<div className="mb-[24px]">
					<LegacyCheckbox
						id="weak_password"
						name="weak_password"
						checked={weakConfirmed}
						onChange={setWeakConfirmed}
						label="Anda yakin ingin melanjutkan dengan password lemah?"
					/>
				</div>
			) : null}

			<LegacyButton type="submit" variant="secondary" loading={submitting} className="w-full px-[24px]">
				Simpan dan masuk ke aplikasi
			</LegacyButton>
		</form>
	)
}

export default CreatePasswordForm
