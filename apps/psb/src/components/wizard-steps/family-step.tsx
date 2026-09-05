import type { JSX } from "react"
import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { familySchema, type FamilyInput } from "@/schemas/register.schema"
import { psbApi } from "@/lib/api"
import useWizardStore from "@/stores/wizard.store"
import LocationSelect from "@/components/location-select"
import { useNavigate } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ChevronRight } from "lucide-react"
import { isFieldVisible, getFieldLabel } from "@roja/utils"
import { SearchableSelect, Button, Input, Label } from "@roja/ui"
import { toast } from "sonner"

export const FamilyStepContent = ({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }): JSX.Element => {
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const sessionId = useWizardStore((s) => s.sessionId) || ""
	const clearSession = useWizardStore((s) => s.clearSession)

	const { data: landingData } = useQuery({
		queryKey: ["landingInfo"],
		queryFn: () => psbApi.getLanding(),
	})
	const formSettings = landingData?.formSettings

	const { data: initialData, isLoading, error } = useQuery({
		queryKey: ["wizardStep", "family", sessionId],
		queryFn: () => psbApi.getWizardStep("family", sessionId),
		enabled: !!sessionId,
		retry: false,
	})

	useEffect(() => {
		if (error) {
			clearSession()
			toast.error(error instanceof Error ? error.message : "Sesi pendaftaran Anda telah berakhir.")
			navigate({ to: "/" })
		}
	}, [error, clearSession, navigate])

	const mutation = useMutation({
		mutationFn: (data: FamilyInput) => psbApi.saveWizardStep("family", sessionId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["wizardStep", "family", sessionId] })
			onNext()
		},
		onError: (err: any) => {
			clearSession()
			toast.error(err instanceof Error ? err.message : "Sesi pendaftaran Anda telah berakhir.")
			navigate({ to: "/" })
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
		values: (initialData || {}) as FamilyInput,
		defaultValues: {
			fatherName: "",
			fatherStatus: "hidup",
			fatherReligion: "Islam",
			fatherLastEducation: "sma",
			fatherOccupation: "",
			fatherIncome: 0,
			motherName: "",
			motherStatus: "hidup",
			motherReligion: "Islam",
			motherLastEducation: "sma",
			motherOccupation: "",
			motherIncome: 0,
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

	const onSubmit = (data: FamilyInput): void => {
		mutation.mutate(data)
	}

	if (isLoading) {
		return <div className="text-center py-10 text-xs">Memuat data...</div>
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
			{/* Section A: Data Ayah */}
			{isFieldVisible(formSettings, 36) && (
				<div>
					<div className="border-l-4 border-l-[var(--primary)] pl-4 py-1 mb-6">
						<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">A. Data Ayah Kandung</div>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-6">
						{isFieldVisible(formSettings, 37) && (
							<div className="form-group mb-0">
								<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 37, "Nama Lengkap Ayah")}</Label>
								<Input
									type="text"
									className={errors.fatherName ? "border-destructive focus-visible:ring-destructive" : ""}
									placeholder="Masukkan nama lengkap"
									{...register("fatherName")}
								/>
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

						{isFieldVisible(formSettings, 43) && (
							<div className="form-group mb-0">
								<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 43, "Pekerjaan Ayah")}</Label>
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

						{isFieldVisible(formSettings, 41) && (
							<div className="form-group mb-0">
								<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 41, "Nomor Telepon Ayah")}</Label>
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
			)}

			{/* Section B: Data Ibu */}
			{isFieldVisible(formSettings, 36) && (
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
											triggerClassName=""
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
											triggerClassName=""
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
			)}

			{/* Section C: Alamat Tempat Tinggal Orang Tua */}
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

			<div className="flex justify-between gap-4 mt-8 border-t border-[var(--bg-form-border)] pt-6">
				<Button type="button" onClick={onPrev} variant="outline">
					Sebelumnya
				</Button>
				<Button type="submit" variant="roja-warning" disabled={mutation.isPending}>
					<span>{mutation.isPending ? "Menyimpan..." : "Lanjutkan"}</span>
					<ChevronRight className="w-5 h-5 ml-1" />
				</Button>
			</div>
		</form>
	)
}

export default FamilyStepContent
