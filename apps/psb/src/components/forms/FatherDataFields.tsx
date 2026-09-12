import type { JSX } from "react"
import { Controller, type Control, type UseFormRegister, type FieldErrors } from "react-hook-form"
import type { FamilyInput } from "@/schemas/register.schema"
import { isFieldVisible, getFieldLabel, getFieldOptions, getOptionValue } from "@roja/utils"
import { SearchableSelect, Input, Label } from "@roja/ui"

export interface FatherDataFieldsProps {
	control: Control<FamilyInput>
	register: UseFormRegister<FamilyInput>
	errors: FieldErrors<FamilyInput>
	formSettings?: any
}

export const FatherDataFields = ({
	control,
	register,
	errors,
	formSettings,
}: FatherDataFieldsProps): JSX.Element | null => {
	if (!isFieldVisible(formSettings, 36)) return null

	const isNameVisible = isFieldVisible(formSettings, 37)
	const isReligionVisible = isFieldVisible(formSettings, 38)
	const isNationalityVisible = isFieldVisible(formSettings, 39)
	const isEducationVisible = isFieldVisible(formSettings, 40)
	const isPhoneVisible = isFieldVisible(formSettings, 41)
	const isWhatsappVisible = isFieldVisible(formSettings, 42)
	const isOccupationVisible = isFieldVisible(formSettings, 43)

	const hasAnyVisible =
		isNameVisible ||
		isReligionVisible ||
		isNationalityVisible ||
		isEducationVisible ||
		isPhoneVisible ||
		isWhatsappVisible ||
		isOccupationVisible

	if (!hasAnyVisible) return null

	return (
		<div>
			<div className="border-l-4 border-l-[var(--primary)] pl-4 py-1 mb-6">
				<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">A. Data Ayah Kandung</div>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-6">
				{isNameVisible && (
					<div className="form-group mb-0">
						<Label className="text-xs font-semibold text-slate-700 mb-1.5 inline-block">
							{getFieldLabel(formSettings, 37, "Nama Lengkap Ayah")}
						</Label>
						<Input
							type="text"
							className={errors.fatherName ? "border-destructive focus-visible:ring-destructive" : ""}
							placeholder="Masukkan nama lengkap"
							{...register("fatherName")}
						/>
						{errors.fatherName && <span className="text-[11px] font-medium text-destructive mt-1 block">{errors.fatherName.message}</span>}
					</div>
				)}

				{(isNameVisible || isNationalityVisible) && (
					<div className="form-group mb-0">
						<Label className="text-xs font-semibold text-slate-700 mb-1.5 inline-block">Status Ayah</Label>
						<div className="flex gap-6 items-center h-10 px-1">
							<Label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
								<input type="radio" value="hidup" className="accent-[#059669] w-4 h-4" {...register("fatherStatus")} />
								<span>Masih Hidup</span>
							</Label>
							<Label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
								<input type="radio" value="wafat" className="accent-[#059669] w-4 h-4" {...register("fatherStatus")} />
								<span>Sudah Wafat</span>
							</Label>
						</div>
					</div>
				)}

				{isReligionVisible && (
					<div className="form-group mb-0">
						<Label className="text-xs font-semibold text-slate-700 mb-1.5 inline-block">
							{getFieldLabel(formSettings, 38, "Agama Ayah")}
						</Label>
						<Controller
							control={control}
							name="fatherReligion"
							render={({ field }) => (
								<SearchableSelect
									value={field.value}
									onValueChange={field.onChange}
									placeholder="Pilih..."
									options={getFieldOptions(formSettings, 38, ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"]).map((opt) => ({
										value: getOptionValue(opt, 38),
										label: opt,
									}))}
								/>
							)}
						/>
					</div>
				)}

				{isEducationVisible && (
					<div className="form-group mb-0">
						<Label className="text-xs font-semibold text-slate-700 mb-1.5 inline-block">
							{getFieldLabel(formSettings, 40, "Pendidikan Terakhir Ayah")}
						</Label>
						<Controller
							control={control}
							name="fatherLastEducation"
							render={({ field }) => (
								<SearchableSelect
									value={field.value}
									onValueChange={field.onChange}
									placeholder="Pilih..."
									options={getFieldOptions(formSettings, 40, ["Tidak Sekolah", "SD", "SMP", "SMA", "Diploma", "S1", "S2", "S3"]).map((opt) => ({
										value: getOptionValue(opt, 40),
										label: opt,
									}))}
								/>
							)}
						/>
					</div>
				)}

				{isOccupationVisible && (
					<div className="form-group mb-0">
						<Label className="text-xs font-semibold text-slate-700 mb-1.5 inline-block">
							{getFieldLabel(formSettings, 43, "Pekerjaan Ayah")}
						</Label>
						<Input
							type="text"
							className={errors.fatherOccupation ? "border-destructive focus-visible:ring-destructive" : ""}
							placeholder="Pekerjaan saat ini"
							{...register("fatherOccupation")}
						/>
						{errors.fatherOccupation && (
							<span className="text-[11px] font-medium text-destructive mt-1 block">{errors.fatherOccupation.message}</span>
						)}
					</div>
				)}

				{isPhoneVisible && (
					<div className="form-group mb-0">
						<Label className="text-xs font-semibold text-slate-700 mb-1.5 inline-block">
							{getFieldLabel(formSettings, 41, "Nomor Telepon Ayah")}
						</Label>
						<Input
							type="text"
							className={errors.fatherPhone ? "border-destructive focus-visible:ring-destructive" : ""}
							placeholder="Contoh: 081234567890"
							{...register("fatherPhone")}
						/>
					</div>
				)}
			</div>
		</div>
	)
}

export default FatherDataFields
