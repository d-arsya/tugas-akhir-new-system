import type { JSX } from "react"
import { useState } from "react"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
	personalSchema,
	identitySchema,
	familySchema,
	guardianSchema,
	attachmentSchema,
	type PersonalInput,
	type IdentityInput,
	type FamilyInput,
	type GuardianInput,
	type AttachmentInput,
} from "@/schemas/register.schema"
import { psbApi } from "@/lib/api"
import LocationSelect from "@/components/location-select"
import FileUploadField from "@/components/file-upload-field"
import WizardStepper from "@/components/wizard-stepper"
import { useNavigate, createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ChevronRight, ArrowLeft } from "lucide-react"
import { isFieldVisible, getFieldLabel, getFieldOptions, getOptionValue } from "@roja/utils"
import { Button, Input, Label, SearchableSelect, Textarea } from "@roja/ui"

// Sub-step 1: Invalid Personal (Data Diri)
const InvalidPersonalStepContent = ({ onNext }: { onNext: () => void }): JSX.Element => {
	const navigate = useNavigate()
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
		mutationFn: (data: PersonalInput) => psbApi.updateInvalidStep("personal", data),
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
	} = useForm<PersonalInput>({
		resolver: zodResolver(personalSchema) as unknown as import("react-hook-form").Resolver<PersonalInput>,
		values: (initialData ? (initialData as Record<string, unknown>).personal : {}) as PersonalInput,
		defaultValues: {
			fullName: "",
			shortName: "",
			religion: "Islam",
			gender: "male",
			nationality: "wni",
			dateOfBirth: "",
			placeOfBirth: "",
			address: "",
			provinceId: 0,
			regencyId: 0,
			districtId: 0,
			village: "",
			street: "",
			rt: "",
			rw: "",
			subVillage: "",
			postalCode: "",
			phone: "",
			liveWith: "parent",
			siblingOrder: 1,
			numberOfSiblings: 0,
			parentStatus: "complete",
			childStatus: "kandung",
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

	if (isLoading) {
		return <div className="text-center py-10 text-xs font-medium text-[var(--grey)]">Memuat data pendaftaran...</div>
	}

	return (
		<form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="flex flex-col gap-8">
			{/* Section A: Data Diri */}
			<div>
				<div className="border-l-4 border-l-[#ffa800] pl-4 py-1 mb-6">
					<div className="text-xs font-bold text-[#ffa800] tracking-wide m-0">A. Data Diri Calon Santri</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6">
					{isFieldVisible(formSettings, 1) && (
						<div className="form-group mb-0">
							<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 1, "Nama Lengkap")}</Label>
							<Input
								type="text"
								className={errors.fullName  ? "border-destructive focus-visible:ring-destructive" : ""}
								placeholder="Sesuai Akta Kelahiran / KK"
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
								className={errors.shortName  ? "border-destructive focus-visible:ring-destructive" : ""}
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
								className={errors.placeOfBirth  ? "border-destructive focus-visible:ring-destructive" : ""}
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
								className={errors.dateOfBirth  ? "border-destructive focus-visible:ring-destructive" : ""}
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
								className={errors.phone  ? "border-destructive focus-visible:ring-destructive" : ""}
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
					<div className="border-l-4 border-l-[#ffa800] pl-4 py-1 mb-6">
						<div className="text-xs font-bold text-[#ffa800] tracking-wide m-0">
							{getFieldLabel(formSettings, 13, "B. Alamat Tempat Tinggal")}
						</div>
					</div>
					<div className="flex flex-col gap-5">
						<LocationSelect register={register} errors={errors} watch={watch} setValue={setValue} />

						<div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6">
							<div className="form-group mb-0">
								<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">Kelurahan</Label>
								<Input
									type="text"
									className={errors.village  ? "border-destructive focus-visible:ring-destructive" : ""}
									placeholder="Kelurahan"
									{...register("village")}
								/>
								{errors.village && <span className="text-[11px] font-medium text-destructive mt-1 block">{errors.village.message}</span>}
							</div>
							<div className="form-group mb-0">
								<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">Jalan</Label>
								<Input
									type="text"
									className={errors.street  ? "border-destructive focus-visible:ring-destructive" : ""}
									placeholder="Jalan"
									{...register("street")}
								/>
								{errors.street && <span className="text-[11px] font-medium text-destructive mt-1 block">{errors.street.message}</span>}
							</div>
						</div>

						<div className="grid grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-6">
							<div className="form-group mb-0">
								<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">RT</Label>
								<Input type="text" className={errors.rt  ? "border-destructive focus-visible:ring-destructive" : ""} placeholder="001" {...register("rt")} />
								{errors.rt && <span className="text-[11px] font-medium text-destructive mt-1 block">{errors.rt.message}</span>}
							</div>
							<div className="form-group mb-0">
								<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">RW</Label>
								<Input type="text" className={errors.rw  ? "border-destructive focus-visible:ring-destructive" : ""} placeholder="002" {...register("rw")} />
								{errors.rw && <span className="text-[11px] font-medium text-destructive mt-1 block">{errors.rw.message}</span>}
							</div>
							<div className="form-group mb-0 col-span-2 md:col-span-1">
								<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">Dusun</Label>
								<Input
									type="text"
									className={errors.subVillage  ? "border-destructive focus-visible:ring-destructive" : ""}
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
					<div className="border-l-4 border-l-[#ffa800] pl-4 py-1 mb-6">
						<div className="text-xs font-bold text-[#ffa800] tracking-wide m-0">C. Data Sekolah Asal</div>
					</div>
					<div className="flex flex-col gap-5">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6">
							{isFieldVisible(formSettings, 19) && (
								<div className="form-group mb-0">
									<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 19, "Nama Sekolah Asal")}</Label>
									<Input
										type="text"
										className={errors.previousSchoolName  ? "border-destructive focus-visible:ring-destructive" : ""}
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
									<Input type="text" className="" placeholder="Nomor Telepon Sekolah" {...register("previousSchoolPhone")} />
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

			<div className="flex justify-between gap-4 mt-8 border-t border-[var(--bg-form-border)] pt-6">
				<button type="button" onClick={() => navigate({ to: "/dashboard" })} className="roja_btn roja_btn-secondary text-xs flex items-center gap-1.5">
					<ArrowLeft className="w-4 h-4" />
					<span>Kembali ke Dashboard</span>
				</button>
				<button type="submit" className="roja_btn roja_btn-warning text-white bg-[#ffa800] hover:bg-[#e09400] font-semibold flex items-center gap-2 shadow-lg shadow-[#ffa800]/20" disabled={mutation.isPending}>
					<span>{mutation.isPending ? "Menyimpan..." : "Selanjutnya"}</span>
					<ChevronRight className="w-5 h-5" />
				</button>
			</div>
		</form>
	)
}

// Sub-step 2: Invalid Identity (Identitas & Kesehatan)
const InvalidIdentityStepContent = ({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }): JSX.Element => {
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
		mutationFn: (data: IdentityInput) => psbApi.updateInvalidStep("identity", data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["invalidData"] })
			onNext()
		},
	})

	const {
		control,
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<IdentityInput>({
		resolver: zodResolver(identitySchema) as unknown as import("react-hook-form").Resolver<IdentityInput>,
		values: (initialData ? (initialData as Record<string, unknown>).identity : {}) as IdentityInput,
		defaultValues: {
			nik: "",
			nisn: "",
			certificateNumber: "",
			ksp: "",
			kip: "",
			weight: 0,
			height: 0,
			bloodType: "A",
			visualCondition: "normal",
			hearingCondition: "normal",
			immunizationGiven: "complete",
			diseaseHistories: [],
			reading: "quran",
			jilidChapter: "",
			quranMemorizing: "",
			learningAchievement: "",
			gift: "",
		},
	})

	const { fields, append, remove } = useFieldArray({
		control,
		name: "diseaseHistories",
	})

	const watchReading = watch("reading")

	if (isLoading) {
		return <div className="text-center py-10 text-xs font-medium text-[var(--grey)]">Memuat data pendaftaran...</div>
	}

	return (
		<form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="flex flex-col gap-8">
			<div className="border-l-4 border-l-[#ffa800] pl-4 py-1 mb-2">
				<div className="text-xs font-bold text-[#ffa800] tracking-wide m-0">Perbaiki Data: Sub-step 2 (Identitas & Kesehatan)</div>
				<div className="text-[10px] text-[var(--grey)] mt-0.5">Perbarui nomor identitas dan data kesehatan yang ditandai tidak valid.</div>
			</div>

			{/* Section A: Identitas */}
			<div>
				<div className="border-l-4 border-l-[var(--primary)] pl-4 py-1 mb-6">
					<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">A. Nomor Identitas Tambahan</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-6">
					{isFieldVisible(formSettings, 15) && (
						<div className="form-group mb-0">
							<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 15, "NIK (Nomor Induk Kependudukan)")}</Label>
							<Input
								type="text"
								className={errors.nik  ? "border-destructive focus-visible:ring-destructive" : ""}
								placeholder="16-digit NIK"
								{...register("nik")}
							/>
							{errors.nik && <span className="text-[11px] font-medium text-destructive mt-1 block">{errors.nik.message}</span>}
						</div>
					)}

					{isFieldVisible(formSettings, 14) && (
						<div className="form-group mb-0">
							<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 14, "NISN (Nomor Induk Siswa Nasional)")}</Label>
							<Input
								type="text"
								className={errors.nisn  ? "border-destructive focus-visible:ring-destructive" : ""}
								placeholder="10-digit NISN"
								{...register("nisn")}
							/>
							{errors.nisn && <span className="text-[11px] font-medium text-destructive mt-1 block">{errors.nisn.message}</span>}
						</div>
					)}

					{isFieldVisible(formSettings, 18) && (
						<div className="form-group mb-0">
							<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 18, "No. Ijazah / SKL")}</Label>
							<Input type="text" className="" placeholder="Nomor Ijazah Terakhir" {...register("certificateNumber")} />
						</div>
					)}

					{isFieldVisible(formSettings, 16) && (
						<div className="form-group mb-0">
							<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 16, "No. KSP (Kartu Sejahtera)")}</Label>
							<Input type="text" className="" placeholder="Nomor KSP jika ada" {...register("ksp")} />
						</div>
					)}

					{isFieldVisible(formSettings, 17) && (
						<div className="form-group mb-0">
							<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 17, "No. KIP (Kartu Indonesia Pintar)")}</Label>
							<Input type="text" className="" placeholder="Nomor KIP jika ada" {...register("kip")} />
						</div>
					)}
				</div>
			</div>

			{/* Section B: Fisik & Kesehatan */}
			{isFieldVisible(formSettings, 22) && (
				<div>
					<div className="border-l-4 border-l-[var(--primary)] pl-4 py-1 mb-6">
						<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">B. Data Fisik & Riwayat Penyakit</div>
					</div>
					<div className="flex flex-col gap-6">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-6">
							{isFieldVisible(formSettings, 23) && (
								<>
									<div className="form-group mb-0">
										<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">Berat Badan (Kg)</Label>
										<Input type="number" className="" placeholder="Kg" {...register("weight", { valueAsNumber: true })} />
									</div>
									<div className="form-group mb-0">
										<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">Tinggi Badan (Cm)</Label>
										<Input type="number" className="" placeholder="Cm" {...register("height", { valueAsNumber: true })} />
									</div>
								</>
							)}

							{isFieldVisible(formSettings, 24) && (
								<div className="form-group mb-0">
									<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 24, "Golongan Darah")}</Label>
									<Controller
	control={control}
	name="bloodType"
	render={({ field }) => (
		<SearchableSelect
			value={field.value}
			onValueChange={field.onChange}
			placeholder="Pilih..."
			triggerClassName=""
			options={getFieldOptions(formSettings, 24, ["A", "B", "AB", "O"]).map((opt) => ({
				value: getOptionValue(opt, 24),
				label: opt,
			}))}
		/>
	)}
/>
								</div>
							)}
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-6">
							{isFieldVisible(formSettings, 25) && (
								<div className="form-group mb-0">
									<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 25, "Kondisi Penglihatan")}</Label>
									<div className="flex gap-6 items-center h-10 px-1">
										{getFieldOptions(formSettings, 25, ["Normal", "Berkacamata"]).map((opt) => (
											<Label key={opt} className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
												<input type="radio" value={getOptionValue(opt, 25)} className="accent-[#059669] w-4 h-4" {...register("visualCondition")} />
												<span>{opt}</span>
											</Label>
										))}
									</div>
								</div>
							)}

							{isFieldVisible(formSettings, 26) && (
								<div className="form-group mb-0">
									<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 26, "Kondisi Pendengaran")}</Label>
									<div className="flex gap-6 items-center h-10 px-1">
										{getFieldOptions(formSettings, 26, ["Normal", "Kurang Peka Suara"]).map((opt) => (
											<Label key={opt} className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
												<input type="radio" value={getOptionValue(opt, 26)} className="accent-[#059669] w-4 h-4" {...register("hearingCondition")} />
												<span>{opt}</span>
											</Label>
										))}
									</div>
								</div>
							)}

							{isFieldVisible(formSettings, 27) && (
								<div className="form-group mb-0">
									<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 27, "Imunisasi yang Diterima")}</Label>
									<Controller
	control={control}
	name="immunizationGiven"
	render={({ field }) => (
		<SearchableSelect
			value={field.value}
			onValueChange={field.onChange}
			placeholder="Pilih..."
			triggerClassName=""
			options={getFieldOptions(formSettings, 27, ["Lengkap", "Tidak Lengkap", "Tidak Imunisasi"]).map((opt) => ({
				value: getOptionValue(opt, 27),
				label: opt,
			}))}
		/>
	)}
