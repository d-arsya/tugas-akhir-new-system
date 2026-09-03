import type { JSX } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { personalSchema, type PersonalInput } from "@/schemas/register.schema"
import { psbApi } from "@/lib/api"
import useWizardStore from "@/stores/wizard.store"
import LocationSelect from "@/components/location-select"
import { useNavigate, createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ChevronRight } from "lucide-react"
import { isFieldVisible, getFieldLabel, getFieldOptions } from "@roja/utils"

const PersonalStep = (): JSX.Element => {
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const sessionId = useWizardStore((s) => s.sessionId) || ""

	const { data: landingData } = useQuery({
		queryKey: ["landingInfo"],
		queryFn: () => psbApi.getLanding(),
	})
	const formSettings = landingData?.formSettings

	const { data: initialData, isLoading } = useQuery({
		queryKey: ["wizardStep", "personal", sessionId],
		queryFn: () => psbApi.getWizardStep("personal", sessionId),
		enabled: !!sessionId,
	})

	const mutation = useMutation({
		mutationFn: (data: PersonalInput) => psbApi.saveWizardStep("personal", sessionId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["wizardStep", "personal", sessionId] })
			navigate({ to: "/register/identity" })
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

	const onSubmit = (data: PersonalInput): void => {
		mutation.mutate(data)
	}

	if (isLoading) {
		return <div className="text-center py-10 text-xs">Memuat data...</div>
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
			{/* Section A: Data Diri */}
			<div>
				<div className="border-l-4 border-l-[var(--primary)] pl-4 py-1 mb-6">
					<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">A. Data Diri Calon Santri</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6">
					{isFieldVisible(formSettings, 1) && (
						<div className="form-group mb-0">
							<label className="control-label">{getFieldLabel(formSettings, 1, "Nama Lengkap")}</label>
							<input
								type="text"
								className={`form-control ${errors.fullName ? "is-invalid" : ""}`}
								placeholder="Sesuai Akta Kelahiran / KK"
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
								{getFieldOptions(formSettings, 3).length > 0 ? (
									getFieldOptions(formSettings, 3).map((opt) => (
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
							{errors.religion && <span className="invalid-feedback">{errors.religion.message}</span>}
						</div>
					)}

					{isFieldVisible(formSettings, 4) && (
						<div className="form-group mb-0">
							<label className="control-label">{getFieldLabel(formSettings, 4, "Jenis Kelamin")}</label>
							<select className={`form-control ${errors.gender ? "is-invalid" : ""}`} {...register("gender")}>
								<option value="male">Laki-laki</option>
								<option value="female">Perempuan</option>
							</select>
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
							<select
								className={`form-control ${errors.nationality ? "is-invalid" : ""}`}
								{...register("nationality")}
							>
								<option value="wni">Warga Negara Indonesia (WNI)</option>
								<option value="wna">Warga Negara Asing (WNA)</option>
							</select>
							{errors.nationality && <span className="invalid-feedback">{errors.nationality.message}</span>}
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
								<option value="complete">Ayah & Ibu</option>
								<option value="single_parent">Yatim / Piatu</option>
								<option value="orphan">Yatim Piatu</option>
							</select>
						</div>
					)}

					{isFieldVisible(formSettings, 11) && (
						<div className="form-group mb-0">
							<label className="control-label">{getFieldLabel(formSettings, 11, "Status dalam Keluarga")}</label>
							<select className={`form-control ${errors.childStatus ? "is-invalid" : ""}`} {...register("childStatus")}>
								<option value="kandung">Anak Kandung</option>
								<option value="tiri">Anak Tiri</option>
								<option value="angkat">Anak Angkat/Asuh</option>
							</select>
						</div>
					)}
				</div>
			</div>

			{/* Section B: Nomor Identitas */}
			<div>
				<div className="border-l-4 border-l-[var(--primary)] pl-4 py-1 mb-6">
					<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">B. Nomor Identitas Tambahan</div>
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

			{/* Section C: Alamat */}
			{isFieldVisible(formSettings, 13) && (
				<div>
					<div className="border-l-4 border-l-[var(--primary)] pl-4 py-1 mb-6">
						<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">C. Alamat Tempat Tinggal</div>
					</div>
					<div className="flex flex-col gap-5">
						<div className="form-group mb-0">
							<label className="control-label">{getFieldLabel(formSettings, 13, "Alamat Lengkap (Jalan / Dusun)")}</label>
							<textarea
								rows={2}
								className={`form-control ${errors.address ? "is-invalid" : ""}`}
								placeholder="Masukkan alamat tinggal saat ini"
								{...register("address")}
							/>
							{errors.address && <span className="invalid-feedback">{errors.address.message}</span>}
						</div>

						<LocationSelect
							register={register}
							errors={errors}
							watch={watch}
							setValue={setValue}
						/>

						<div className="grid grid-cols-2 md:grid-cols-4 gap-y-5 gap-x-6">
							<div className="form-group mb-0">
								<label className="control-label">RT</label>
								<input
									type="text"
									className={`form-control ${errors.rt ? "is-invalid" : ""}`}
									placeholder="001"
									{...register("rt")}
								/>
								{errors.rt && <span className="invalid-feedback">{errors.rt.message}</span>}
							</div>
							<div className="form-group mb-0">
								<label className="control-label">RW</label>
								<input
									type="text"
									className={`form-control ${errors.rw ? "is-invalid" : ""}`}
									placeholder="002"
									{...register("rw")}
								/>
								{errors.rw && <span className="invalid-feedback">{errors.rw.message}</span>}
							</div>
							<div className="form-group mb-0">
								<label className="control-label">Kode Pos</label>
								<input
									type="text"
									className={`form-control ${errors.postalCode ? "is-invalid" : ""}`}
									placeholder="40111"
									{...register("postalCode")}
								/>
								{errors.postalCode && <span className="invalid-feedback">{errors.postalCode.message}</span>}
							</div>
						</div>

						{isFieldVisible(formSettings, 8) && (
							<div className="form-group mb-0 max-w-md">
								<label className="control-label">{getFieldLabel(formSettings, 8, "Tinggal Bersama")}</label>
								<select className={`form-control ${errors.liveWith ? "is-invalid" : ""}`} {...register("liveWith")}>
									<option value="parent">Orang Tua Kandung</option>
									<option value="guardian">Wali</option>
									<option value="other">Lainnya / Mandiri</option>
								</select>
								{errors.liveWith && <span className="invalid-feedback">{errors.liveWith.message}</span>}
							</div>
						)}
					</div>
				</div>
			)}

			{/* Section D: Sekolah Asal */}
			{(isFieldVisible(formSettings, 19) || isFieldVisible(formSettings, 20) || isFieldVisible(formSettings, 21)) && (
				<div>
					<div className="border-l-4 border-l-[var(--primary)] pl-4 py-1 mb-6">
						<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">D. Data Sekolah Asal</div>
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
							<LocationSelect
								prefix="previousSchool"
								register={register}
								errors={errors}
								watch={watch}
								setValue={setValue}
								provinceLabel="Provinsi Sekolah Asal"
								regencyLabel="Kabupaten/Kota Sekolah Asal"
								districtLabel="Kecamatan Sekolah Asal"
								includeVillage={false}
							/>
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

export const Route = createFileRoute("/_wizard/register/personal")({
	component: PersonalStep,
})

export default PersonalStep
