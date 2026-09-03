import type { JSX } from "react"
import { useState, useEffect } from "react"
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
import useWizardStore from "@/stores/wizard.store"
import useAuthStore from "@/stores/auth.store"
import LocationSelect from "@/components/location-select"
import FileUploadField from "@/components/file-upload-field"
import WizardStepper from "@/components/wizard-stepper"
import { useNavigate, createFileRoute, redirect } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ChevronRight } from "lucide-react"
import { isFieldVisible, getFieldLabel, getFieldOptions, getOptionValue } from "@roja/utils"

// Sub-step 1: Personal Data
const PersonalStepContent = ({ onNext }: { onNext: () => void }): JSX.Element => {
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
			alert(error instanceof Error ? error.message : "Sesi pendaftaran Anda telah berakhir.")
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
			alert(err instanceof Error ? err.message : "Sesi pendaftaran Anda telah berakhir.")
			navigate({ to: "/" })
		},
	})

	const {
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
							<label className="control-label">{getFieldLabel(formSettings, 1, "Nama Lengkap")}</label>
							<input
								type="text"
								className={`form-control ${errors.fullName ? "is-invalid" : ""}`}
								placeholder="Sesuai Akta Kelahiran"
								{...register("fullName")}
							/>
							{errors.fullName && <span className="invalid-feedback">{errors.fullName.message}</span>}
						</div>
					)}

					{isFieldVisible(formSettings, 2) && (
						<div className="form-group mb-0">
							<label className="control-label">{getFieldLabel(formSettings, 2, "Nama Panggilan")}</label>
							<input
								type="text"
								className={`form-control ${errors.shortName ? "is-invalid" : ""}`}
								placeholder="Nama panggilan sehari-hari"
								{...register("shortName")}
							/>
						</div>
					)}

					{isFieldVisible(formSettings, 3) && (
						<div className="form-group mb-0">
							<label className="control-label">{getFieldLabel(formSettings, 3, "Agama")}</label>
							<select className={`form-control ${errors.religion ? "is-invalid" : ""}`} {...register("religion")}>
								{getFieldOptions(formSettings, 3, ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"]).map((opt) => (
									<option key={opt} value={getOptionValue(opt, 3)}>
										{opt}
									</option>
								))}
							</select>
							{errors.religion && <span className="invalid-feedback">{errors.religion.message}</span>}
						</div>
					)}

					{isFieldVisible(formSettings, 4) && (
						<div className="form-group mb-0">
							<label className="control-label">{getFieldLabel(formSettings, 4, "Jenis Kelamin")}</label>
							<div className="flex gap-6 items-center h-10 px-1">
								{getFieldOptions(formSettings, 4, ["Laki-laki", "Perempuan"]).map((opt) => (
									<label key={opt} className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
										<input type="radio" value={getOptionValue(opt, 4)} className="accent-[#059669] w-4 h-4" {...register("gender")} />
										<span>{opt}</span>
									</label>
								))}
							</div>
							{errors.gender && <span className="invalid-feedback">{errors.gender.message}</span>}
						</div>
					)}

					{isFieldVisible(formSettings, 5) && (
						<div className="form-group mb-0">
							<label className="control-label">{getFieldLabel(formSettings, 5, "Tempat Lahir")}</label>
							<input
								type="text"
								className={`form-control ${errors.placeOfBirth ? "is-invalid" : ""}`}
								placeholder="Masukkan kota lahir"
								{...register("placeOfBirth")}
							/>
							{errors.placeOfBirth && <span className="invalid-feedback">{errors.placeOfBirth.message}</span>}
						</div>
					)}

					{isFieldVisible(formSettings, 6) && (
						<div className="form-group mb-0">
							<label className="control-label">{getFieldLabel(formSettings, 6, "Tanggal Lahir")}</label>
							<input
								type="date"
								className={`form-control ${errors.dateOfBirth ? "is-invalid" : ""}`}
								{...register("dateOfBirth")}
							/>
							{errors.dateOfBirth && <span className="invalid-feedback">{errors.dateOfBirth.message}</span>}
						</div>
					)}

					{isFieldVisible(formSettings, 7) && (
						<div className="form-group mb-0">
							<label className="control-label">{getFieldLabel(formSettings, 7, "Kewarganegaraan")}</label>
							<div className="flex gap-6 items-center h-10 px-1">
								{getFieldOptions(formSettings, 7, ["WNI", "WNA"]).map((opt) => (
									<label key={opt} className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
										<input type="radio" value={getOptionValue(opt, 7)} className="accent-[#059669] w-4 h-4" {...register("nationality")} />
										<span>{opt}</span>
									</label>
								))}
							</div>
							{errors.nationality && <span className="invalid-feedback">{errors.nationality.message}</span>}
						</div>
					)}

					{isFieldVisible(formSettings, 8) && (
						<div className="form-group mb-0">
							<label className="control-label">{getFieldLabel(formSettings, 8, "Tinggal Bersama")}</label>
							<div className="flex gap-6 items-center h-10 px-1">
								{getFieldOptions(formSettings, 8, ["Orang Tua", "Wali"]).map((opt) => (
									<label key={opt} className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
										<input type="radio" value={getOptionValue(opt, 8)} className="accent-[#059669] w-4 h-4" {...register("liveWith")} />
										<span>{opt}</span>
									</label>
								))}
							</div>
							{errors.liveWith && <span className="invalid-feedback">{errors.liveWith.message}</span>}
						</div>
					)}

					{isFieldVisible(formSettings, 12) && (
						<div className="form-group mb-0">
							<label className="control-label">{getFieldLabel(formSettings, 12, "Nomor HP / WhatsApp")}</label>
							<input
								type="text"
								className={`form-control ${errors.phone ? "is-invalid" : ""}`}
								placeholder="Contoh: 081234567890"
								{...register("phone")}
							/>
							{errors.phone && <span className="invalid-feedback">{errors.phone.message}</span>}
						</div>
					)}

					{isFieldVisible(formSettings, 9) && (
						<div className="form-group mb-0">
							<label className="control-label">{getFieldLabel(formSettings, 9, "Anak Ke")}</label>
							<div className="flex gap-2">
								<input
									type="number"
									className={`form-control w-24 ${errors.siblingOrder ? "is-invalid" : ""}`}
									placeholder="Anak ke"
									min={1}
									{...register("siblingOrder")}
								/>
								<span className="flex items-center text-xs text-[var(--grey)]">dari</span>
								<input
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
							<label className="control-label">{getFieldLabel(formSettings, 10, "Keadaan Orang Tua")}</label>
							<select className={`form-control ${errors.parentStatus ? "is-invalid" : ""}`} {...register("parentStatus")}>
								{getFieldOptions(formSettings, 10, ["Ayah & Ibu", "Yatim Piatu", "Yatim"]).map((opt) => (
									<option key={opt} value={getOptionValue(opt, 10)}>
										{opt}
									</option>
								))}
							</select>
						</div>
					)}

					{isFieldVisible(formSettings, 11) && (
						<div className="form-group mb-0">
							<label className="control-label">{getFieldLabel(formSettings, 11, "Status dalam Keluarga")}</label>
							<select className={`form-control ${errors.childStatus ? "is-invalid" : ""}`} {...register("childStatus")}>
								{getFieldOptions(formSettings, 11, ["Anak Kandung", "Anak Tiri", "Anak Asuh/Angkat"]).map((opt) => (
									<option key={opt} value={getOptionValue(opt, 11)}>
										{opt}
									</option>
								))}
							</select>
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
								<label className="control-label">Kelurahan</label>
								<input
									type="text"
									className={`form-control ${errors.village ? "is-invalid" : ""}`}
									placeholder="Kelurahan"
									{...register("village")}
								/>
								{errors.village && <span className="invalid-feedback">{errors.village.message}</span>}
							</div>

							<div className="form-group mb-0">
								<label className="control-label">Jalan</label>
								<input
									type="text"
									className={`form-control ${errors.street ? "is-invalid" : ""}`}
									placeholder="Jalan"
									{...register("street")}
								/>
								{errors.street && <span className="invalid-feedback">{errors.street.message}</span>}
							</div>
						</div>

						<div className="grid grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-6">
							<div className="form-group mb-0">
								<label className="control-label">RT</label>
								<input
									type="text"
									className={`form-control ${errors.rt ? "is-invalid" : ""}`}
									placeholder="RT"
									{...register("rt")}
								/>
								{errors.rt && <span className="invalid-feedback">{errors.rt.message}</span>}
							</div>
							<div className="form-group mb-0">
								<label className="control-label">RW</label>
								<input
									type="text"
									className={`form-control ${errors.rw ? "is-invalid" : ""}`}
									placeholder="RW"
									{...register("rw")}
								/>
								{errors.rw && <span className="invalid-feedback">{errors.rw.message}</span>}
							</div>
							<div className="form-group mb-0 col-span-2 md:col-span-1">
								<label className="control-label">Dusun</label>
								<input
									type="text"
									className={`form-control ${errors.subVillage ? "is-invalid" : ""}`}
									placeholder="Dusun"
									{...register("subVillage")}
								/>
								{errors.subVillage && <span className="invalid-feedback">{errors.subVillage.message}</span>}
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
									<label className="control-label">{getFieldLabel(formSettings, 19, "Nama Sekolah Asal")}</label>
									<input
										type="text"
										className={`form-control ${errors.previousSchoolName ? "is-invalid" : ""}`}
										placeholder="Contoh: SD Negeri 1 Bandung"
										{...register("previousSchoolName")}
									/>
									{errors.previousSchoolName && (
										<span className="invalid-feedback">{errors.previousSchoolName.message}</span>
									)}
								</div>
							)}

							{isFieldVisible(formSettings, 20) && (
								<div className="form-group mb-0">
									<label className="control-label">{getFieldLabel(formSettings, 20, "No. Telp / HP Sekolah Asal")}</label>
									<input
										type="text"
										className="form-control"
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
										<label className="control-label">Alamat Detail Sekolah Asal</label>
										<input
											type="text"
											className="form-control"
											placeholder="Jalan, Dusun, Kelurahan"
											{...register("previousSchoolAddressDetail")}
										/>
									</div>
									<div className="form-group mb-0">
										<label className="control-label">Kode POS Sekolah Asal</label>
										<input
											type="text"
											className="form-control"
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
				<button
					type="submit"
					className="roja_btn roja_btn-warning text-white bg-[#ffa800] hover:bg-[#e09400] font-semibold flex items-center gap-2 shadow-lg shadow-[#ffa800]/20"
					disabled={mutation.isPending}
				>
					<span>{mutation.isPending ? "Menyimpan..." : "Lanjutkan"}</span>
					<ChevronRight className="w-5 h-5" />
				</button>
			</div>
		</form>
	)
}

