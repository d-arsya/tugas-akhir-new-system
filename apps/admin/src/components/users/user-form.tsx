import { useState, type FormEvent, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { AdminGender, AdminUserPayload } from "@roja/types"

import LegacyButton, { legacyButtonClass } from "@/components/legacy/legacy-button"
import LegacyCard, { LegacyCardText, LegacyCardTitle, LegacyDivider } from "@/components/legacy/legacy-card"
import LegacyFormRow from "@/components/legacy/legacy-form-row"
import LegacyInput from "@/components/legacy/legacy-input"
import LegacyRadioGroup from "@/components/legacy/legacy-radio-group"
import LegacySelect from "@/components/legacy/legacy-select"

export type UserFormValues = {
	name: string
	gender: AdminGender
	role: string
	email: string
	isBlocked: boolean
}

// `create.blade.php` defaults: gender "male" and Status Akun "0" are pre-checked
export const EMPTY_USER_FORM: UserFormValues = { name: "", gender: "male", role: "", email: "", isBlocked: false }

type UserFormProps = {
	mode: "create" | "edit"
	initial: UserFormValues
	onSubmit: (payload: AdminUserPayload) => void
	submitting: boolean
}

const GENDER_OPTIONS = [
	{ value: "male", label: "Laki - Laki", id: "male" },
	{ value: "female", label: "Perempuan", id: "female" },
]

const STATUS_OPTIONS = [
	{ value: "0", label: "Active", id: "active" },
	{ value: "1", label: "Deactive", id: "deactive" },
]

// `<option value="" title="Select" selected>` plus the three roles the legacy form offers
const ROLE_OPTIONS = [
	{ value: "", label: "Select" },
	{ value: "Admin", label: "Admin" },
	{ value: "Bendahara", label: "Bendahara" },
	{ value: "Kasir E-Wallet", label: "Kasir E-Wallet" },
]

// Shared port of `user/create.blade.php` and `user/edit.blade.php` (the same form; edit prefills
// the values, locks the email and reloads instead of redirecting)
const UserForm = ({ mode, initial, onSubmit, submitting }: UserFormProps): JSX.Element => {
	const [values, setValues] = useState<UserFormValues>(initial)
	const set = <K extends keyof UserFormValues>(key: K, value: UserFormValues[K]): void =>
		setValues((current) => ({ ...current, [key]: value }))

	const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
		event.preventDefault()
		onSubmit({
			name: values.name,
			gender: values.gender,
			role: values.role,
			isBlocked: values.isBlocked,
			// Legacy posts the email on both forms but only `store` reads it
			email: values.email,
		})
	}

	return (
		// `.row.justify-content-center > .col-xl-9.col-lg-10.col-md-12.col-sm-12.col-12`
		<div className="mx-[-15px] flex flex-wrap justify-center">
			<div className="w-full min-w-0 px-[15px] min-[1200px]:max-w-[75%] min-[1200px]:flex-[0_0_75%] min-[992px]:max-w-[83.333333%] min-[992px]:flex-[0_0_83.333333%]">
				{/* `.card-body.p-4.px-lg-5` */}
				<LegacyCard bodyClassName="p-[24px] min-[992px]:px-[48px]">
					<form id="main-form" onSubmit={handleSubmit} noValidate>
						<LegacyFormRow label="Nama Lengkap" htmlFor="name" hint="required">
							<LegacyInput
								id="name"
								name="name"
								type="text"
								spellCheck={false}
								autoComplete={mode === "edit" ? "off" : undefined}
								value={values.name}
								onChange={(event) => set("name", event.target.value)}
							/>
						</LegacyFormRow>

						<LegacyFormRow label="Jenis Kelamin" htmlFor="male" hint="required">
							<LegacyRadioGroup
								name="gender"
								value={values.gender}
								options={GENDER_OPTIONS}
								onChange={(value) => set("gender", value as AdminGender)}
							/>
						</LegacyFormRow>

						<LegacyDivider />
						<LegacyCardTitle>Data akun admin</LegacyCardTitle>
						<LegacyCardText>Anda dapat menambahkan data akun aplikasi untuk admin.</LegacyCardText>

						<LegacyFormRow label="Role" htmlFor="role" hint="required">
							<LegacySelect
								value={values.role}
								options={ROLE_OPTIONS}
								mutedText={values.role === ""}
								onChange={(value) => set("role", value)}
							/>
						</LegacyFormRow>

						<LegacyFormRow label="Alamat Email" htmlFor="email" hint="required">
							<LegacyInput
								id="email"
								name="email"
								type="email"
								spellCheck={false}
								// Legacy locks the email on the edit form; the update ignores it anyway
								readOnly={mode === "edit"}
								autoComplete={mode === "edit" ? "off" : undefined}
								value={values.email}
								onChange={(event) => set("email", event.target.value)}
							/>
						</LegacyFormRow>

						<LegacyFormRow label="Status Akun" htmlFor="active" hint="required">
							<LegacyRadioGroup
								name="is_blocked"
								value={values.isBlocked ? "1" : "0"}
								options={STATUS_OPTIONS}
								onChange={(value) => set("isBlocked", value === "1")}
							/>
						</LegacyFormRow>

						<div className="text-right">
							{/* `mr-2`, then the whitespace Blade leaves between the two inline-block buttons */}
							<Link to="/users" className={legacyButtonClass("light", "mr-[8px]")}>
								Kembali
							</Link>{" "}
							<LegacyButton type="submit" variant="primary" loading={submitting}>
								Simpan
							</LegacyButton>
						</div>
					</form>
				</LegacyCard>
			</div>
		</div>
	)
}

export default UserForm
