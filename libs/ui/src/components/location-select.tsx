import type { JSX } from "react"
import { useEffect, useState, useRef } from "react"
import type { Province, Regency, District } from "@roja/types"
import type { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue, FieldValues, Path } from "react-hook-form"
import { createApiClient, createSharedApi } from "@roja/api-client"
import { useQuery } from "@tanstack/react-query"
import { Label } from "./ui/label"
import { SearchableSelect } from "./ui/searchable-select"

export interface LocationApi {
	getProvinces: () => Promise<Province[]>
	getRegencies: (provinceId: number) => Promise<Regency[]>
	getDistricts: (regencyId: number) => Promise<District[]>
}

const defaultSharedApi = createSharedApi(createApiClient(""))

export interface LocationSelectProps<TFieldValues extends FieldValues> {
	api?: LocationApi
	prefix?: string
	register: UseFormRegister<TFieldValues>
	errors: FieldErrors<TFieldValues>
	watch: UseFormWatch<TFieldValues>
	setValue: UseFormSetValue<TFieldValues>
	provinceLabel?: string
	regencyLabel?: string
	districtLabel?: string
	className?: string
}

export const LocationSelect = <TFieldValues extends FieldValues>({
	api = defaultSharedApi,
	prefix = "",
	register: _register,
	errors,
	watch,
	setValue,
	provinceLabel = "Provinsi",
	regencyLabel = "Kabupaten",
	districtLabel = "Kecamatan",
	className = "",
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
	const selectedDistrict = getNumericValue(watch(districtFieldName))
	const setFormValue = setValue as unknown as (name: string, value: unknown, options?: unknown) => void

	const { data: provinces = [] } = useQuery({
		queryKey: ["provinces"],
		queryFn: () => api.getProvinces(),
	})
	const regenciesQuery = useQuery({
		queryKey: ["regencies", selectedProvince],
		queryFn: () => (selectedProvince ? api.getRegencies(selectedProvince) : Promise.resolve([])),
		enabled: !!selectedProvince,
	})
	const districtsQuery = useQuery({
		queryKey: ["districts", selectedRegency],
		queryFn: () => (selectedRegency ? api.getDistricts(selectedRegency) : Promise.resolve([])),
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
				setFormValue(regencyFieldName as string, 0)
				setFormValue(districtFieldName as string, 0)
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
				setFormValue(districtFieldName as string, 0)
			}
			prevRegencyRef.current = selectedRegency
		} else {
			setDistricts([])
		}
	}, [selectedRegency, districtsQuery.data, setFormValue, districtFieldName])

	return (
		<div className={`grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6 ${className}`}>
			<div className="flex flex-col gap-1.5">
				<Label>{provinceLabel}</Label>
				<SearchableSelect
					placeholder="Pilih Provinsi"
					searchPlaceholder="Cari provinsi..."
					value={selectedProvince ? String(selectedProvince) : ""}
					onValueChange={(val) => setFormValue(provinceFieldName as string, Number(val), { shouldValidate: true })}
					triggerClassName={errs[provinceFieldName as string] ? "border-destructive focus:ring-destructive" : ""}
					options={[
						{ value: "0", label: "Pilih Provinsi" },
						...(provinces || []).map((prov: Province) => ({
							value: String(prov.id),
							label: prov.name,
						})),
					]}
				/>
				{errs[provinceFieldName as string] && (
					<p className="text-xs text-destructive mt-0.5">{errs[provinceFieldName as string]?.message}</p>
				)}
			</div>

			<div className="flex flex-col gap-1.5">
				<Label>{regencyLabel}</Label>
				<SearchableSelect
					placeholder="Pilih Kabupaten / Kota"
					searchPlaceholder="Cari kabupaten / kota..."
					value={selectedRegency ? String(selectedRegency) : ""}
					onValueChange={(val) => setFormValue(regencyFieldName as string, Number(val), { shouldValidate: true })}
					disabled={!selectedProvince}
					triggerClassName={errs[regencyFieldName as string] ? "border-destructive focus:ring-destructive" : ""}
					options={[
						{ value: "0", label: "Pilih Kabupaten / Kota" },
						...regencies.map((reg: Regency) => ({
							value: String(reg.id),
							label: reg.name,
						})),
					]}
				/>
				{errs[regencyFieldName as string] && (
					<p className="text-xs text-destructive mt-0.5">{errs[regencyFieldName as string]?.message}</p>
				)}
			</div>

			<div className="flex flex-col gap-1.5">
				<Label>{districtLabel}</Label>
				<SearchableSelect
					placeholder="Pilih Kecamatan"
					searchPlaceholder="Cari kecamatan..."
					value={selectedDistrict ? String(selectedDistrict) : ""}
					onValueChange={(val) => setFormValue(districtFieldName as string, Number(val), { shouldValidate: true })}
					disabled={!selectedRegency}
					triggerClassName={errs[districtFieldName as string] ? "border-destructive focus:ring-destructive" : ""}
					options={[
						{ value: "0", label: "Pilih Kecamatan" },
						...districts.map((dist: District) => ({
							value: String(dist.id),
							label: dist.name,
						})),
					]}
				/>
				{errs[districtFieldName as string] && (
					<p className="text-xs text-destructive mt-0.5">{errs[districtFieldName as string]?.message}</p>
				)}
			</div>
		</div>
	)
}

export default LocationSelect
