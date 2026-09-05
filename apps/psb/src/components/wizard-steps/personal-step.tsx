import type { JSX } from "react"
import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { personalSchema, type PersonalInput } from "@/schemas/register.schema"
import { psbApi } from "@/lib/api"
import useWizardStore from "@/stores/wizard.store"
import LocationSelect from "@/components/location-select"
import { useNavigate } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ChevronRight } from "lucide-react"
import { isFieldVisible, getFieldLabel, getFieldOptions, getOptionValue } from "@roja/utils"
import { SearchableSelect, Button, Input, Label } from "@roja/ui"
import { toast } from "sonner"

export const PersonalStepContent = ({ onNext }: { onNext: () => void }): JSX.Element => {
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const sessionId = useWizardStore((s) => s.sessionId) || ""
	const clearSession = useWizardStore((s) => s.clearSession)

	const { data: landingData, isLoading: landingLoading } = useQuery({
		queryKey: ["landingInfo"],
		queryFn: () => psbApi.getLanding(),
	})
	const formSettings = landingData?.formSettings

	const { data: initialData, isLoading: stepLoading, error } = useQuery({
		queryKey: ["wizardStep", "personal", sessionId],
		queryFn: () => psbApi.getWizardStep("personal", sessionId),
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
		mutationFn: (data: PersonalInput) => psbApi.saveWizardStep("personal", sessionId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["wizardStep", "personal", sessionId] })
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
	} = useForm<PersonalInput>({
		resolver: zodResolver(personalSchema) as unknown as import("react-hook-form").Resolver<PersonalInput>,
		values: (initialData || {}) as PersonalInput,
		defaultValues: {
			fullName: "",
			shortName: "",
			religion: "islam",
			gender: "male",
			placeOfBirth: "",
			dateOfBirth: "",
			nationality: "wni",
			liveWith: "parent",
			siblingOrder: 1,
			numberOfSiblings: 0,
			parentStatus: "complete",
			childStatus: "kandung",
			phone: "",
			provinceId: 0,
			regencyId: 0,
			districtId: 0,
			village: "",
			street: "",
			rt: "",
			rw: "",
			subVillage: "",
			postalCode: "",
			address: "",
			nisn: "",
			nik: "",
			ksp: "",
			kip: "",
			certificateNumber: "",
			previousSchoolName: "",
			previousSchoolPhone: "",
			previousSchoolProvinceId: 0,
			previousSchoolRegencyId: 0,
			previousSchoolDistrictId: 0,
			previousSchoolAddressDetail: "",
			previousSchoolPostalCode: "",
		},
	})

	const onSubmit = (data: PersonalInput): void => {
		mutation.mutate(data)
	}

	if (landingLoading || stepLoading) {
		return <div className="text-center py-10 text-xs">Memuat data...</div>
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
			{/* Section A: Data Calon Santri */}
			<div>
				<div className="border-l-4 border-l-[var(--primary)] pl-4 py-1 mb-6">
					<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">A. Data Calon Santri</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-6">
					{isFieldVisible(formSettings, 1) && (
						<div className="form-group mb-0">
							<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 1, "Nama Lengkap")}</Label>
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
							<Input
								type="date"
								className={errors.dateOfBirth ? "border-destructive focus-visible:ring-destructive" : ""}
								{...register("dateOfBirth")}
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

			{/* Section B: Alamat */}
			{isFieldVisible(formSettings, 13) && (
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
								<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">Kelurahan</Label>
								<Input
									type="text"
									className={errors.village ? "border-destructive focus-visible:ring-destructive" : ""}
									placeholder="Kelurahan"
									{...register("village")}
								/>
								{errors.village && <span className="text-[11px] font-medium text-destructive mt-1 block">{errors.village.message}</span>}
							</div>

							<div className="form-group mb-0">
								<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">Jalan</Label>
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
								<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">RT</Label>
								<Input
									type="text"
									className={errors.rt ? "border-destructive focus-visible:ring-destructive" : ""}
									placeholder="RT"
									{...register("rt")}
								/>
								{errors.rt && <span className="text-[11px] font-medium text-destructive mt-1 block">{errors.rt.message}</span>}
							</div>
							<div className="form-group mb-0">
								<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">RW</Label>
								<Input
									type="text"
									className={errors.rw ? "border-destructive focus-visible:ring-destructive" : ""}
									placeholder="RW"
									{...register("rw")}
								/>
								{errors.rw && <span className="text-[11px] font-medium text-destructive mt-1 block">{errors.rw.message}</span>}
							</div>
							<div className="form-group mb-0 col-span-2 md:col-span-1">
								<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">Dusun</Label>
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
			)}

			{/* Section C: Sekolah Asal */}
			{(isFieldVisible(formSettings, 19) || isFieldVisible(formSettings, 20) || isFieldVisible(formSettings, 21)) && (
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
			)}

			<div className="flex justify-end gap-4 mt-8 border-t border-[var(--bg-form-border)] pt-6">
				<Button
					type="submit"
					variant="roja-warning"
					disabled={mutation.isPending}
				>
					<span>{mutation.isPending ? "Menyimpan..." : "Lanjutkan"}</span>
					<ChevronRight className="w-5 h-5 ml-1" />
				</Button>
			</div>
		</form>
	)
}

export default PersonalStepContent
