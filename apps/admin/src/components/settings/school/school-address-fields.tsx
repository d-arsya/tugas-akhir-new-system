import type { JSX } from "react"

import LegacyFormRow from "@/components/legacy/legacy-form-row"
import LegacySelect from "@/components/legacy/legacy-select"
import LegacyTextarea from "@/components/legacy/legacy-textarea"
import { useDistricts, useProvinces, useRegencies } from "@/hooks/use-school-setting"
import type { LegacySelectOption } from "@/hooks/use-legacy-select"

type SchoolAddressFieldsProps = {
	provinceId: string
	regencyId: string
	districtId: string
	fullAddress: string
	onProvinceChange: (value: string) => void
	onRegencyChange: (value: string) => void
	onDistrictChange: (value: string) => void
	onFullAddressChange: (value: string) => void
}

// `province.js` / `regency.js` put `<option value="" selected disabled>Select</option>` back at the
// top of a child list every time its parent changes
const SELECT_PLACEHOLDER: LegacySelectOption = { value: "", label: "Select" }

const toOptions = (rows: { id: number; name: string }[] | undefined, value: string): LegacySelectOption[] => {
	const options = (rows ?? []).map((row) => ({ value: String(row.id), label: row.name }))
	return value === "" ? [SELECT_PLACEHOLDER, ...options] : options
}

// The "Alamat pondok" half of `setting/school.blade.php`
const SchoolAddressFields = ({
	provinceId,
	regencyId,
	districtId,
	fullAddress,
	onProvinceChange,
	onRegencyChange,
	onDistrictChange,
	onFullAddressChange,
}: SchoolAddressFieldsProps): JSX.Element => {
	const provinces = useProvinces()
	const regencies = useRegencies(provinceId === "" ? null : Number(provinceId))
	const districts = useDistricts(regencyId === "" ? null : Number(regencyId))

	return (
		<>
			<LegacyFormRow label="Provinsi" htmlFor="province_id" hint="required">
				<LegacySelect
					value={provinceId}
					options={toOptions(provinces.data, provinceId)}
					onChange={onProvinceChange}
					mutedText={provinceId === ""}
				/>
			</LegacyFormRow>

			<LegacyFormRow label="Kabupaten" htmlFor="regency_id" hint="required">
				<LegacySelect
					value={regencyId}
					options={toOptions(regencies.data, regencyId)}
					onChange={onRegencyChange}
					mutedText={regencyId === ""}
				/>
			</LegacyFormRow>

			<LegacyFormRow label="Kecamatan" htmlFor="district_id" hint="required">
				<LegacySelect
					value={districtId}
					options={toOptions(districts.data, districtId)}
					onChange={onDistrictChange}
					mutedText={districtId === ""}
				/>
			</LegacyFormRow>

			<LegacyFormRow label="Alamat Pondok" htmlFor="full_address" hint="required">
				<LegacyTextarea
					id="full_address"
					name="full_address"
					rows={2}
					noResize
					value={fullAddress}
					onChange={(event) => onFullAddressChange(event.target.value)}
				/>
			</LegacyFormRow>
		</>
	)
}

export default SchoolAddressFields
