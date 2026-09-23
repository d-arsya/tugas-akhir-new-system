import { useEffect, useState, type FormEvent, type JSX, type KeyboardEvent } from "react"

import type { AdminSchoolPayload, AdminSchoolSetting } from "@roja/types"

import LegacyButton, { legacyButtonClass } from "@/components/legacy/legacy-button"
import { LegacyCardText, LegacyCardTitle, LegacyDivider } from "@/components/legacy/legacy-card"
import LegacyFileUpload from "@/components/legacy/legacy-file-upload"
import LegacyFormRow from "@/components/legacy/legacy-form-row"
import LegacyInput from "@/components/legacy/legacy-input"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"
import { adminApi } from "@/lib/api"
import { RIPPLE_CLASS, triggerRipple } from "@/lib/ripple"
import SchoolAddressFields from "./school-address-fields"

type SchoolFormProps = {
	school: AdminSchoolSetting | undefined
	onSaved: () => void
}

type SchoolForm = {
	name: string
	slogan: string
	phone: string
	provinceId: string
	regencyId: string
	districtId: string
	fullAddress: string
}

const EMPTY_FORM: SchoolForm = {
	name: "",
	slogan: "",
	phone: "",
	provinceId: "",
	regencyId: "",
	districtId: "",
	fullAddress: "",
}

// `div.help-block.tbr_text-grey.tbr_weight-italic` (porto theme.css 11101 + app.css 358/401)
const HELP_CLASS = "mt-[5px] mb-[10px] block text-[12px] text-[var(--grey)] italic"

// `accept=".png, .jpg, .jpeg, .svg"` — the blade uses the same list for both inputs
const ACCEPT = ".png, .jpg, .jpeg, .svg"

// `onkeypress="return isNumberKey(event)"` (public/assets/js/input-number-strict.js): digits only
const digitsOnly = (event: KeyboardEvent<HTMLInputElement>): void => {
	if (event.ctrlKey || event.metaKey || event.altKey) return
	if (event.key.length === 1 && !/\d/.test(event.key)) event.preventDefault()
}

// Port of `setting/school.blade.php` + `setting/upload-logo-school.js`, `province.js`, `regency.js`
const SchoolForm = ({ school, onSaved }: SchoolFormProps): JSX.Element => {
	const [values, setValues] = useState<SchoolForm>(EMPTY_FORM)
	const [logo, setLogo] = useState<File | null>(null)
	const [favicon, setFavicon] = useState<File | null>(null)

	useEffect(() => {
		setValues(
			school
				? {
						name: school.name ?? "",
						slogan: school.slogan ?? "",
						phone: school.phone ?? "",
						provinceId: school.provinceId === null ? "" : String(school.provinceId),
						regencyId: school.regencyId === null ? "" : String(school.regencyId),
						districtId: school.districtId === null ? "" : String(school.districtId),
						fullAddress: school.fullAddress ?? "",
					}
				: EMPTY_FORM,
		)
	}, [school])

	const set = <K extends keyof SchoolForm>(key: K, value: SchoolForm[K]): void =>
		setValues((current) => ({ ...current, [key]: value }))

	// `province.js`: a new province empties both child selects; `regency.js` empties the district one
	const onProvinceChange = (value: string): void =>
		setValues((current) => ({ ...current, provinceId: value, regencyId: "", districtId: "" }))
	const onRegencyChange = (value: string): void =>
		setValues((current) => ({ ...current, regencyId: value, districtId: "" }))

	const { submit, submitting } = useLegacySubmit<AdminSchoolPayload, { message: string }>({
		mutationFn: (payload) => adminApi.updateSchool(payload),
		// `default-ajax-with-file.js` titles its failure notice "<strong>Gagal!</strong>"
		errorTitle: "Gagal!",
		onDone: onSaved,
	})

	const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
		event.preventDefault()
		// The legacy page has no "hapus" control, so both hidden inputs always submit 0
		submit({ ...values, logo, favicon, emptyLogo: false, emptyFavicon: false })
	}

	return (
		<form onSubmit={onSubmit}>
			<LegacyFormRow label="Logo Pondok" htmlFor="logo" hint="optional">
				<LegacyFileUpload
					id="logo"
					variant="logo"
					previewUrl={school?.logoUrl ?? null}
					accept={ACCEPT}
					maxKb={500}
					sizeErrorText="Ukuran logo maksimal 500kb!"
					onChange={setLogo}
				/>
				<div className={HELP_CLASS}>
					Kami merekomendasikan logo yang diupload dengan ascpect ratio 134 x 54 pixels. File yang diupload harus ber
					extensi SVG atau PNG dengan background transparan.
				</div>
			</LegacyFormRow>

			<LegacyFormRow label="Favicon" htmlFor="favicon" hint="optional">
				<LegacyFileUpload
					id="favicon"
					variant="favicon"
					previewUrl={school?.faviconUrl ?? null}
					accept={ACCEPT}
					maxKb={250}
					// Legacy said "logo" here too; the port names the field it belongs to
					sizeErrorText="Ukuran favicon maksimal 250kb!"
					onChange={setFavicon}
				/>
				<div className={HELP_CLASS}>
					Kami merekomendasikan favicon yang diupload dengan ascpect ratio 62 x 62 pixels. File yang diupload harus ber
					extensi PNG dengan background transparan.
				</div>
			</LegacyFormRow>

			<LegacyFormRow label="Nama Pondok" htmlFor="name" hint="required">
				<LegacyInput
					type="text"
					id="name"
					name="name"
					autoComplete="off"
					value={values.name}
					onChange={(event) => set("name", event.target.value)}
				/>
			</LegacyFormRow>

			<LegacyFormRow label="Slogan Pondok" htmlFor="slogan" hint="optional">
				<LegacyInput
					type="text"
					id="slogan"
					name="slogan"
					autoComplete="off"
					value={values.slogan}
					onChange={(event) => set("slogan", event.target.value)}
				/>
			</LegacyFormRow>

			<LegacyFormRow label="Telepon Pondok" htmlFor="phone" hint="optional">
				{/* `span.input-group-prepend.tbr_text-grey` holding a static "62" — the column has no prefix */}
				<LegacyInput
					type="number"
					id="phone"
					name="phone"
					min={1}
					autoComplete="off"
					prepend="62"
					value={values.phone}
					onKeyDown={digitsOnly}
					onChange={(event) => set("phone", event.target.value)}
				/>
			</LegacyFormRow>

			<LegacyDivider />

			<LegacyCardTitle>Alamat pondok</LegacyCardTitle>
			<LegacyCardText>Silakan input alamat pondok secara lengkap mulai dari provinsi sampai ke detailnya.</LegacyCardText>

			<SchoolAddressFields
				provinceId={values.provinceId}
				regencyId={values.regencyId}
				districtId={values.districtId}
				fullAddress={values.fullAddress}
				onProvinceChange={onProvinceChange}
				onRegencyChange={onRegencyChange}
				onDistrictChange={(value) => set("districtId", value)}
				onFullAddressChange={(value) => set("fullAddress", value)}
			/>

			<div className="pt-[16px] text-right">
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

export default SchoolForm