/>
								</div>
							)}
						</div>

						{/* Riwayat Penyakit */}
						{isFieldVisible(formSettings, 28) && (
							<div className="form-group mb-0">
								<div className="flex items-center justify-between mb-3">
									<Label className="control-label mb-0">{getFieldLabel(formSettings, 28, "Riwayat Penyakit Pernah Diderita")}</Label>
									<button
										type="button"
										onClick={() => append({ name: "", status: "Sembuh" })}
										className="roja_btn roja_btn-secondary text-[11px] py-1 px-3.5 flex items-center gap-1 font-semibold"
									>
										+ Tambah Penyakit
									</button>
								</div>
								<div className="flex flex-col gap-3">
									{fields.map((field, index) => (
										<div key={field.id} className="flex gap-3 items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
											<Input
												type="text"
												className=""
												placeholder="Nama penyakit"
												{...register(`diseaseHistories.${index}.name`)}
											/>
											<Controller
	control={control}
	name={`diseaseHistories.${index}.status`}
	render={({ field }) => (
		<SearchableSelect
			value={field.value}
			onValueChange={field.onChange}
			placeholder="Pilih status"
			triggerClassName="form-control w-40"
			options={[
				{ value: "Sembuh", label: "Sembuh" },
				{ value: "Masa Perawatan", label: "Masa Perawatan" },
				{ value: "Belum Sembuh", label: "Belum Sembuh" }
			]}
		/>
	)}
/>
											<button type="button" onClick={() => remove(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
												Hapus
											</button>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Section C: Prestasi Belajar */}
			{isFieldVisible(formSettings, 29) && (
				<div>
					<div className="border-l-4 border-l-[var(--primary)] pl-4 py-1 mb-6">
						<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">C. Prestasi Belajar</div>
					</div>
					<div className="form-group mb-0">
						<Textarea
							rows={2}
							className=""
							placeholder="Tuliskan kejuaraan atau prestasi belajar yang pernah didapat"
							{...register("learningAchievement")}
						/>
					</div>
				</div>
			)}

			{/* Section D: Prestasi Diniyyah */}
			{isFieldVisible(formSettings, 31) && (
				<div>
					<div className="border-l-4 border-l-[var(--primary)] pl-4 py-1 mb-6">
						<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">D. Kemampuan Al-Qur'an</div>
					</div>
					<div className="flex flex-col gap-5">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6">
							{isFieldVisible(formSettings, 32) && (
								<div className="form-group mb-0">
									<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 32, "Kemampuan Membaca")}</Label>
									<div className="flex gap-6 items-center h-10 px-1">
										{getFieldOptions(formSettings, 32, ["Jilid", "Al-Quran"]).map((opt) => (
											<Label key={opt} className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
												<input type="radio" value={getOptionValue(opt, 32)} className="accent-[#059669] w-4 h-4" {...register("reading")} />
												<span>{opt}</span>
											</Label>
										))}
									</div>
								</div>
							)}

							{watchReading === "jilid" && (
								<div className="form-group mb-0">
									<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">Sudah Jilid Berapa?</Label>
									<Input type="text" className="" placeholder="Contoh: Jilid 4" {...register("jilidChapter")} />
								</div>
							)}
						</div>

						<div className="form-group mb-0">
							<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">Hafalan Al-Qur'an (Juz / Surat)</Label>
							<Textarea rows={2} className="" placeholder="Contoh: Juz 30, Surat Al-Waqi'ah s.d. An-Naas" {...register("quranMemorizing")} />
						</div>
					</div>
				</div>
			)}

			{/* Section E: Bakat & Hobi */}
			{isFieldVisible(formSettings, 34) && (
				<div>
					<div className="border-l-4 border-l-[var(--primary)] pl-4 py-1 mb-6">
						<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">E. Bakat / Potensi / Hobi</div>
					</div>
					<div className="form-group mb-0">
						<Textarea rows={2} className="" placeholder="Seni, olahraga, pidato, kepemimpinan, dll." {...register("gift")} />
					</div>
				</div>
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

// Sub-step 3: Invalid Family (Data Keluarga)
const InvalidFamilyStepContent = ({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }): JSX.Element => {
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
								<Input type="text" className={errors.fatherName  ? "border-destructive focus-visible:ring-destructive" : ""} placeholder="Nama lengkap Ayah" {...register("fatherName")} />
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
								<Input type="text" className={errors.fatherOccupation  ? "border-destructive focus-visible:ring-destructive" : ""} placeholder="Pekerjaan Ayah" {...register("fatherOccupation")} />
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
								<Input type="text" className={errors.motherName  ? "border-destructive focus-visible:ring-destructive" : ""} placeholder="Nama lengkap Ibu" {...register("motherName")} />
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
								<Input type="text" className={errors.motherOccupation  ? "border-destructive focus-visible:ring-destructive" : ""} placeholder="Pekerjaan Ibu" {...register("motherOccupation")} />
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

// Sub-step 4: Invalid Guardian (Data Wali)
const InvalidGuardianStepContent = ({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }): JSX.Element => {
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
		resolver: zodResolver(guardianSchema) as unknown as import("react-hook-form").Resolver<GuardianInput>,
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

	if (isLoading) {
		return <div className="text-center py-10 text-xs font-medium text-[var(--grey)]">Memuat data pendaftaran...</div>
	}

	return (
		<form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="flex flex-col gap-8">
			<div className="border-l-4 border-l-[#ffa800] pl-4 py-1 mb-2">
				<div className="text-xs font-bold text-[#ffa800] tracking-wide m-0">Perbaiki Data: Sub-step 4 (Data Wali)</div>
				<div className="text-[10px] text-[var(--grey)] mt-0.5">Opsional: Perbarui data wali jika calon santri tinggal bersama wali.</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-6">
				{isFieldVisible(formSettings, 54) && (
					<div className="form-group mb-0">
						<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 54, "Nama Lengkap Wali")}</Label>
						<Input type="text" className={errors.guardianName  ? "border-destructive focus-visible:ring-destructive" : ""} placeholder="Nama lengkap Wali" {...register("guardianName")} />
						{errors.guardianName && <span className="text-[11px] font-medium text-destructive mt-1 block">{errors.guardianName.message}</span>}
					</div>
				)}
				{isFieldVisible(formSettings, 55) && (
					<div className="form-group mb-0">
						<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 55, "Agama Wali")}</Label>
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
						<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 56, "Kewarganegaraan Wali")}</Label>
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
						<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 57, "Pendidikan Terakhir Wali")}</Label>
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
						<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 58, "Nomor Telepon Wali")}</Label>
						<Input type="text" className="" placeholder="Contoh: 081234567890" {...register("guardianPhone")} />
					</div>
				)}
				{isFieldVisible(formSettings, 59) && (
					<div className="form-group mb-0">
						<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 59, "Nomor WhatsApp Wali")}</Label>
						<Input type="text" className="" placeholder="Contoh: 081234567890" {...register("guardianWhatsapp")} />
					</div>
				)}
				{isFieldVisible(formSettings, 60) && (
					<div className="form-group mb-0">
						<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 60, "Pekerjaan Wali")}</Label>
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
							<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">Kelurahan</Label>
							<Input type="text" className="" placeholder="Kelurahan" {...register("guardianVillage")} />
						</div>
						<div className="form-group mb-0">
							<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">Jalan</Label>
							<Input type="text" className="" placeholder="Nama Jalan" {...register("guardianStreet")} />
						</div>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-6">
						<div className="form-group mb-0">
							<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">RT</Label>
							<Input type="text" className="" placeholder="001" {...register("guardianRt")} />
						</div>
						<div className="form-group mb-0">
							<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">RW</Label>
							<Input type="text" className="" placeholder="002" {...register("guardianRw")} />
						</div>
						<div className="form-group mb-0 col-span-2 md:col-span-1">
							<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">Dusun</Label>
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

