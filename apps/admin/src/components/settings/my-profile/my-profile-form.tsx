import { useEffect, useState, type FormEvent, type JSX } from "react"

import type { MyProfile, MyProfilePayload } from "@roja/types"

import LegacyButton, { legacyButtonClass } from "@/components/legacy/legacy-button"
import { LegacyCardText, LegacyCardTitle, LegacyDivider } from "@/components/legacy/legacy-card"
import LegacyFormRow from "@/components/legacy/legacy-form-row"
import LegacyInput from "@/components/legacy/legacy-input"
import LegacyPasswordMeter, { passwordStrength } from "@/components/legacy/legacy-password-meter"
import LegacyRadioGroup from "@/components/legacy/legacy-radio-group"
import { useUpdateMyProfile } from "@/hooks/use-my-profile"
import { RIPPLE_CLASS, triggerRipple } from "@/lib/ripple"

type MyProfileFormProps = {
	profile: MyProfile | undefined
	onSaved: (name: string) => void
}

const HELP_CLASS = "mt-[5px] mb-[10px] block text-[12px] text-[var(--grey)]"

const GENDERS = [
	{ value: "male", label: "Laki - Laki", id: "male" },
	{ value: "female", label: "Perempuan", id: "female" },
]

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

	const { submit, submitting } = useUpdateMyProfile(() => onSaved(name))

	const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
		event.preventDefault()
		const payload: MyProfilePayload = {
			name,
			gender: gender as MyProfilePayload["gender"],
			password,
			passwordConfirmation,
		}
		// null, not false: an unticked box must fail the server's required rule
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
				<LegacyPasswordMeter
					password={password}
					weakConfirmed={weakConfirmed}
					onWeakConfirmedChange={setWeakConfirmed}
					part="checkbox"
				/>
			</LegacyFormRow>

			<div className="text-right">
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
