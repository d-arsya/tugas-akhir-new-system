import type { JSX } from "react"
import type { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form"
import type { PersonalInput } from "@/schemas/register.schema"
import LocationSelect from "@/components/location-select"
import { isFieldVisible, getFieldLabel } from "@roja/utils"
import { Input, Label } from "@roja/ui"

export interface PreviousSchoolFieldsProps {
	register: UseFormRegister<PersonalInput>
	errors: FieldErrors<PersonalInput>
	setValue: UseFormSetValue<PersonalInput>
	watch: UseFormWatch<PersonalInput>
	formSettings?: any
}

export const PreviousSchoolFields = ({
	register,
	errors,
	setValue,
	watch,
	formSettings,
}: PreviousSchoolFieldsProps): JSX.Element | null => {
	if (!isFieldVisible(formSettings, 19) && !isFieldVisible(formSettings, 20) && !isFieldVisible(formSettings, 21)) {
		return null
	}

	return (
		<div>
			<div className="border-l-4 border-l-[var(--primary)] pl-4 py-1 mb-6">
				<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">C. Data Sekolah Asal</div>
			</div>
			<div className="flex flex-col gap-5">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6">
					{isFieldVisible(formSettings, 19) && (
						<div className="form-group mb-0">
							<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 19, "Nama Sekolah Asal")}</Label>
							<Input
								type="text"
								className={errors.previousSchoolName ? "border-destructive focus-visible:ring-destructive" : ""}
								placeholder="Contoh: SD Negeri 1 Bandung"
								{...register("previousSchoolName")}
							/>
							{errors.previousSchoolName && (
								<span className="text-[11px] font-medium text-destructive mt-1 block">{errors.previousSchoolName.message}</span>
							)}
						</div>
					)}

					{isFieldVisible(formSettings, 20) && (
						<div className="form-group mb-0">
							<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 20, "No. Telp / HP Sekolah Asal")}</Label>
							<Input
								type="text"
								className=""
								placeholder="Nomor Telepon Sekolah"
								{...register("previousSchoolPhone")}
							/>
						</div>
					)}
				</div>

				{isFieldVisible(formSettings, 21) && (
					<>
						<LocationSelect
							prefix="previousSchool"
							register={register}
							errors={errors}
							watch={watch}
							setValue={setValue}
							provinceLabel="Provinsi Sekolah Asal"
							regencyLabel="Kabupaten Sekolah Asal"
							districtLabel="Kecamatan Sekolah Asal"
						/>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-6">
							<div className="form-group mb-0 md:col-span-2">
								<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">Alamat Detail Sekolah Asal</Label>
								<Input
									type="text"
									className=""
									placeholder="Jalan, Dusun, Kelurahan"
									{...register("previousSchoolAddressDetail")}
								/>
							</div>
							<div className="form-group mb-0">
								<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">Kode POS Sekolah Asal</Label>
								<Input
									type="text"
									className=""
									placeholder="Kode POS"
									{...register("previousSchoolPostalCode")}
								/>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	)
}

export default PreviousSchoolFields