// Sub-step 5: Invalid Attachment (Lampiran Berkas)
const InvalidAttachmentStepContent = ({ onPrev }: { onPrev: () => void }): JSX.Element => {
	const navigate = useNavigate()
	const queryClient = useQueryClient()

	const mutation = useMutation({
		mutationFn: (files: Record<string, any>) => psbApi.updateInvalidAttachment(files),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["invalidData"] })
			queryClient.invalidateQueries({ queryKey: ["dashboard"] })
			alert("Perbaikan data Anda telah tersimpan.")
			navigate({ to: "/dashboard" })
		},
	})

	const {
		handleSubmit,
		control,
		formState: { errors },
	} = useForm<AttachmentInput>({
		resolver: zodResolver(attachmentSchema) as unknown as import("react-hook-form").Resolver<AttachmentInput>,
	})

	return (
		<form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="flex flex-col gap-8">
			<div className="border-l-4 border-l-[#ffa800] pl-4 py-1 mb-2">
				<div className="text-xs font-bold text-[#ffa800] tracking-wide m-0">Perbaiki Data: Sub-step 5 (Lampiran Berkas)</div>
				<div className="text-[10px] text-[var(--grey)] mt-0.5">Unggah ulang berkas dokumen yang ditandai tidak valid.</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6">
				<Controller
					control={control}
					name="ijazah"
					render={({ field }) => (
						<FileUploadField label="1. Salinan Ijazah / SKL (PDF/JPG)" value={field.value} onChange={field.onChange} error={errors.ijazah?.message} />
					)}
				/>
				<Controller
					control={control}
					name="photo"
					render={({ field }) => (
						<FileUploadField label="2. Pas Foto Calon Santri (3x4)" value={field.value} onChange={field.onChange} error={errors.photo?.message} />
					)}
				/>
				<Controller
					control={control}
					name="kk"
					render={({ field }) => (
						<FileUploadField label="3. Salinan Kartu Keluarga (KK)" value={field.value} onChange={field.onChange} error={errors.kk?.message} />
					)}
				/>
				<Controller
					control={control}
					name="birthCert"
					render={({ field }) => (
						<FileUploadField label="4. Salinan Akta Kelahiran" value={field.value} onChange={field.onChange} error={errors.birthCert?.message} />
					)}
				/>
				<Controller
					control={control}
					name="reportCard"
					render={({ field }) => (
						<FileUploadField label="5. Salinan Rapor Terakhir (Jika ada)" value={field.value} onChange={field.onChange} error={errors.reportCard?.message} />
					)}
				/>
				<Controller
					control={control}
					name="ksp"
					render={({ field }) => (
						<FileUploadField label="6. Kartu Sejahtera / KSP (Jika ada)" value={field.value} onChange={field.onChange} error={errors.ksp?.message} />
					)}
				/>
				<Controller
					control={control}
					name="kip"
					render={({ field }) => (
						<FileUploadField label="7. Kartu Indonesia Pintar / KIP (Jika ada)" value={field.value} onChange={field.onChange} error={errors.kip?.message} />
					)}
				/>
			</div>

			<div className="flex justify-between gap-4 mt-8 border-t border-[var(--bg-form-border)] pt-6">
				<button type="button" onClick={onPrev} className="roja_btn roja_btn-secondary text-xs">
					Sebelumnya
				</button>
				<button type="submit" className="roja_btn roja_btn-warning text-white bg-[#ffa800] hover:bg-[#e09400] font-semibold flex items-center gap-2 shadow-lg shadow-[#ffa800]/20" disabled={mutation.isPending}>
					<span>{mutation.isPending ? "Mengirim..." : "Selesaikan Perbaikan Data"}</span>
					<ChevronRight className="w-5 h-5" />
				</button>
			</div>
		</form>
	)
}

// Single-page Tabbed Invalid Data Component for /invalid
const InvalidDataPage = (): JSX.Element => {
	const [subStep, setSubStep] = useState<number>(1)

	const nextStep = (): void => setSubStep((prev) => Math.min(prev + 1, 5))
	const prevStep = (): void => setSubStep((prev) => Math.max(prev - 1, 1))

	return (
		<div>
			<WizardStepper mainStep={2} subStep={subStep} onStepClick={(step) => setSubStep(step)} />
			<div className="tbr_wizard_content mt-8">
				{subStep === 1 && <InvalidPersonalStepContent onNext={nextStep} />}
				{subStep === 2 && <InvalidIdentityStepContent onNext={nextStep} onPrev={prevStep} />}
				{subStep === 3 && <InvalidFamilyStepContent onNext={nextStep} onPrev={prevStep} />}
				{subStep === 4 && <InvalidGuardianStepContent onNext={nextStep} onPrev={prevStep} />}
				{subStep === 5 && <InvalidAttachmentStepContent onPrev={prevStep} />}
			</div>
		</div>
	)
}

export const Route = createFileRoute("/_member/invalid")({
	component: InvalidDataPage,
})

export default InvalidDataPage