// Sub-step 2: Identity Data
const IdentityStepContent = ({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }): JSX.Element => {
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
		queryKey: ["wizardStep", "identity", sessionId],
		queryFn: () => psbApi.getWizardStep("identity", sessionId),
		enabled: !!sessionId,
		retry: false,
	})

	useEffect(() => {
		if (error) {
			clearSession()
			alert(error instanceof Error ? error.message : "Sesi pendaftaran Anda telah berakhir.")
			navigate({ to: "/" })
		}
	}, [error, clearSession, navigate])

	const mutation = useMutation({
		mutationFn: (data: IdentityInput) => psbApi.saveWizardStep("identity", sessionId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["wizardStep", "identity", sessionId] })
			onNext()
		},
		onError: (err: any) => {
			clearSession()
			alert(err instanceof Error ? err.message : "Sesi pendaftaran Anda telah berakhir.")
			navigate({ to: "/" })
		},
	})

	const {
		register,
		control,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<IdentityInput>({
		resolver: zodResolver(identitySchema) as unknown as import("react-hook-form").Resolver<IdentityInput>,
		values: (initialData || {}) as IdentityInput,
		defaultValues: {
			nik: "",
			nisn: "",
			ksp: "",
			kip: "",
			certificateNumber: "",
			weight: 0,
			height: 0,
			bloodType: "a",
			diseaseHistories: [{ name: "", status: "sembuh" }],
			visualCondition: "normal",
			hearingCondition: "normal",
			immunizationGiven: "complete",
			learningAchievment: "",
			reading: "quran",
			jilidChapter: "",
			quranMemorizing: "",
			gift: "",
		},
	})

	const { fields, append, remove } = useFieldArray({
		control,
		name: "diseaseHistories",
	})

	const watchReading = watch("reading")

	const onSubmit = (data: IdentityInput): void => {
		mutation.mutate(data)
	}

	if (isLoading) {
		return <div className="text-center py-10 text-xs">Memuat data...</div>
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
			{/* Section A: Nomor Identitas Tambahan */}
			<div>
				<div className="border-l-4 border-l-[var(--primary)] pl-4 py-1 mb-6">
					<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">A. Nomor Identitas Tambahan</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-6">
					{isFieldVisible(formSettings, 15) && (
						<div className="form-group mb-0">
							<label className="control-label">{getFieldLabel(formSettings, 15, "NIK (Nomor Induk Kependudukan)")}</label>
							<input
								type="text"
								maxLength={16}
								className="form-control"
								placeholder="16 digit NIK"
								{...register("nik")}
							/>
						</div>
					)}

					{isFieldVisible(formSettings, 14) && (
						<div className="form-group mb-0">
							<label className="control-label">{getFieldLabel(formSettings, 14, "NISN (Nomor Induk Siswa Nasional)")}</label>
							<input
								type="text"
								className="form-control"
								placeholder="10 digit NISN"
								{...register("nisn")}
							/>
						</div>
					)}

					{isFieldVisible(formSettings, 18) && (
						<div className="form-group mb-0">
							<label className="control-label">{getFieldLabel(formSettings, 18, "No. Ijazah / SKL")}</label>
							<input
								type="text"
								className="form-control"
								placeholder="Nomor Ijazah Terakhir"
								{...register("certificateNumber")}
							/>
						</div>
					)}

					{isFieldVisible(formSettings, 16) && (
						<div className="form-group mb-0">
							<label className="control-label">{getFieldLabel(formSettings, 16, "No. KSP (Kartu Sejahtera)")}</label>
							<input
								type="text"
								className="form-control"
								placeholder="Nomor KSP jika ada"
								{...register("ksp")}
							/>
						</div>
					)}

					{isFieldVisible(formSettings, 17) && (
						<div className="form-group mb-0">
							<label className="control-label">{getFieldLabel(formSettings, 17, "No. KIP (Kartu Indonesia Pintar)")}</label>
							<input
								type="text"
								className="form-control"
								placeholder="Nomor KIP jika ada"
								{...register("kip")}
							/>
						</div>
					)}
				</div>
			</div>

			{/* Section B: Data Kesehatan */}
			{isFieldVisible(formSettings, 22) && (
				<div>
					<div className="border-l-4 border-l-[var(--primary)] pl-4 py-1 mb-6">
						<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">
							{getFieldLabel(formSettings, 22, "B. Data Kesehatan Calon Santri")}
						</div>
					</div>
					<div className="flex flex-col gap-5">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-6">
							{isFieldVisible(formSettings, 23) && (
								<>
									<div className="form-group mb-0">
										<label className="control-label">Berat Badan (Kg)</label>
										<input
											type="number"
											className="form-control"
											placeholder="Kg"
											{...register("weight")}
										/>
									</div>

									<div className="form-group mb-0">
										<label className="control-label">Tinggi Badan (Cm)</label>
										<input
											type="number"
											className="form-control"
											placeholder="Cm"
											{...register("height")}
										/>
									</div>
								</>
							)}

							{isFieldVisible(formSettings, 24) && (
								<div className="form-group mb-0">
									<label className="control-label">{getFieldLabel(formSettings, 24, "Golongan Darah")}</label>
									<select className="form-control" {...register("bloodType")}>
										{getFieldOptions(formSettings, 24, ["A", "B", "AB", "O"]).map((opt) => (
											<option key={opt} value={getOptionValue(opt, 24)}>
												{opt}
											</option>
										))}
									</select>
								</div>
							)}
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-6">
							{isFieldVisible(formSettings, 25) && (
								<div className="form-group mb-0">
									<label className="control-label">{getFieldLabel(formSettings, 25, "Kondisi Penglihatan")}</label>
									<div className="flex gap-6 items-center h-10 px-1">
										{getFieldOptions(formSettings, 25, ["Normal", "Berkacamata"]).map((opt) => (
											<label key={opt} className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
												<input type="radio" value={getOptionValue(opt, 25)} className="accent-[#059669] w-4 h-4" {...register("visualCondition")} />
												<span>{opt}</span>
											</label>
										))}
									</div>
								</div>
							)}

							{isFieldVisible(formSettings, 26) && (
								<div className="form-group mb-0">
									<label className="control-label">{getFieldLabel(formSettings, 26, "Kondisi Pendengaran")}</label>
									<div className="flex gap-6 items-center h-10 px-1">
										{getFieldOptions(formSettings, 26, ["Normal", "Kurang Peka Suara"]).map((opt) => (
											<label key={opt} className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
												<input type="radio" value={getOptionValue(opt, 26)} className="accent-[#059669] w-4 h-4" {...register("hearingCondition")} />
												<span>{opt}</span>
											</label>
										))}
									</div>
								</div>
							)}

							{isFieldVisible(formSettings, 27) && (
								<div className="form-group mb-0">
									<label className="control-label">{getFieldLabel(formSettings, 27, "Imunisasi yang Diterima")}</label>
									<select className="form-control" {...register("immunizationGiven")}>
										{getFieldOptions(formSettings, 27, ["Lengkap", "Tidak Lengkap", "Tidak Imunisasi"]).map((opt) => (
											<option key={opt} value={getOptionValue(opt, 27)}>
												{opt}
											</option>
										))}
									</select>
								</div>
							)}
						</div>

						{isFieldVisible(formSettings, 28) && (
							<div className="flex flex-col gap-3 pt-2">
								<div className="flex justify-between items-center max-w-lg">
									<label className="control-label mb-0">
										{getFieldLabel(formSettings, 28, "Riwayat Penyakit Pernah Diderita")}
									</label>
									<button
										type="button"
										onClick={() => append({ name: "", status: "sembuh" })}
										className="roja_btn roja_btn-sm roja_btn-light-secondary font-semibold text-[10px]"
									>
										+ Tambah Penyakit
									</button>
								</div>

								{fields.map((field, index) => (
									<div key={field.id} className="flex gap-3 items-center max-w-lg">
										<input
											type="text"
											className="form-control"
											placeholder="Nama penyakit"
											{...register(`diseaseHistories.${index}.name`)}
										/>
										<select className="form-control w-48" {...register(`diseaseHistories.${index}.status`)}>
											<option value="sembuh">Sembuh</option>
											<option value="masa perawatan">Masa Perawatan</option>
											<option value="belum sembuh">Belum Sembuh</option>
										</select>
										{fields.length > 1 && (
											<button
												type="button"
												onClick={() => remove(index)}
												className="roja_btn roja_btn-sm roja_btn-danger shrink-0 text-white font-semibold text-[10px]"
											>
												Hapus
											</button>
										)}
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			)}

			{/* Section C: Prestasi Belajar */}
			{isFieldVisible(formSettings, 29) && isFieldVisible(formSettings, 30) && (
				<div>
					<div className="border-l-4 border-l-[var(--primary)] pl-4 py-1 mb-6">
						<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">
							{getFieldLabel(formSettings, 29, "C. Prestasi Belajar yang Pernah Diraih")}
						</div>
					</div>
					<div className="form-group mb-0">
						<textarea
							rows={2}
							className="form-control"
							placeholder="Tuliskan kejuaraan atau prestasi belajar yang pernah didapat"
							{...register("learningAchievment")}
						/>
					</div>
				</div>
			)}

			{/* Section D: Prestasi Diniyyah */}
			{isFieldVisible(formSettings, 31) && (
				<div>
					<div className="border-l-4 border-l-[var(--primary)] pl-4 py-1 mb-6">
						<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">
							{getFieldLabel(formSettings, 31, "D. Prestasi Diniyyah & Kemampuan Al-Qur'an")}
						</div>
					</div>
					<div className="flex flex-col gap-5">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6">
							{isFieldVisible(formSettings, 32) && (
								<div className="form-group mb-0">
									<label className="control-label">{getFieldLabel(formSettings, 32, "Kemampuan Membaca")}</label>
									<div className="flex gap-6 items-center h-10 px-1">
										{getFieldOptions(formSettings, 32, ["Jilid", "Al-Quran"]).map((opt) => (
											<label key={opt} className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
												<input type="radio" value={getOptionValue(opt, 32)} className="accent-[#059669] w-4 h-4" {...register("reading")} />
												<span>{opt}</span>
											</label>
										))}
									</div>
								</div>
							)}

							{watchReading === "jilid" && (
								<div className="form-group mb-0">
									<label className="control-label">Sudah Jilid Berapa?</label>
									<input
										type="text"
										className="form-control"
										placeholder="Contoh: Jilid 4"
										{...register("jilidChapter")}
									/>
								</div>
							)}
						</div>

						{isFieldVisible(formSettings, 33) && (
							<div className="form-group mb-0">
								<label className="control-label">{getFieldLabel(formSettings, 33, "Hafalan Al-Qur'an (Juz / Surat)")}</label>
								<textarea
									rows={2}
									className="form-control"
									placeholder="Contoh: Juz 30, Surat Al-Waqi'ah s.d. An-Naas"
									{...register("quranMemorizing")}
								/>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Section E: Bakat & Potensi */}
			{isFieldVisible(formSettings, 34) && isFieldVisible(formSettings, 35) && (
				<div>
					<div className="border-l-4 border-l-[var(--primary)] pl-4 py-1 mb-6">
						<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">
							{getFieldLabel(formSettings, 34, "E. Bakat / Potensi yang Dimiliki")}
						</div>
					</div>
					<div className="form-group mb-0">
						<textarea
							rows={2}
							className="form-control"
							placeholder="Seni, olahraga, pidato, kepemimpinan, dll."
							{...register("gift")}
						/>
					</div>
				</div>
			)}

			<div className="flex justify-between gap-4 mt-8 border-t border-[var(--bg-form-border)] pt-6">
				<button
					type="button"
					onClick={onPrev}
					className="roja_btn roja_btn-secondary font-semibold text-xs text-slate-600 border border-slate-300 hover:bg-slate-50"
				>
					Sebelumnya
				</button>
				<button
					type="submit"
					className="roja_btn roja_btn-warning text-white bg-[#ffa800] hover:bg-[#e09400] font-semibold flex items-center gap-2 shadow-lg shadow-[#ffa800]/20"
					disabled={mutation.isPending}
				>
					<span>{mutation.isPending ? "Menyimpan..." : "Lanjutkan"}</span>
					<ChevronRight className="w-5 h-5" />
				</button>
			</div>
		</form>
	)
}

// Sub-step 3: Family Data
const FamilyStepContent = ({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }): JSX.Element => {
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
			alert(error instanceof Error ? error.message : "Sesi pendaftaran Anda telah berakhir.")
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
			alert(err instanceof Error ? err.message : "Sesi pendaftaran Anda telah berakhir.")
			navigate({ to: "/" })
		},
	})

	const {
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
								<label className="control-label">{getFieldLabel(formSettings, 37, "Nama Lengkap Ayah")}</label>
								<input
									type="text"
									className={`form-control ${errors.fatherName ? "is-invalid" : ""}`}
									placeholder="Masukkan nama lengkap"
									{...register("fatherName")}
								/>
								{errors.fatherName && <span className="invalid-feedback">{errors.fatherName.message}</span>}
							</div>
						)}

						<div className="form-group mb-0">
							<label className="control-label">Status Ayah</label>
							<div className="flex gap-6 items-center h-10 px-1">
								<label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
									<input type="radio" value="hidup" className="accent-[#059669] w-4 h-4" {...register("fatherStatus")} />
									<span>Masih Hidup</span>
								</label>
								<label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
									<input type="radio" value="wafat" className="accent-[#059669] w-4 h-4" {...register("fatherStatus")} />
									<span>Sudah Wafat</span>
								</label>
							</div>
						</div>

						{isFieldVisible(formSettings, 38) && (
							<div className="form-group mb-0">
								<label className="control-label">{getFieldLabel(formSettings, 38, "Agama Ayah")}</label>
								<select className="form-control" {...register("fatherReligion")}>
									{getFieldOptions(formSettings, 38).length > 0 ? (
										getFieldOptions(formSettings, 38).map((opt) => (
											<option key={opt} value={opt}>
												{opt}
											</option>
										))
									) : (
										<>
											<option value="Islam">Islam</option>
											<option value="Kristen">Kristen</option>
											<option value="Katolik">Katolik</option>
											<option value="Hindu">Hindu</option>
											<option value="Buddha">Buddha</option>
											<option value="Konghucu">Konghucu</option>
										</>
									)}
								</select>
							</div>
						)}

						{isFieldVisible(formSettings, 40) && (
							<div className="form-group mb-0">
								<label className="control-label">{getFieldLabel(formSettings, 40, "Pendidikan Terakhir Ayah")}</label>
								<select className="form-control" {...register("fatherLastEducation")}>
									{getFieldOptions(formSettings, 40).length > 0 ? (
										getFieldOptions(formSettings, 40).map((opt) => (
											<option
												key={opt}
												value={
													opt === "Tidak Sekolah"
														? "tidak sekolah"
														: opt.toLowerCase()
												}
											>
												{opt}
											</option>
										))
									) : (
										<>
											<option value="tidak sekolah">Tidak Sekolah</option>
											<option value="sd">SD</option>
											<option value="smp">SMP</option>
											<option value="sma">SMA</option>
											<option value="diploma">Diploma</option>
											<option value="s1">S1</option>
											<option value="s2">S2</option>
											<option value="s3">S3</option>
										</>
									)}
								</select>
							</div>
						)}

						{isFieldVisible(formSettings, 43) && (
							<div className="form-group mb-0">
								<label className="control-label">{getFieldLabel(formSettings, 43, "Pekerjaan Ayah")}</label>
								<input
									type="text"
									className={`form-control ${errors.fatherOccupation ? "is-invalid" : ""}`}
									placeholder="Pekerjaan saat ini"
									{...register("fatherOccupation")}
								/>
								{errors.fatherOccupation && (
									<span className="invalid-feedback">{errors.fatherOccupation.message}</span>
								)}
							</div>
						)}

						{isFieldVisible(formSettings, 41) && (
							<div className="form-group mb-0">
								<label className="control-label">{getFieldLabel(formSettings, 41, "Nomor Telepon Ayah")}</label>
								<input
									type="text"
									className={`form-control ${errors.fatherPhone ? "is-invalid" : ""}`}
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
								<label className="control-label">{getFieldLabel(formSettings, 44, "Nama Lengkap Ibu")}</label>
								<input
									type="text"
									className={`form-control ${errors.motherName ? "is-invalid" : ""}`}
									placeholder="Masukkan nama lengkap"
									{...register("motherName")}
								/>
								{errors.motherName && <span className="invalid-feedback">{errors.motherName.message}</span>}
							</div>
						)}

						<div className="form-group mb-0">
							<label className="control-label">Status Ibu</label>
							<div className="flex gap-6 items-center h-10 px-1">
								<label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
									<input type="radio" value="hidup" className="accent-[#059669] w-4 h-4" {...register("motherStatus")} />
									<span>Masih Hidup</span>
								</label>
								<label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
									<input type="radio" value="wafat" className="accent-[#059669] w-4 h-4" {...register("motherStatus")} />
									<span>Sudah Wafat</span>
								</label>
							</div>
						</div>

						{isFieldVisible(formSettings, 45) && (
							<div className="form-group mb-0">
								<label className="control-label">{getFieldLabel(formSettings, 45, "Agama Ibu")}</label>
								<select className="form-control" {...register("motherReligion")}>
									{getFieldOptions(formSettings, 45).length > 0 ? (
										getFieldOptions(formSettings, 45).map((opt) => (
											<option key={opt} value={opt}>
												{opt}
											</option>
										))
									) : (
										<>
											<option value="Islam">Islam</option>
											<option value="Kristen">Kristen</option>
											<option value="Katolik">Katolik</option>
											<option value="Hindu">Hindu</option>
											<option value="Buddha">Buddha</option>
											<option value="Konghucu">Konghucu</option>
										</>
									)}
								</select>
							</div>
						)}

						{isFieldVisible(formSettings, 47) && (
							<div className="form-group mb-0">
								<label className="control-label">{getFieldLabel(formSettings, 47, "Pendidikan Terakhir Ibu")}</label>
								<select className="form-control" {...register("motherLastEducation")}>
									{getFieldOptions(formSettings, 47).length > 0 ? (
										getFieldOptions(formSettings, 47).map((opt) => (
											<option
												key={opt}
												value={
													opt === "Tidak Sekolah"
														? "tidak sekolah"
														: opt.toLowerCase()
												}
											>
												{opt}
											</option>
										))
									) : (
										<>
											<option value="tidak sekolah">Tidak Sekolah</option>
											<option value="sd">SD</option>
											<option value="smp">SMP</option>
											<option value="sma">SMA</option>
											<option value="diploma">Diploma</option>
											<option value="s1">S1</option>
											<option value="s2">S2</option>
											<option value="s3">S3</option>
										</>
									)}
								</select>
							</div>
						)}

						{isFieldVisible(formSettings, 50) && (
							<div className="form-group mb-0">
								<label className="control-label">{getFieldLabel(formSettings, 50, "Pekerjaan Ibu")}</label>
								<input
									type="text"
									className={`form-control ${errors.motherOccupation ? "is-invalid" : ""}`}
									placeholder="Pekerjaan saat ini"
									{...register("motherOccupation")}
								/>
								{errors.motherOccupation && (
									<span className="invalid-feedback">{errors.motherOccupation.message}</span>
								)}
							</div>
						)}

						{isFieldVisible(formSettings, 48) && (
							<div className="form-group mb-0">
								<label className="control-label">{getFieldLabel(formSettings, 48, "Nomor Telepon Ibu")}</label>
								<input
									type="text"
									className={`form-control ${errors.motherPhone ? "is-invalid" : ""}`}
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
							<label className="control-label">Kelurahan</label>
							<input
								type="text"
								className={`form-control ${errors.familyVillage ? "is-invalid" : ""}`}
								placeholder="Kelurahan"
								{...register("familyVillage")}
							/>
						</div>
						<div className="form-group mb-0">
							<label className="control-label">Jalan</label>
							<input
								type="text"
								className={`form-control ${errors.familyStreet ? "is-invalid" : ""}`}
								placeholder="Nama Jalan"
								{...register("familyStreet")}
							/>
						</div>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-6">
						<div className="form-group mb-0">
							<label className="control-label">RT</label>
							<input
								type="text"
								className={`form-control ${errors.familyRt ? "is-invalid" : ""}`}
								placeholder="001"
								{...register("familyRt")}
							/>
						</div>
						<div className="form-group mb-0">
							<label className="control-label">RW</label>
							<input
								type="text"
								className={`form-control ${errors.familyRw ? "is-invalid" : ""}`}
								placeholder="002"
								{...register("familyRw")}
							/>
						</div>
						<div className="form-group mb-0 col-span-2 md:col-span-1">
							<label className="control-label">Dusun</label>
							<input
								type="text"
								className={`form-control ${errors.familySubVillage ? "is-invalid" : ""}`}
								placeholder="Dusun"
								{...register("familySubVillage")}
							/>
						</div>
					</div>
				</div>
			</div>

			<div className="flex justify-between gap-4 mt-8 border-t border-[var(--bg-form-border)] pt-6">
				<button type="button" onClick={onPrev} className="roja_btn roja_btn-secondary text-xs">
					Sebelumnya
				</button>
				<button type="submit" className="roja_btn roja_btn-primary text-xs" disabled={mutation.isPending}>
					<span>{mutation.isPending ? "Menyimpan..." : "Selanjutnya"}</span>
					<ChevronRight className="w-5 h-5" />
				</button>
			</div>
		</form>
	)
}

// Sub-step 4: Guardian Data
const GuardianStepContent = ({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }): JSX.Element => {
	const queryClient = useQueryClient()
	const sessionId = useWizardStore((s) => s.sessionId) || ""

	const { data: landingData } = useQuery({
		queryKey: ["landingInfo"],
		queryFn: () => psbApi.getLanding(),
	})
	const formSettings = landingData?.formSettings

	const { data: initialData, isLoading } = useQuery({
		queryKey: ["wizardStep", "guardian", sessionId],
		queryFn: () => psbApi.getWizardStep("guardian", sessionId),
		enabled: !!sessionId,
	})

	const mutation = useMutation({
		mutationFn: (data: GuardianInput) => psbApi.saveWizardStep("guardian", sessionId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["wizardStep", "guardian", sessionId] })
			onNext()
		},
	})

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
	} = useForm<GuardianInput>({
		values: (initialData || {}) as GuardianInput,
	})

	const onSubmit = (data: GuardianInput): void => {
		mutation.mutate(data)
	}

	if (isLoading) {
		return <div className="text-center py-10 text-xs">Memuat data...</div>
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
			{/* Section A: Data Wali */}
			<div>
				<div className="border-l-4 border-l-[var(--primary)] pl-4 py-1 mb-6">
					<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">Data Wali (Jika Ada)</div>
				</div>
				<div className="flex flex-col gap-5">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-6">
						{isFieldVisible(formSettings, 54) && (
							<div className="form-group mb-0">
								<label className="control-label">{getFieldLabel(formSettings, 54, "Nama Lengkap Wali")}</label>
								<input
									type="text"
									className={`form-control ${errors.guardianName ? "is-invalid" : ""}`}
									placeholder="Sesuai KTP Wali"
									{...register("guardianName")}
								/>
								{errors.guardianName && <span className="invalid-feedback">{errors.guardianName.message}</span>}
							</div>
						)}

						{isFieldVisible(formSettings, 55) && (
							<div className="form-group mb-0">
								<label className="control-label">{getFieldLabel(formSettings, 55, "Agama Wali")}</label>
								<select className="form-control" {...register("guardianReligion")}>
									{getFieldOptions(formSettings, 55, ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"]).map((opt) => (
										<option key={opt} value={getOptionValue(opt, 55)}>
											{opt}
										</option>
									))}
								</select>
							</div>
						)}

						{isFieldVisible(formSettings, 56) && (
							<div className="form-group mb-0">
								<label className="control-label">{getFieldLabel(formSettings, 56, "Kewarganegaraan Wali")}</label>
								<div className="flex gap-6 items-center h-10 px-1">
									{getFieldOptions(formSettings, 56, ["WNI", "WNA"]).map((opt) => (
										<label key={opt} className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
											<input type="radio" value={getOptionValue(opt, 56)} className="accent-[#059669] w-4 h-4" {...register("guardianNationality")} />
											<span>{opt}</span>
										</label>
									))}
								</div>
							</div>
						)}

						{isFieldVisible(formSettings, 57) && (
							<div className="form-group mb-0">
								<label className="control-label">{getFieldLabel(formSettings, 57, "Pendidikan Terakhir Wali")}</label>
								<select className="form-control" {...register("guardianLastEducation")}>
									{getFieldOptions(formSettings, 57, ["Tidak Sekolah", "SD", "SMP", "SMA", "Diploma", "S1", "S2", "S3"]).map((opt) => (
										<option key={opt} value={getOptionValue(opt, 57)}>
											{opt}
										</option>
									))}
								</select>
							</div>
						)}

						{isFieldVisible(formSettings, 58) && (
							<div className="form-group mb-0">
								<label className="control-label">{getFieldLabel(formSettings, 58, "Nomor Telepon Wali")}</label>
								<input
									type="text"
									className={`form-control ${errors.guardianPhone ? "is-invalid" : ""}`}
									placeholder="Contoh: 081234567890"
									{...register("guardianPhone")}
								/>
							</div>
						)}

						{isFieldVisible(formSettings, 59) && (
							<div className="form-group mb-0">
								<label className="control-label">{getFieldLabel(formSettings, 59, "Nomor WhatsApp Wali")}</label>
								<input
									type="text"
									className="form-control"
									placeholder="Contoh: 081234567890"
									{...register("guardianWhatsapp")}
								/>
							</div>
						)}

						{isFieldVisible(formSettings, 60) && (
							<div className="form-group mb-0">
								<label className="control-label">{getFieldLabel(formSettings, 60, "Pekerjaan Wali")}</label>
								<input
									type="text"
									className={`form-control ${errors.guardianOccupation ? "is-invalid" : ""}`}
									placeholder="Pekerjaan saat ini"
									{...register("guardianOccupation")}
								/>
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
								provinceLabel="Provinsi Tempat Tinggal Wali"
								regencyLabel="Kabupaten Wali"
								districtLabel="Kecamatan Wali"
							/>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6">
								<div className="form-group mb-0">
									<label className="control-label">Kelurahan</label>
									<input type="text" className="form-control" placeholder="Kelurahan" {...register("guardianVillage")} />
								</div>
								<div className="form-group mb-0">
									<label className="control-label">Jalan</label>
									<input type="text" className="form-control" placeholder="Nama Jalan" {...register("guardianStreet")} />
								</div>
							</div>

							<div className="grid grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-6">
								<div className="form-group mb-0">
									<label className="control-label">RT</label>
									<input type="text" className="form-control" placeholder="001" {...register("guardianRt")} />
								</div>
								<div className="form-group mb-0">
									<label className="control-label">RW</label>
									<input type="text" className="form-control" placeholder="002" {...register("guardianRw")} />
								</div>
								<div className="form-group mb-0 col-span-2 md:col-span-1">
									<label className="control-label">Dusun</label>
									<input type="text" className="form-control" placeholder="Dusun" {...register("guardianSubVillage")} />
								</div>
							</div>
						</>
					)}
				</div>
			</div>

			<div className="flex justify-between gap-4 mt-8 border-t border-[var(--bg-form-border)] pt-6">
				<button
					type="button"
					onClick={onPrev}
					className="roja_btn roja_btn-secondary font-semibold text-xs text-slate-600 border border-slate-300 hover:bg-slate-50"
				>
					Sebelumnya
				</button>
				<button
					type="submit"
					className="roja_btn roja_btn-warning text-white bg-[#ffa800] hover:bg-[#e09400] font-semibold flex items-center gap-2 shadow-lg shadow-[#ffa800]/20"
					disabled={mutation.isPending}
				>
					<span>{mutation.isPending ? "Menyimpan..." : "Lanjutkan"}</span>
					<ChevronRight className="w-5 h-5" />
				</button>
			</div>
		</form>
	)
}

// Sub-step 5: Attachment Data
const AttachmentStepContent = ({ onPrev }: { onPrev: () => void }): JSX.Element => {
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const sessionId = useWizardStore((s) => s.sessionId) || ""
	const login = useAuthStore((s) => s.login)
	const clearSession = useWizardStore((s) => s.clearSession)

	const { data: initialData, isLoading, error } = useQuery({
		queryKey: ["wizardStep", "attachment", sessionId],
		queryFn: () => psbApi.getWizardStep("attachment", sessionId),
		enabled: !!sessionId,
		retry: false,
	})

	useEffect(() => {
		if (error) {
			clearSession()
			alert(error instanceof Error ? error.message : "Sesi pendaftaran Anda telah berakhir.")
			navigate({ to: "/" })
		}
	}, [error, clearSession, navigate])

	const mutation = useMutation({
		mutationFn: (data: AttachmentInput) => psbApi.submitAttachment(sessionId, data),
		onSuccess: (res) => {
			login(res.user)
			clearSession()
			queryClient.invalidateQueries({ queryKey: ["wizardStep", "attachment", sessionId] })
			navigate({
				to: "/register/success/$registrantId",
				params: { registrantId: res.registrantId },
			})
		},
		onError: (err: any) => {
			alert(err instanceof Error ? err.message : "Gagal mengirimkan pendaftaran")
		},
	})

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<AttachmentInput>({
		resolver: zodResolver(attachmentSchema) as unknown as import("react-hook-form").Resolver<AttachmentInput>,
		values: (initialData || {}) as AttachmentInput,
		defaultValues: {
			ijazah: undefined,
			photo: undefined,
			kk: undefined,
			birthCert: undefined,
			ksp: undefined,
			kip: undefined,
			reportCard: undefined,
		},
	})

	const onSubmit = (data: AttachmentInput): void => {
		mutation.mutate(data)
	}

	if (isLoading) {
		return <div className="text-center py-10 text-xs">Memuat data...</div>
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
			{/* Section A: Unggah Berkas */}
			<div>
				<div className="border-l-4 border-l-[var(--primary)] pl-4 py-1 mb-6">
					<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">Unggah Berkas & Lampiran</div>
				</div>
				<p className="text-xs text-[var(--body-txt-inverse)] mb-6">
					Silakan unggah berkas foto/dokumen dalam format .JPG, .JPEG, atau .PNG dengan ukuran maksimal 5MB.
				</p>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6">
					<Controller
						control={control}
						name="ijazah"
						render={({ field }) => (
							<FileUploadField
								label="Salinan Ijazah Terakhir / SKL"
								value={field.value}
								onChange={field.onChange}
								error={errors.ijazah?.message}
							/>
						)}
					/>

					<Controller
						control={control}
						name="photo"
						render={({ field }) => (
							<FileUploadField
								label="Pas Foto Calon Santri (Ukuran 3x4)"
								value={field.value}
								onChange={field.onChange}
								error={errors.photo?.message}
							/>
						)}
					/>

					<Controller
						control={control}
						name="kk"
						render={({ field }) => (
							<FileUploadField
								label="Salinan Kartu Keluarga (KK)"
								value={field.value}
								onChange={field.onChange}
								error={errors.kk?.message}
							/>
						)}
					/>

					<Controller
						control={control}
						name="birthCert"
						render={({ field }) => (
							<FileUploadField
								label="Salinan Akta Kelahiran"
								value={field.value}
								onChange={field.onChange}
								error={errors.birthCert?.message}
							/>
						)}
					/>

					<Controller
						control={control}
						name="reportCard"
						render={({ field }) => (
							<FileUploadField
								label="Salinan Rapor Terakhir (Optional)"
								value={field.value}
								onChange={field.onChange}
								error={errors.reportCard?.message}
							/>
						)}
					/>

					<Controller
						control={control}
						name="ksp"
						render={({ field }) => (
							<FileUploadField
								label="Kartu Sejahtera / KSP (Jika ada)"
								value={field.value}
								onChange={field.onChange}
								error={errors.ksp?.message}
							/>
						)}
					/>

					<Controller
						control={control}
						name="kip"
						render={({ field }) => (
							<FileUploadField
								label="Kartu Indonesia Pintar / KIP (Jika ada)"
								value={field.value}
								onChange={field.onChange}
								error={errors.kip?.message}
							/>
						)}
					/>
				</div>
			</div>

			<div className="flex justify-between gap-4 mt-8 border-t border-[var(--bg-form-border)] pt-6">
				<button
					type="button"
					onClick={onPrev}
					className="roja_btn roja_btn-secondary font-semibold text-xs text-slate-600 border border-slate-300 hover:bg-slate-50"
				>
					Sebelumnya
				</button>
				<button
					type="submit"
					className="roja_btn roja_btn-warning text-white bg-[#ffa800] hover:bg-[#e09400] font-semibold flex items-center gap-2 shadow-lg shadow-[#ffa800]/20"
					disabled={mutation.isPending}
				>
					<span>{mutation.isPending ? "Mengirim..." : "Selesaikan Pendaftaran"}</span>
					<ChevronRight className="w-5 h-5" />
				</button>
			</div>
		</form>
	)
}

// Unified Single Form Component for /register
const RegisterDataPage = (): JSX.Element => {
	const subStep = useWizardStore((s) => s.subStep)
	const setSubStep = useWizardStore((s) => s.setSubStep)

	const nextStep = (): void => setSubStep(Math.min(subStep + 1, 5))
	const prevStep = (): void => setSubStep(Math.max(subStep - 1, 1))

	return (
		<div>
			<WizardStepper mainStep={2} subStep={subStep} onStepClick={(step) => setSubStep(step)} />
			<div className="tbr_wizard_content mt-8">
				{subStep === 1 && <PersonalStepContent onNext={nextStep} />}
				{subStep === 2 && <IdentityStepContent onNext={nextStep} onPrev={prevStep} />}
				{subStep === 3 && <FamilyStepContent onNext={nextStep} onPrev={prevStep} />}
				{subStep === 4 && <GuardianStepContent onNext={nextStep} onPrev={prevStep} />}
				{subStep === 5 && <AttachmentStepContent onPrev={prevStep} />}
			</div>
		</div>
	)
}

export const Route = createFileRoute("/_wizard/register")({
	beforeLoad: () => {
		const wizard = useWizardStore.getState()
		if (!wizard.sessionId) {
			throw redirect({ to: "/" })
		}
	},
	component: RegisterDataPage,
})

export default RegisterDataPage
