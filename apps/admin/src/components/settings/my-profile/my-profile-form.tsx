import { useEffect, useState, type FormEvent, type JSX } from "react"

import type { MyProfile, MyProfilePayload } from "@roja/types"

import LegacyButton, { legacyButtonClass } from "@/components/legacy/legacy-button"
import { LegacyCardText, LegacyCardTitle, LegacyDivider } from "@/components/legacy/legacy-card"
import LegacyFormRow from "@/components/legacy/legacy-form-row"
import LegacyInput from "@/components/legacy/legacy-input"
import LegacyPasswordMeter, { passwordStrength } from "@/components/legacy/legacy-password-meter"
import LegacyRadioGroup from "@/components/legacy/legacy-radio-group"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"
import { adminApi } from "@/lib/api"
import { RIPPLE_CLASS, triggerRipple } from "@/lib/ripple"

type MyProfileFormProps = {
	profile: MyProfile | undefined
	onSaved: (name: string) => void
}

// `div.help-block.tbr_text-grey` under a field (porto theme.css 11101 + app.css 401)
const HELP_CLASS = "mt-[5px] mb-[10px] block text-[12px] text-[var(--grey)]"

const GENDERS = [
	{ value: "male", label: "Laki - Laki", id: "male" },
	{ value: "female", label: "Perempuan", id: "female" },
]

// Port of `setting/my-profile.blade.php` — no heading above the first field, unlike the other pages
const MyProfileForm = ({ profile, onSaved }: MyProfileFormProps): JSX.Element => {
	const [name, setName] = useState("")
	const [gender, setGender] = useState("")
	const [password, setPassword] = useState("")
	const [passwordConfirmation, setPasswordConfirmation] = useState("")
	const [weakConfirmed, setWeakConfirmed] = useState(false)

	useEffect(() => {
		setName(profile?.name ?? "")
		setGender(profile?.gender ?? "")
	}, [profile])

	const { submit, submitting } = useLegacySubmit<MyProfilePayload, { message: string }>({
		mutationFn: (payload) => adminApi.updateMyProfile(payload),
		onDone: () => onSaved(name),
	})

	const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
		event.preventDefault()
		const payload: MyProfilePayload = {
			name,
			// The radios only ever hold the two column values; "" reaches the server as "required"
			gender: gender as MyProfilePayload["gender"],
			password,
			passwordConfirmation,
		}
		// `addCheckbox()` only renders the box for a weak password, so only then is the field sent:
		// unchecked means the hidden input alone, which fails the legacy `required` rule
		if (passwordStrength(password) === 1) payload.weakPassword = weakConfirmed ? true : null
		submit(payload)
	}

	return (
		<form onSubmit={onSubmit}>
			<LegacyFormRow label="Nama Lengkap" htmlFor="name" hint="required">
				<LegacyInput
					type="text"
					id="name"
					name="name"
					autoComplete="off"
					value={name}
					onChange={(event) => setName(event.target.value)}
				/>
			</LegacyFormRow>

			<LegacyFormRow label="Jenis Kelamin" htmlFor="gender" hint="required">
				<LegacyRadioGroup name="gender" value={gender} options={GENDERS} onChange={setGender} />
			</LegacyFormRow>

			<LegacyDivider />

			<LegacyCardTitle>Data akun Anda</LegacyCardTitle>
			<LegacyCardText>Anda dapat mengubah data akun aplikasi milik Anda.</LegacyCardText>

			<LegacyFormRow label="Alamat Email" htmlFor="email" hint="required">
				{/* Legacy never sends this field: the email is fixed once the account exists */}
				<LegacyInput type="email" id="email" name="email" autoComplete="off" required readOnly value={profile?.email ?? ""} />
			</LegacyFormRow>

			<LegacyFormRow label="Kata Sandi" htmlFor="password" hint="required">
				<LegacyInput
					type="password"
					id="password"
					name="password"
					autoComplete="off"
					value={password}
					onChange={(event) => setPassword(event.target.value)}
				/>
				<LegacyPasswordMeter
					password={password}
					weakConfirmed={weakConfirmed}
					onWeakConfirmedChange={setWeakConfirmed}
					part="bar"
				/>
				<div className={HELP_CLASS}>
					Ketikkan minimal 8 karakter yang unik dan pastikan anda ingat. Biarkan tetap kosong jika tidak ingin mengubah
					kata sandi.
				</div>
			</LegacyFormRow>

			<LegacyFormRow label="Tulis ulang kata sandi" htmlFor="password_confirmation" hint="required">
				<LegacyInput
					type="password"
					id="password_confirmation"
					name="password_confirmation"
					autoComplete="off"
					value={passwordConfirmation}
					onChange={(event) => setPasswordConfirmation(event.target.value)}
				/>
				<div className={HELP_CLASS}>Biarkan tetap kosong jika tidak ingin mengubah kata sandi.</div>
				{/* `#week-password-checkbox` — `password-meter.js` fills it in only while the password is weak */}
				<LegacyPasswordMeter
					password={password}
					weakConfirmed={weakConfirmed}
					onWeakConfirmedChange={setWeakConfirmed}
					part="checkbox"
				/>
			</LegacyFormRow>

			{/* `div.text-right` — this page is the only one without `pt-3` */}
			<div className="text-right">
				{/* `a[href=""]`: legacy reloads the page, dropping whatever was typed */}
				<a href="" className={legacyButtonClass("light", `mr-[8px] ${RIPPLE_CLASS}`)} onClick={triggerRipple}>
					Kembali
				</a>{" "}
				<LegacyButton type="submit" variant="primary" loading={submitting} className={RIPPLE_CLASS} onClick={triggerRipple}>
					Simpan
				</LegacyButton>
			</div>
		</form>
	)
}

export default MyProfileForm
