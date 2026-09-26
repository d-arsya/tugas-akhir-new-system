import { useEffect, useState, type FormEvent, type JSX } from "react"

import type { AdminSchoolSetting } from "@roja/types"

import LegacyButton, { legacyButtonClass } from "@/components/legacy/legacy-button"
import { LegacyCardText, LegacyCardTitle, LegacyDivider } from "@/components/legacy/legacy-card"
import LegacyFileUpload from "@/components/legacy/legacy-file-upload"
import LegacyFormRow from "@/components/legacy/legacy-form-row"
import LegacyInput from "@/components/legacy/legacy-input"
import { useUpdateSchool } from "@/hooks/use-school-setting"
import { digitsOnly } from "@/lib/digits-only"
import { RIPPLE_CLASS, triggerRipple } from "@/lib/ripple"

import SchoolAddressFields from "./school-address-fields"

type SchoolFormProps = {
	school: AdminSchoolSetting | undefined
	onSaved: () => void
}

type SchoolValues = {
	name: string
	slogan: string
	phone: string
	provinceId: string
	regencyId: string
	districtId: string
	fullAddress: string
}

const EMPTY_FORM: SchoolValues = {
	name: "",
	slogan: "",
	phone: "",
	provinceId: "",
	regencyId: "",
	districtId: "",
	fullAddress: "",
}

const HELP_CLASS = "mt-[5px] mb-[10px] block text-[12px] text-[var(--grey)] italic"

const ACCEPT = ".png, .jpg, .jpeg, .svg"

const SchoolForm = ({ school, onSaved }: SchoolFormProps): JSX.Element => {
	const [values, setValues] = useState<SchoolValues>(EMPTY_FORM)
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

	const set = <K extends keyof SchoolValues>(key: K, value: SchoolValues[K]): void =>
		setValues((current) => ({ ...current, [key]: value }))

	const onProvinceChange = (value: string): void =>
		setValues((current) => ({ ...current, provinceId: value, regencyId: "", districtId: "" }))
	const onRegencyChange = (value: string): void =>
		setValues((current) => ({ ...current, regencyId: value, districtId: "" }))

	const { submit, submitting } = useUpdateSchool(onSaved)

	const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
		event.preventDefault()
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
