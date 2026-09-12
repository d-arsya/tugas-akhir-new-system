import type { JSX } from "react"
import { useMemo } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createGuardianSchema, type GuardianInput } from "@/schemas/register.schema"
import { psbApi } from "@/lib/api"
import LocationSelect from "@/components/location-select"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ChevronRight } from "lucide-react"
import { isFieldVisible, getFieldLabel, getFieldOptions, getOptionValue } from "@roja/utils"
import { SearchableSelect, Input, Label } from "@roja/ui"
import { toast } from "sonner"

export const InvalidGuardianStepContent = ({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }): JSX.Element => {
	const queryClient = useQueryClient()

	const { data: landingData } = useQuery({
		queryKey: ["landingInfo"],
		queryFn: () => psbApi.getLanding(),
	})
	const formSettings = landingData?.formSettings

	const dynamicSchema = useMemo(() => createGuardianSchema(formSettings), [formSettings])

	const { data: initialData, isLoading } = useQuery({
		queryKey: ["invalidData"],
		queryFn: () => psbApi.getInvalidData(),
	})

	const mutation = useMutation({
		mutationFn: (data: GuardianInput) => psbApi.updateInvalidStep("guardian", data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["invalidData"] })
			onNext()
		},
	})

	const {
		control,
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
	} = useForm<GuardianInput>({
		resolver: zodResolver(dynamicSchema) as unknown as import("react-hook-form").Resolver<GuardianInput>,
		values: (initialData ? (initialData as Record<string, unknown>).guardian : {}) as GuardianInput,
		defaultValues: {
			guardianName: "",
			guardianRelationship: "",
			guardianPhone: "",
			guardianLastEducation: "sma",
			guardianOccupation: "",
			guardianIncome: 0,
			guardianAddress: "",
			guardianProvinceId: 0,
			guardianRegencyId: 0,
			guardianDistrictId: 0,
		},
	})

	const onFormError = (formErrors: Record<string, any>): void => {
		console.error("Form Validation Errors (Invalid Guardian):", formErrors)
		toast.error("Mohon periksa kembali kolom yang wajib diisi.")
	}

	if (isLoading) {
		return <div className="text-center py-10 text-xs font-medium text-[var(--grey)]">Memuat data pendaftaran...</div>
	}

	return (
		<form onSubmit={handleSubmit((d) => mutation.mutate(d), onFormError)} className="flex flex-col gap-8">
			<div className="border-l-4 border-l-[#ffa800] pl-4 py-1 mb-2">
				<div className="text-xs font-bold text-[#ffa800] tracking-wide m-0">Perbaiki Data: Sub-step 4 (Data Wali)</div>
				<div className="text-[10px] text-[var(--grey)] mt-0.5">Opsional: Perbarui data wali jika calon santri tinggal bersama wali.</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-6">
				{isFieldVisible(formSettings, 54) && (
					<div className="form-group mb-0">
						<Label className="text-xs font-semibold text-slate-700 mb-1.5 inline-block">{getFieldLabel(formSettings, 54,"Nama Lengkap Wali")}</Label>
						<Input type="text" className={errors.guardianName  ? "border-destructive focus-visible:ring-destructive" : ""} placeholder="Nama lengkap Wali" {...register("guardianName")} />
						{errors.guardianName && <span className="text-[11px] font-medium text-destructive mt-1 block">{errors.guardianName.message}</span>}
					</div>
				)}
				{isFieldVisible(formSettings, 55) && (
					<div className="form-group mb-0">
						<Label className="text-xs font-semibold text-slate-700 mb-1.5 inline-block">{getFieldLabel(formSettings, 55,"Agama Wali")}</Label>
						<Controller
							control={control}
							name="guardianReligion"
							render={({ field }) => (
								<SearchableSelect
									value={field.value}
									onValueChange={field.onChange}
									placeholder="Pilih..."
									triggerClassName=""
									options={getFieldOptions(formSettings, 55, ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"]).map((opt) => ({
										value: getOptionValue(opt, 55),
										label: opt,
									}))}
								/>
							)}
						/>
					</div>
				)}
				{isFieldVisible(formSettings, 56) && (
					<div className="form-group mb-0">
						<Label className="text-xs font-semibold text-slate-700 mb-1.5 inline-block">{getFieldLabel(formSettings, 56,"Kewarganegaraan Wali")}</Label>
						<div className="flex gap-6 items-center h-10 px-1">
							{getFieldOptions(formSettings, 56, ["WNI", "WNA"]).map((opt) => (
								<Label key={opt} className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
									<input type="radio" value={getOptionValue(opt, 56)} className="accent-[#059669] w-4 h-4" {...register("guardianNationality")} />
									<span>{opt}</span>
								</Label>
							))}
						</div>
					</div>
				)}
				{isFieldVisible(formSettings, 57) && (
					<div className="form-group mb-0">
						<Label className="text-xs font-semibold text-slate-700 mb-1.5 inline-block">{getFieldLabel(formSettings, 57,"Pendidikan Terakhir Wali")}</Label>
						<Controller
							control={control}
							name="guardianLastEducation"
							render={({ field }) => (
								<SearchableSelect
									value={field.value}
									onValueChange={field.onChange}
									placeholder="Pilih..."
									triggerClassName=""
									options={getFieldOptions(formSettings, 57, ["Tidak Sekolah", "SD", "SMP", "SMA", "Diploma", "S1", "S2", "S3"]).map((opt) => ({
										value: getOptionValue(opt, 57),
										label: opt,
									}))}
								/>
							)}
						/>
					</div>
				)}
				{isFieldVisible(formSettings, 58) && (
					<div className="form-group mb-0">
						<Label className="text-xs font-semibold text-slate-700 mb-1.5 inline-block">{getFieldLabel(formSettings, 58,"Nomor Telepon Wali")}</Label>
						<Input type="text" className="" placeholder="Contoh: 081234567890" {...register("guardianPhone")} />
					</div>
				)}
				{isFieldVisible(formSettings, 59) && (
					<div className="form-group mb-0">
						<Label className="text-xs font-semibold text-slate-700 mb-1.5 inline-block">{getFieldLabel(formSettings, 59,"Nomor WhatsApp Wali")}</Label>
						<Input type="text" className="" placeholder="Contoh: 081234567890" {...register("guardianWhatsapp")} />
					</div>
				)}
				{isFieldVisible(formSettings, 60) && (
					<div className="form-group mb-0">
						<Label className="text-xs font-semibold text-slate-700 mb-1.5 inline-block">{getFieldLabel(formSettings, 60,"Pekerjaan Wali")}</Label>
						<Input type="text" className={errors.guardianOccupation  ? "border-destructive focus-visible:ring-destructive" : ""} placeholder="Pekerjaan Wali" {...register("guardianOccupation")} />
						{errors.guardianOccupation && <span className="text-[11px] font-medium text-destructive mt-1 block">{errors.guardianOccupation.message}</span>}
					</div>
				)}
			</div>

			{isFieldVisible(formSettings, 62) && (
				<>
					<LocationSelect
						prefix="guardian"
						register={register}
						errors={errors}
						watch={watch}
						setValue={setValue}
						provinceLabel="Provinsi Wali"
						regencyLabel="Kabupaten Wali"
						districtLabel="Kecamatan Wali"
					/>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6">
						<div className="form-group mb-0">
							<Label className="text-xs font-semibold text-slate-700 mb-1.5 inline-block">Kelurahan</Label>
							<Input type="text" className="" placeholder="Kelurahan" {...register("guardianVillage")} />
						</div>
						<div className="form-group mb-0">
							<Label className="text-xs font-semibold text-slate-700 mb-1.5 inline-block">Jalan</Label>
							<Input type="text" className="" placeholder="Nama Jalan" {...register("guardianStreet")} />
						</div>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-6">
						<div className="form-group mb-0">
							<Label className="text-xs font-semibold text-slate-700 mb-1.5 inline-block">RT</Label>
							<Input type="text" className="" placeholder="001" {...register("guardianRt")} />
						</div>
						<div className="form-group mb-0">
							<Label className="text-xs font-semibold text-slate-700 mb-1.5 inline-block">RW</Label>
							<Input type="text" className="" placeholder="002" {...register("guardianRw")} />
						</div>
						<div className="form-group mb-0 col-span-2 md:col-span-1">
							<Label className="text-xs font-semibold text-slate-700 mb-1.5 inline-block">Dusun</Label>
							<Input type="text" className="" placeholder="Dusun" {...register("guardianSubVillage")} />
						</div>
					</div>
				</>
			)}

			<div className="flex justify-between gap-4 mt-8 border-t border-[var(--bg-form-border)] pt-6">
				<button type="button" onClick={onPrev} className="roja_btn roja_btn-secondary text-xs">
					Sebelumnya
				</button>
				<button type="submit" className="roja_btn roja_btn-warning text-white bg-[#ffa800] hover:bg-[#e09400] font-semibold flex items-center gap-2 shadow-lg shadow-[#ffa800]/20" disabled={mutation.isPending}>
					<span>{mutation.isPending ? "Menyimpan..." : "Selanjutnya"}</span>
					<ChevronRight className="w-5 h-5" />
				</button>
			</div>
		</form>
	)
}

export default InvalidGuardianStepContent
