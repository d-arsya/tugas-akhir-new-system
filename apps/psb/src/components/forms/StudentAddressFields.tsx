import type { JSX } from "react"
import type { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form"
import type { PersonalInput } from "@/schemas/register.schema"
import LocationSelect from "@/components/location-select"
import { isFieldVisible, getFieldLabel } from "@roja/utils"
import { Input, Label } from "@roja/ui"

export interface StudentAddressFieldsProps {
	register: UseFormRegister<PersonalInput>
	errors: FieldErrors<PersonalInput>
	setValue: UseFormSetValue<PersonalInput>
	watch: UseFormWatch<PersonalInput>
	formSettings?: any
}

export const StudentAddressFields = ({
	register,
	errors,
	setValue,
	watch,
	formSettings,
}: StudentAddressFieldsProps): JSX.Element | null => {
	if (!isFieldVisible(formSettings, 13)) return null

	return (
		<div>
			<div className="border-l-4 border-l-[var(--primary)] pl-4 py-1 mb-6">
				<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">
					{getFieldLabel(formSettings, 13, "B. Alamat Tempat Tinggal")}
				</div>
			</div>
			<div className="flex flex-col gap-5">
				<LocationSelect
					register={register}
					errors={errors}
					watch={watch}
					setValue={setValue}
				/>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6">
					<div className="form-group mb-0">
						<Label className="text-xs font-semibold text-slate-700 mb-1.5 inline-block">Kelurahan</Label>
						<Input
							type="text"
							className={errors.village ? "border-destructive focus-visible:ring-destructive" : ""}
							placeholder="Kelurahan"
							{...register("village")}
						/>
						{errors.village && <span className="text-[11px] font-medium text-destructive mt-1 block">{errors.village.message}</span>}
					</div>

					<div className="form-group mb-0">
						<Label className="text-xs font-semibold text-slate-700 mb-1.5 inline-block">Jalan</Label>
						<Input
							type="text"
							className={errors.street ? "border-destructive focus-visible:ring-destructive" : ""}
							placeholder="Jalan"
							{...register("street")}
						/>
						{errors.street && <span className="text-[11px] font-medium text-destructive mt-1 block">{errors.street.message}</span>}
					</div>
				</div>

				<div className="grid grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-6">
					<div className="form-group mb-0">
						<Label className="text-xs font-semibold text-slate-700 mb-1.5 inline-block">RT</Label>
						<Input
							type="text"
							className={errors.rt ? "border-destructive focus-visible:ring-destructive" : ""}
							placeholder="RT"
							{...register("rt")}
						/>
						{errors.rt && <span className="text-[11px] font-medium text-destructive mt-1 block">{errors.rt.message}</span>}
					</div>
					<div className="form-group mb-0">
						<Label className="text-xs font-semibold text-slate-700 mb-1.5 inline-block">RW</Label>
						<Input
							type="text"
							className={errors.rw ? "border-destructive focus-visible:ring-destructive" : ""}
							placeholder="RW"
							{...register("rw")}
						/>
						{errors.rw && <span className="text-[11px] font-medium text-destructive mt-1 block">{errors.rw.message}</span>}
					</div>
					<div className="form-group mb-0 col-span-2 md:col-span-1">
						<Label className="text-xs font-semibold text-slate-700 mb-1.5 inline-block">Dusun</Label>
						<Input
							type="text"
							className={errors.subVillage ? "border-destructive focus-visible:ring-destructive" : ""}
							placeholder="Dusun"
							{...register("subVillage")}
						/>
						{errors.subVillage && <span className="text-[11px] font-medium text-destructive mt-1 block">{errors.subVillage.message}</span>}
					</div>
				</div>
			</div>
		</div>
	)
}

export default StudentAddressFields
