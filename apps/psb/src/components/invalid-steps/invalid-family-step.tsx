import type { JSX } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { familySchema, type FamilyInput } from "@/schemas/register.schema"
import { psbApi } from "@/lib/api"
import LocationSelect from "@/components/location-select"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ChevronRight } from "lucide-react"
import { isFieldVisible, getFieldLabel, getFieldOptions, getOptionValue } from "@roja/utils"
import { SearchableSelect, Input, Label } from "@roja/ui"

export const InvalidFamilyStepContent = ({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }): JSX.Element => {
	const queryClient = useQueryClient()

	const { data: landingData } = useQuery({
		queryKey: ["landingInfo"],
		queryFn: () => psbApi.getLanding(),
	})
	const formSettings = landingData?.formSettings

	const { data: initialData, isLoading } = useQuery({
		queryKey: ["invalidData"],
		queryFn: () => psbApi.getInvalidData(),
	})

	const mutation = useMutation({
		mutationFn: (data: FamilyInput) => psbApi.updateInvalidStep("family", data),
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
	} = useForm<FamilyInput>({
		resolver: zodResolver(familySchema) as unknown as import("react-hook-form").Resolver<FamilyInput>,
		values: (initialData ? (initialData as Record<string, unknown>).family : {}) as FamilyInput,
		defaultValues: {
			fatherName: "",
			fatherStatus: "hidup",
			fatherReligion: "Islam",
			fatherLastEducation: "sma",
			fatherOccupation: "",
			fatherIncome: 0,
			fatherPhone: "",
			motherName: "",
			motherStatus: "hidup",
			motherReligion: "Islam",
			motherLastEducation: "sma",
			motherOccupation: "",
			motherIncome: 0,
			motherPhone: "",
			numberOfSiblings: 0,
			childOrder: 1,
			familyStatus: "complete",
			familyStreet: "",
			familyProvinceId: 0,
			familyRegencyId: 0,
			familyDistrictId: 0,
			familyVillage: "",
			familyRt: "",
			familyRw: "",
			familySubVillage: "",
		},
	})

	if (isLoading) {
		return <div className="text-center py-10 text-xs font-medium text-[var(--grey)]">Memuat data pendaftaran...</div>
	}

	return (
		<form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="flex flex-col gap-8">
			<div className="border-l-4 border-l-[#ffa800] pl-4 py-1 mb-2">
				<div className="text-xs font-bold text-[#ffa800] tracking-wide m-0">Perbaiki Data: Sub-step 3 (Data Keluarga & Orang Tua)</div>
				<div className="text-[10px] text-[var(--grey)] mt-0.5">Perbarui data ayah dan ibu kandung yang ditandai tidak valid.</div>
			</div>

			{/* Section A: Ayah */}
			{isFieldVisible(formSettings, 36) && (
				<div>
					<div className="border-l-4 border-l-[var(--primary)] pl-4 py-1 mb-6">
						<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">A. Data Ayah Kandung</div>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-6">
						{isFieldVisible(formSettings, 37) && (
							<div className="form-group mb-0">
								<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 37, "Nama Lengkap Ayah")}</Label>
								<Input type="text" className={errors.fatherName ? "border-destructive focus-visible:ring-destructive" : ""} placeholder="Nama lengkap Ayah" {...register("fatherName")} />
								{errors.fatherName && <span className="text-[11px] font-medium text-destructive mt-1 block">{errors.fatherName.message}</span>}
							</div>
						)}

						<div className="form-group mb-0">
							<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">Status Ayah</Label>
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

						{isFieldVisible(formSettings, 38) && (
							<div className="form-group mb-0">
								<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 38, "Agama Ayah")}</Label>
								<Controller
									control={control}
									name="fatherReligion"
									render={({ field }) => (
										<SearchableSelect
											value={field.value}
											onValueChange={field.onChange}
											placeholder="Pilih..."
											triggerClassName=""
											options={getFieldOptions(formSettings, 38, ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"]).map((opt) => ({
												value: getOptionValue(opt, 38),
												label: opt,
											}))}
										/>
									)}
								/>
							</div>
						)}

						{isFieldVisible(formSettings, 40) && (
							<div className="form-group mb-0">
								<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 40, "Pendidikan Terakhir Ayah")}</Label>
								<Controller
									control={control}
									name="fatherLastEducation"
									render={({ field }) => (
										<SearchableSelect
											value={field.value}
											onValueChange={field.onChange}
											placeholder="Pilih..."
											triggerClassName=""
											options={getFieldOptions(formSettings, 40, ["Tidak Sekolah", "SD", "SMP", "SMA", "Diploma", "S1", "S2", "S3"]).map((opt) => ({
												value: getOptionValue(opt, 40),
												label: opt,
											}))}
										/>
									)}
								/>
							</div>
						)}

						{isFieldVisible(formSettings, 43) && (
							<div className="form-group mb-0">
								<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 43, "Pekerjaan Ayah")}</Label>
								<Input type="text" className={errors.fatherOccupation ? "border-destructive focus-visible:ring-destructive" : ""} placeholder="Pekerjaan Ayah" {...register("fatherOccupation")} />
								{errors.fatherOccupation && <span className="text-[11px] font-medium text-destructive mt-1 block">{errors.fatherOccupation.message}</span>}
							</div>
						)}

						{isFieldVisible(formSettings, 41) && (
							<div className="form-group mb-0">
								<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 41, "Nomor Telepon Ayah")}</Label>
								<Input type="text" className="" placeholder="Contoh: 081234567890" {...register("fatherPhone")} />
							</div>
						)}
					</div>
				</div>
			)}

			{/* Section B: Ibu */}
			{isFieldVisible(formSettings, 36) && (
				<div>
					<div className="border-l-4 border-l-[var(--primary)] pl-4 py-1 mb-6">
						<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">B. Data Ibu Kandung</div>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-6">
						{isFieldVisible(formSettings, 44) && (
							<div className="form-group mb-0">
								<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 44, "Nama Lengkap Ibu")}</Label>
								<Input type="text" className={errors.motherName ? "border-destructive focus-visible:ring-destructive" : ""} placeholder="Nama lengkap Ibu" {...register("motherName")} />
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
											triggerClassName=""
											options={getFieldOptions(formSettings, 45, ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"]).map((opt) => ({
												value: getOptionValue(opt, 45),
												label: opt,
											}))}
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
											triggerClassName=""
											options={getFieldOptions(formSettings, 47, ["Tidak Sekolah", "SD", "SMP", "SMA", "Diploma", "S1", "S2", "S3"]).map((opt) => ({
												value: getOptionValue(opt, 47),
												label: opt,
											}))}
										/>
									)}
								/>
							</div>
						)}

						{isFieldVisible(formSettings, 50) && (
							<div className="form-group mb-0">
								<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 50, "Pekerjaan Ibu")}</Label>
								<Input type="text" className={errors.motherOccupation ? "border-destructive focus-visible:ring-destructive" : ""} placeholder="Pekerjaan Ibu" {...register("motherOccupation")} />
								{errors.motherOccupation && <span className="text-[11px] font-medium text-destructive mt-1 block">{errors.motherOccupation.message}</span>}
							</div>
						)}

						{isFieldVisible(formSettings, 48) && (
							<div className="form-group mb-0">
								<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 48, "Nomor Telepon Ibu")}</Label>
								<Input type="text" className="" placeholder="Contoh: 081234567890" {...register("motherPhone")} />
							</div>
						)}
					</div>
				</div>
			)}

			{/* Section C: Alamat & Struktur */}
			<div>
				<div className="border-l-4 border-l-[#ffa800] pl-4 py-1 mb-6">
					<div className="text-xs font-bold text-[#ffa800] tracking-wide m-0">C. Alamat Tempat Tinggal Orang Tua</div>
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
							<Input type="text" className="" placeholder="Kelurahan" {...register("familyVillage")} />
						</div>
						<div className="form-group mb-0">
							<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">Jalan</Label>
							<Input type="text" className="" placeholder="Nama Jalan" {...register("familyStreet")} />
						</div>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-6">
						<div className="form-group mb-0">
							<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">RT</Label>
							<Input type="text" className="" placeholder="001" {...register("familyRt")} />
						</div>
						<div className="form-group mb-0">
							<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">RW</Label>
							<Input type="text" className="" placeholder="002" {...register("familyRw")} />
						</div>
						<div className="form-group mb-0 col-span-2 md:col-span-1">
							<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">Dusun</Label>
							<Input type="text" className="" placeholder="Dusun" {...register("familySubVillage")} />
						</div>
					</div>
				</div>
			</div>

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

export default InvalidFamilyStepContent
