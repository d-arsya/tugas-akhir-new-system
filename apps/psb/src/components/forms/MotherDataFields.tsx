import type { JSX } from "react"
import { Controller, type Control, type UseFormRegister, type FieldErrors } from "react-hook-form"
import type { FamilyInput } from "@/schemas/register.schema"
import { isFieldVisible, getFieldLabel } from "@roja/utils"
import { SearchableSelect, Input, Label } from "@roja/ui"

export interface MotherDataFieldsProps {
	control: Control<FamilyInput>
	register: UseFormRegister<FamilyInput>
	errors: FieldErrors<FamilyInput>
	formSettings?: any
}

export const MotherDataFields = ({
	control,
	register,
	errors,
	formSettings,
}: MotherDataFieldsProps): JSX.Element | null => {
	if (!isFieldVisible(formSettings, 36)) return null

	return (
		<div>
			<div className="border-l-4 border-l-[var(--primary)] pl-4 py-1 mb-6">
				<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">B. Data Ibu Kandung</div>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-6">
				{isFieldVisible(formSettings, 44) && (
					<div className="form-group mb-0">
						<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 44, "Nama Lengkap Ibu")}</Label>
						<Input
							type="text"
							className={errors.motherName ? "border-destructive focus-visible:ring-destructive" : ""}
							placeholder="Masukkan nama lengkap"
							{...register("motherName")}
						/>
						{errors.motherName && <span className="text-[11px] font-medium text-destructive mt-1 block">{errors.motherName.message}</span>}
					</div>
				)}

				<div className="form-group mb-0">
					<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">Status Ibu</Label>
					<div className="flex gap-6 items-center h-10 px-1">
						<Label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
							<input type="radio" value="hidup" className="accent-[#059669] w-4 h-4" {...register("motherStatus")} />
							<span>Masih Hidup</span>
						</Label>
						<Label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
							<input type="radio" value="wafat" className="accent-[#059669] w-4 h-4" {...register("motherStatus")} />
							<span>Sudah Wafat</span>
						</Label>
					</div>
				</div>

				{isFieldVisible(formSettings, 45) && (
					<div className="form-group mb-0">
						<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 45, "Agama Ibu")}</Label>
						<Controller
							control={control}
							name="motherReligion"
							render={({ field }) => (
								<SearchableSelect
									value={field.value}
									onValueChange={field.onChange}
									placeholder="Pilih..."
									options={[
										{ value: "Islam", label: "Islam" },
										{ value: "Kristen", label: "Kristen" },
										{ value: "Katolik", label: "Katolik" },
										{ value: "Hindu", label: "Hindu" },
										{ value: "Buddha", label: "Buddha" },
										{ value: "Konghucu", label: "Konghucu" }
									]}
								/>
							)}
						/>
					</div>
				)}

				{isFieldVisible(formSettings, 47) && (
					<div className="form-group mb-0">
						<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 47, "Pendidikan Terakhir Ibu")}</Label>
						<Controller
							control={control}
							name="motherLastEducation"
							render={({ field }) => (
								<SearchableSelect
									value={field.value}
									onValueChange={field.onChange}
									placeholder="Pilih..."
									options={[
										{ value: "tidak sekolah", label: "Tidak Sekolah" },
										{ value: "sd", label: "SD" },
										{ value: "smp", label: "SMP" },
										{ value: "sma", label: "SMA" },
										{ value: "diploma", label: "Diploma" },
										{ value: "s1", label: "S1" },
										{ value: "s2", label: "S2" },
										{ value: "s3", label: "S3" }
									]}
								/>
							)}
						/>
					</div>
				)}

				{isFieldVisible(formSettings, 50) && (
					<div className="form-group mb-0">
						<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 50, "Pekerjaan Ibu")}</Label>
						<Input
							type="text"
							className={errors.motherOccupation ? "border-destructive focus-visible:ring-destructive" : ""}
							placeholder="Pekerjaan saat ini"
							{...register("motherOccupation")}
						/>
						{errors.motherOccupation && (
							<span className="text-[11px] font-medium text-destructive mt-1 block">{errors.motherOccupation.message}</span>
						)}
					</div>
				)}

				{isFieldVisible(formSettings, 48) && (
					<div className="form-group mb-0">
						<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 48, "Nomor Telepon Ibu")}</Label>
						<Input
							type="text"
							className={errors.motherPhone ? "border-destructive focus-visible:ring-destructive" : ""}
							placeholder="Contoh: 081234567890"
							{...register("motherPhone")}
						/>
					</div>
				)}
			</div>
		</div>
	)
}

export default MotherDataFields
