import type { JSX } from "react"
import { Controller, type Control, type UseFormRegister, type FieldErrors } from "react-hook-form"
import type { PersonalInput } from "@/schemas/register.schema"
import { isFieldVisible, isFieldRequired, getFieldLabel, getFieldOptions, getOptionValue } from "@roja/utils"
import { SearchableSelect, Input, DatePicker, Label } from "@roja/ui"

export interface StudentPersonalFieldsProps {
	control: Control<PersonalInput>
	register: UseFormRegister<PersonalInput>
	errors: FieldErrors<PersonalInput>
	formSettings?: any
}

export const StudentPersonalFields = ({
	control,
	register,
	errors,
	formSettings,
}: StudentPersonalFieldsProps): JSX.Element | null => {
	const fieldIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
	const hasAnyVisible = fieldIds.some((id) => isFieldVisible(formSettings, id))
	if (!hasAnyVisible) return null

	const reqMark = (id: number) => (isFieldRequired(formSettings, id) ? <span className="text-destructive ml-1">*</span> : null)

	return (
		<div>
			<div className="border-l-4 border-l-[var(--primary)] pl-4 py-1 mb-6">
				<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">A. Data Calon Santri</div>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-6">
				{isFieldVisible(formSettings, 1) && (
					<div className="form-group mb-0">
						<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">
							{getFieldLabel(formSettings, 1, "Nama Lengkap")}
							{reqMark(1)}
						</Label>
						<Input
							type="text"
							className={errors.fullName ? "border-destructive focus-visible:ring-destructive" : ""}
							placeholder="Sesuai Akta Kelahiran"
							{...register("fullName")}
						/>
						{errors.fullName && <span className="text-[11px] font-medium text-destructive mt-1 block">{errors.fullName.message}</span>}
					</div>
				)}

				{isFieldVisible(formSettings, 2) && (
					<div className="form-group mb-0">
						<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 2, "Nama Panggilan")}</Label>
						<Input
							type="text"
							className={errors.shortName ? "border-destructive focus-visible:ring-destructive" : ""}
							placeholder="Nama panggilan sehari-hari"
							{...register("shortName")}
						/>
					</div>
				)}

				{isFieldVisible(formSettings, 3) && (
					<div className="form-group mb-0">
						<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 3, "Agama")}</Label>
						<Controller
							control={control}
							name="religion"
							render={({ field }) => (
								<SearchableSelect
									value={field.value}
									onValueChange={field.onChange}
									placeholder="Pilih..."
									triggerClassName={errors.religion ? "border-destructive focus-visible:ring-destructive" : ""}
									options={getFieldOptions(formSettings, 3, ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"]).map((opt) => ({
										value: getOptionValue(opt, 3),
										label: opt,
									}))}
								/>
							)}
						/>
						{errors.religion && <span className="text-[11px] font-medium text-destructive mt-1 block">{errors.religion.message}</span>}
					</div>
				)}

				{isFieldVisible(formSettings, 4) && (
					<div className="form-group mb-0">
						<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 4, "Jenis Kelamin")}</Label>
						<div className="flex gap-6 items-center h-10 px-1">
							{getFieldOptions(formSettings, 4, ["Laki-laki", "Perempuan"]).map((opt) => (
								<Label key={opt} className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
									<input type="radio" value={getOptionValue(opt, 4)} className="accent-[#059669] w-4 h-4" {...register("gender")} />
									<span>{opt}</span>
								</Label>
							))}
						</div>
						{errors.gender && <span className="text-[11px] font-medium text-destructive mt-1 block">{errors.gender.message}</span>}
					</div>
				)}

				{isFieldVisible(formSettings, 5) && (
					<div className="form-group mb-0">
						<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 5, "Tempat Lahir")}</Label>
						<Input
							type="text"
							className={errors.placeOfBirth ? "border-destructive focus-visible:ring-destructive" : ""}
							placeholder="Masukkan kota lahir"
							{...register("placeOfBirth")}
						/>
						{errors.placeOfBirth && <span className="text-[11px] font-medium text-destructive mt-1 block">{errors.placeOfBirth.message}</span>}
					</div>
				)}

				{isFieldVisible(formSettings, 6) && (
					<div className="form-group mb-0">
						<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 6, "Tanggal Lahir")}</Label>
						<Controller
							control={control}
							name="dateOfBirth"
							render={({ field }) => (
								<DatePicker
									mode="single"
									value={field.value}
									onValueChange={(_, dateStr) => field.onChange(dateStr)}
									className={errors.dateOfBirth ? "border-destructive" : ""}
								/>
							)}
						/>
						{errors.dateOfBirth && <span className="text-[11px] font-medium text-destructive mt-1 block">{errors.dateOfBirth.message}</span>}
					</div>
				)}

				{isFieldVisible(formSettings, 7) && (
					<div className="form-group mb-0">
						<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 7, "Kewarganegaraan")}</Label>
						<div className="flex gap-6 items-center h-10 px-1">
							{getFieldOptions(formSettings, 7, ["WNI", "WNA"]).map((opt) => (
								<Label key={opt} className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
									<input type="radio" value={getOptionValue(opt, 7)} className="accent-[#059669] w-4 h-4" {...register("nationality")} />
									<span>{opt}</span>
								</Label>
							))}
						</div>
						{errors.nationality && <span className="text-[11px] font-medium text-destructive mt-1 block">{errors.nationality.message}</span>}
					</div>
				)}

				{isFieldVisible(formSettings, 8) && (
					<div className="form-group mb-0">
						<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 8, "Tinggal Bersama")}</Label>
						<div className="flex gap-6 items-center h-10 px-1">
							{getFieldOptions(formSettings, 8, ["Orang Tua", "Wali"]).map((opt) => (
								<Label key={opt} className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
									<input type="radio" value={getOptionValue(opt, 8)} className="accent-[#059669] w-4 h-4" {...register("liveWith")} />
									<span>{opt}</span>
								</Label>
							))}
						</div>
						{errors.liveWith && <span className="text-[11px] font-medium text-destructive mt-1 block">{errors.liveWith.message}</span>}
					</div>
				)}

				{isFieldVisible(formSettings, 12) && (
					<div className="form-group mb-0">
						<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 12, "Nomor HP / WhatsApp")}</Label>
						<Input
							type="text"
							className={errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}
							placeholder="Contoh: 081234567890"
							{...register("phone")}
						/>
						{errors.phone && <span className="text-[11px] font-medium text-destructive mt-1 block">{errors.phone.message}</span>}
					</div>
				)}

				{isFieldVisible(formSettings, 9) && (
					<div className="form-group mb-0">
						<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 9, "Anak Ke")}</Label>
						<div className="flex gap-2">
							<Input
								type="number"
								className={`form-control w-24 ${errors.siblingOrder ? "is-invalid" : ""}`}
								placeholder="Anak ke"
								min={1}
								{...register("siblingOrder")}
							/>
							<span className="flex items-center text-xs text-[var(--grey)]">dari</span>
							<Input
								type="number"
								className={`form-control w-24 ${errors.numberOfSiblings ? "is-invalid" : ""}`}
								placeholder="Jumlah"
								min={0}
								{...register("numberOfSiblings")}
							/>
							<span className="flex items-center text-xs text-[var(--grey)]">bersaudara</span>
						</div>
					</div>
				)}

				{isFieldVisible(formSettings, 10) && (
					<div className="form-group mb-0">
						<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 10, "Keadaan Orang Tua")}</Label>
						<Controller
							control={control}
							name="parentStatus"
							render={({ field }) => (
								<SearchableSelect
									value={field.value}
									onValueChange={field.onChange}
									placeholder="Pilih..."
									triggerClassName={errors.parentStatus ? "border-destructive focus-visible:ring-destructive" : ""}
									options={getFieldOptions(formSettings, 10, ["Ayah & Ibu", "Yatim Piatu", "Yatim"]).map((opt) => ({
										value: getOptionValue(opt, 10),
										label: opt,
									}))}
								/>
							)}
						/>
					</div>
				)}

				{isFieldVisible(formSettings, 11) && (
					<div className="form-group mb-0">
						<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 11, "Status dalam Keluarga")}</Label>
						<Controller
							control={control}
							name="childStatus"
							render={({ field }) => (
								<SearchableSelect
									value={field.value}
									onValueChange={field.onChange}
									placeholder="Pilih..."
									triggerClassName={errors.childStatus ? "border-destructive focus-visible:ring-destructive" : ""}
									options={getFieldOptions(formSettings, 11, ["Anak Kandung", "Anak Tiri", "Anak Asuh/Angkat"]).map((opt) => ({
										value: getOptionValue(opt, 11),
										label: opt,
									}))}
								/>
							)}
						/>
					</div>
				)}
			</div>
		</div>
	)
}

export default StudentPersonalFields
