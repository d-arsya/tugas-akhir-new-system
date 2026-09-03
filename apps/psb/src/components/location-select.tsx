import type { JSX } from "react"
import { useEffect, useState, useRef } from "react"
import type { Province, Regency, District } from "@roja/types"
import type { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue, FieldValues, Path } from "react-hook-form";
import { sharedApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

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

const LocationSelect = <TFieldValues extends FieldValues>({
	prefix = "",
	register,
	errors,
	watch,
	setValue,
	provinceLabel = "Provinsi",
	regencyLabel = "Kabupaten",
	districtLabel = "Kecamatan",
}: LocationSelectProps<TFieldValues>): JSX.Element => {
	const getFieldName = (suffix: string) =>
		prefix ? `${prefix}${suffix}` : suffix.charAt(0).toLowerCase() + suffix.slice(1)

	const provinceFieldName = getFieldName("ProvinceId") as unknown as Path<TFieldValues>
	const regencyFieldName = getFieldName("RegencyId") as unknown as Path<TFieldValues>
	const districtFieldName = getFieldName("DistrictId") as unknown as Path<TFieldValues>

	const errs = errors as Record<string, { message?: string } | undefined>
	const getNumericValue = (value: unknown) => Number(value ?? 0)

	const selectedProvince = getNumericValue(watch(provinceFieldName))
	const selectedRegency = getNumericValue(watch(regencyFieldName))
	const setFormValue = setValue as unknown as (name: string, value: unknown, options?: unknown) => void

	const { data: provinces = [] } = useQuery({ queryKey: ["provinces"], queryFn: () => sharedApi.getProvinces() })
	const regenciesQuery = useQuery({
		queryKey: ["regencies", selectedProvince],
		queryFn: () => (selectedProvince ? sharedApi.getRegencies(selectedProvince) : Promise.resolve([])),
		enabled: !!selectedProvince,
	})
	const districtsQuery = useQuery({
		queryKey: ["districts", selectedRegency],
		queryFn: () => (selectedRegency ? sharedApi.getDistricts(selectedRegency) : Promise.resolve([])),
		enabled: !!selectedRegency,
	})

	const [regencies, setRegencies] = useState<Regency[]>([])
	const [districts, setDistricts] = useState<District[]>([])

	const prevProvinceRef = useRef<number>(selectedProvince)
	const prevRegencyRef = useRef<number>(selectedRegency)

	useEffect(() => {
		if (selectedProvince) {
			setRegencies(regenciesQuery.data || [])
			if (prevProvinceRef.current !== 0 && prevProvinceRef.current !== selectedProvince) {
				setFormValue(regencyFieldName, 0)
				setFormValue(districtFieldName, 0)
			}
			prevProvinceRef.current = selectedProvince
		} else {
			setRegencies([])
		}
	}, [selectedProvince, regenciesQuery.data, setFormValue, regencyFieldName, districtFieldName])

	useEffect(() => {
		if (selectedRegency) {
			setDistricts(districtsQuery.data || [])
			if (prevRegencyRef.current !== 0 && prevRegencyRef.current !== selectedRegency) {
				setFormValue(districtFieldName, 0)
			}
			prevRegencyRef.current = selectedRegency
		} else {
			setDistricts([])
		}
	}, [selectedRegency, districtsQuery.data, setFormValue, districtFieldName])

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-6">
			<div className="form-group mb-0">
				<label className="control-label">{provinceLabel}</label>
				<select
					className={`form-control ${errs[provinceFieldName as string] ? "is-invalid" : ""}`}
					{...register(provinceFieldName)}
				>
					<option value="0">Provinsi</option>
					{(provinces || []).map((prov) => (
						<option key={prov.id} value={prov.id}>
							{prov.name}
						</option>
					))}
				</select>
				{errs[provinceFieldName as string] && (
					<span className="invalid-feedback">{errs[provinceFieldName as string]?.message}</span>
				)}
			</div>

			<div className="form-group mb-0">
				<label className="control-label">{regencyLabel}</label>
				<select
					className={`form-control ${errs[regencyFieldName as string] ? "is-invalid" : ""}`}
					{...register(regencyFieldName)}
					disabled={!selectedProvince}
				>
					<option value="0">Kabupaten</option>
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

			<div className="form-group mb-0">
				<label className="control-label">{districtLabel}</label>
				<select
					className={`form-control ${errs[districtFieldName as string] ? "is-invalid" : ""}`}
					{...register(districtFieldName)}
					disabled={!selectedRegency}
				>
					<option value="0">Kecamatan</option>
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
