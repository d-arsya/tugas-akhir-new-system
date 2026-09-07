import type { JSX } from "react"
import type { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form"
import type { FamilyInput } from "@/schemas/register.schema"
import LocationSelect from "@/components/location-select"
import { Input, Label } from "@roja/ui"

export interface FamilyAddressFieldsProps {
	register: UseFormRegister<FamilyInput>
	errors: FieldErrors<FamilyInput>
	setValue: UseFormSetValue<FamilyInput>
	watch: UseFormWatch<FamilyInput>
}

export const FamilyAddressFields = ({
	register,
	errors,
	setValue,
	watch,
}: FamilyAddressFieldsProps): JSX.Element => {
	return (
		<div>
			<div className="border-l-4 border-l-[var(--primary)] pl-4 py-1 mb-6">
				<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">C. Alamat Tempat Tinggal Orang Tua</div>
			</div>
			<div className="flex flex-col gap-5">
				<LocationSelect
					prefix="family"
					register={register}
					errors={errors}
					watch={watch}
					setValue={setValue}
					provinceLabel="Provinsi Tempat Tinggal Orang Tua"
					regencyLabel="Kabupaten Orang Tua"
					districtLabel="Kecamatan Orang Tua"
				/>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6">
					<div className="form-group mb-0">
						<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">Kelurahan</Label>
						<Input
							type="text"
							className={errors.familyVillage ? "border-destructive focus-visible:ring-destructive" : ""}
							placeholder="Kelurahan"
							{...register("familyVillage")}
						/>
					</div>
					<div className="form-group mb-0">
						<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">Jalan</Label>
						<Input
							type="text"
							className={errors.familyStreet ? "border-destructive focus-visible:ring-destructive" : ""}
							placeholder="Nama Jalan"
							{...register("familyStreet")}
						/>
					</div>
				</div>

				<div className="grid grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-6">
					<div className="form-group mb-0">
						<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">RT</Label>
						<Input
							type="text"
							className={errors.familyRt ? "border-destructive focus-visible:ring-destructive" : ""}
							placeholder="001"
							{...register("familyRt")}
						/>
					</div>
					<div className="form-group mb-0">
						<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">RW</Label>
						<Input
							type="text"
							className={errors.familyRw ? "border-destructive focus-visible:ring-destructive" : ""}
							placeholder="002"
							{...register("familyRw")}
						/>
					</div>
					<div className="form-group mb-0 col-span-2 md:col-span-1">
						<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">Dusun</Label>
						<Input
							type="text"
							className={errors.familySubVillage ? "border-destructive focus-visible:ring-destructive" : ""}
							placeholder="Dusun"
							{...register("familySubVillage")}
						/>
					</div>
				</div>
			</div>
		</div>
	)
}

export default FamilyAddressFields
