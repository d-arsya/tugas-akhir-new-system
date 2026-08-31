import type { JSX } from "react"
import { useEffect, useState } from "react"
import type { Province, Regency, District } from "@roja/types"
import type { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue, FieldValues, Path } from "react-hook-form"

type LocationSelectProps<TFieldValues extends FieldValues> = {
	prefix?: string
	register: UseFormRegister<TFieldValues>
	errors: FieldErrors<TFieldValues>
	watch: UseFormWatch<TFieldValues>
	setValue: UseFormSetValue<TFieldValues>
	provinceLabel?: string
	regencyLabel?: string
	districtLabel?: string
}

const mockProvinces: Province[] = [
	{ id: 31, name: "DKI Jakarta" },
	{ id: 32, name: "Jawa Barat" },
	{ id: 33, name: "Jawa Tengah" },
]

const mockRegencies: Record<number, Regency[]> = {
	31: [
		{ id: 3171, provinceId: 31, name: "Kota Jakarta Pusat" },
		{ id: 3173, provinceId: 31, name: "Kota Jakarta Barat" },
	],
	32: [
		{ id: 3273, provinceId: 32, name: "Kota Bandung" },
		{ id: 3277, provinceId: 32, name: "Kota Cimahi" },
	],
	33: [
		{ id: 3374, provinceId: 33, name: "Kota Semarang" },
		{ id: 3372, provinceId: 33, name: "Kota Surakarta" },
	],
}

const mockDistricts: Record<number, District[]> = {
	3171: [
		{ id: 3171010, regencyId: 3171, name: "Gambir" },
		{ id: 3171020, regencyId: 3171, name: "Sawah Besar" },
	],
	3173: [
		{ id: 3173010, regencyId: 3173, name: "Cengkareng" },
		{ id: 3173020, regencyId: 3173, name: "Kalideres" },
	],
	3273: [
		{ id: 3273010, regencyId: 3273, name: "Andir" },
		{ id: 3273020, regencyId: 3273, name: "Cicendo" },
	],
	3277: [
		{ id: 3277010, regencyId: 3277, name: "Cimahi Utara" },
		{ id: 3277020, regencyId: 3277, name: "Cimahi Tengah" },
	],
	3374: [
		{ id: 3374010, regencyId: 3374, name: "Semarang Tengah" },
		{ id: 3374020, regencyId: 3374, name: "Semarang Barat" },
	],
	3372: [
		{ id: 3372010, regencyId: 3372, name: "Laweyan" },
		{ id: 3372020, regencyId: 3372, name: "Banjarsari" },
	],
}

const LocationSelect = <TFieldValues extends FieldValues>({
	prefix = "",
	register,
	errors,
	watch,
	setValue,
	provinceLabel = "Provinsi",
	regencyLabel = "Kabupaten/Kota",
	districtLabel = "Kecamatan",
}: LocationSelectProps<TFieldValues>): JSX.Element => {
	const provinceFieldName = `${prefix}ProvinceId` as unknown as Path<TFieldValues>
	const regencyFieldName = `${prefix}RegencyId` as unknown as Path<TFieldValues>
	const districtFieldName = `${prefix}DistrictId` as unknown as Path<TFieldValues>

	const errs = errors as Record<string, { message?: string } | undefined>

	const selectedProvince = watch(provinceFieldName) as number | undefined
	const selectedRegency = watch(regencyFieldName) as number | undefined

	const setFormValue = setValue as unknown as (name: string, value: unknown, options?: unknown) => void

	const [regencies, setRegencies] = useState<Regency[]>([])
	const [districts, setDistricts] = useState<District[]>([])

	useEffect(() => {
		if (selectedProvince) {
			setRegencies(mockRegencies[selectedProvince] || [])
		} else {
			setRegencies([])
		}
		setFormValue(regencyFieldName, 0)
		setFormValue(districtFieldName, 0)
		setDistricts([])
	}, [selectedProvince, setFormValue, regencyFieldName, districtFieldName])

	useEffect(() => {
		if (selectedRegency) {
			setDistricts(mockDistricts[selectedRegency] || [])
		} else {
			setDistricts([])
		}
		setFormValue(districtFieldName, 0)
	}, [selectedRegency, setFormValue, districtFieldName])

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
			<div className="form-group">
				<label className="control-label">{provinceLabel}</label>
				<select
					className={`form-control ${errs[provinceFieldName as string] ? "is-invalid" : ""}`}
					{...register(provinceFieldName)}
				>
					<option value="0">-- Pilih Provinsi --</option>
					{mockProvinces.map((prov) => (
						<option key={prov.id} value={prov.id}>
							{prov.name}
						</option>
					))}
				</select>
				{errs[provinceFieldName as string] && (
					<span className="invalid-feedback">{errs[provinceFieldName as string]?.message}</span>
				)}
			</div>

			<div className="form-group">
				<label className="control-label">{regencyLabel}</label>
				<select
					className={`form-control ${errs[regencyFieldName as string] ? "is-invalid" : ""}`}
					{...register(regencyFieldName)}
					disabled={!selectedProvince}
				>
					<option value="0">-- Pilih Kabupaten/Kota --</option>
					{regencies.map((reg) => (
						<option key={reg.id} value={reg.id}>
							{reg.name}
						</option>
					))}
				</select>
				{errs[regencyFieldName as string] && (
					<span className="invalid-feedback">{errs[regencyFieldName as string]?.message}</span>
				)}
			</div>

			<div className="form-group">
				<label className="control-label">{districtLabel}</label>
				<select
					className={`form-control ${errs[districtFieldName as string] ? "is-invalid" : ""}`}
					{...register(districtFieldName)}
					disabled={!selectedRegency}
				>
					<option value="0">-- Pilih Kecamatan --</option>
					{districts.map((dist) => (
						<option key={dist.id} value={dist.id}>
							{dist.name}
						</option>
					))}
				</select>
				{errs[districtFieldName as string] && (
					<span className="invalid-feedback">{errs[districtFieldName as string]?.message}</span>
				)}
			</div>
		</div>
	)
}

export default LocationSelect
