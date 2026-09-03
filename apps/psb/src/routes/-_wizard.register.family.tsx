import type { JSX } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { familySchema, type FamilyInput } from "@/schemas/register.schema"
import { psbApi } from "@/lib/api"
import useWizardStore from "@/stores/wizard.store"
import LocationSelect from "@/components/location-select"
import { useNavigate, createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ChevronRight } from "lucide-react"
import { isFieldVisible, getFieldLabel, getFieldOptions } from "@roja/utils"

const FamilyStep = (): JSX.Element => {
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const sessionId = useWizardStore((s) => s.sessionId) || ""

	const { data: landingData } = useQuery({
		queryKey: ["landingInfo"],
		queryFn: () => psbApi.getLanding(),
	})
	const formSettings = landingData?.formSettings

	const { data: initialData, isLoading } = useQuery({
		queryKey: ["wizardStep", "family", sessionId],
		queryFn: () => psbApi.getWizardStep("family", sessionId),
		enabled: !!sessionId,
	})

	const mutation = useMutation({
		mutationFn: (data: FamilyInput) => psbApi.saveWizardStep("family", sessionId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["wizardStep", "family", sessionId] })
			navigate({ to: "/register/guardian" })
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
							<select className="form-control" {...register("fatherStatus")}>
								<option value="hidup">Masih Hidup</option>
								<option value="wafat">Sudah Wafat</option>
							</select>
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
							<select className="form-control" {...register("motherStatus")}>
								<option value="hidup">Masih Hidup</option>
								<option value="wafat">Sudah Wafat</option>
							</select>
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

			{/* Section C: Struktur & Alamat */}
			<div>
				<div className="border-l-4 border-l-[var(--primary)] pl-4 py-1 mb-6">
					<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">C. Struktur & Alamat Tempat Tinggal Keluarga</div>
				</div>
				<div className="flex flex-col gap-5">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-6">
						<div className="form-group mb-0">
							<label className="control-label">Jumlah Saudara Kandung</label>
							<input
								type="number"
								className={`form-control ${errors.numberOfSiblings ? "is-invalid" : ""}`}
								placeholder="Jumlah saudara"
								{...register("numberOfSiblings")}
							/>
							{errors.numberOfSiblings && (
								<span className="invalid-feedback">{errors.numberOfSiblings.message}</span>
							)}
						</div>

						<div className="form-group mb-0">
							<label className="control-label">Anak Ke-</label>
							<input
								type="number"
								className={`form-control ${errors.childOrder ? "is-invalid" : ""}`}
								placeholder="Anak ke berapa"
								{...register("childOrder")}
							/>
							{errors.childOrder && <span className="invalid-feedback">{errors.childOrder.message}</span>}
						</div>

						<div className="form-group mb-0">
							<label className="control-label">Status Keluarga</label>
							<select
								className={`form-control ${errors.familyStatus ? "is-invalid" : ""}`}
								{...register("familyStatus")}
							>
								<option value="complete">Keluarga Utuh</option>
								<option value="single_parent">Orang Tua Tunggal</option>
								<option value="orphan">Yatim / Piatu</option>
							</select>
							{errors.familyStatus && <span className="invalid-feedback">{errors.familyStatus.message}</span>}
						</div>
					</div>

					{isFieldVisible(formSettings, 51) && (
						<>
							<LocationSelect
								prefix="family"
								register={register}
								errors={errors}
								watch={watch}
								setValue={setValue}
								provinceLabel="Provinsi Tempat Tinggal Orang Tua"
								regencyLabel="Kabupaten/Kota Orang Tua"
								districtLabel="Kecamatan Orang Tua"
							/>

							{isFieldVisible(formSettings, 52) && (
								<div className="grid grid-cols-2 md:grid-cols-4 gap-y-5 gap-x-6">
									<div className="form-group mb-0">
										<label className="control-label">Jalan</label>
										<input type="text" className="form-control" placeholder="Nama Jalan" {...register("familyStreet")} />
									</div>
									<div className="form-group mb-0">
										<label className="control-label">Kelurahan</label>
										<input type="text" className="form-control" placeholder="Kelurahan" {...register("familyVillage")} />
									</div>
									<div className="form-group mb-0">
										<label className="control-label">RT</label>
										<input type="text" className="form-control" placeholder="001" {...register("familyRt")} />
									</div>
									<div className="form-group mb-0">
										<label className="control-label">RW</label>
										<input type="text" className="form-control" placeholder="002" {...register("familyRw")} />
									</div>
								</div>
							)}
						</>
					)}
				</div>
			</div>

			<div className="flex justify-between gap-4 mt-8 border-t border-[var(--bg-form-border)] pt-6">
				<button
					type="button"
					onClick={() => navigate({ to: "/register/identity" })}
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

export const Route = createFileRoute("/_wizard/register/family")({
	component: FamilyStep,
})

export default FamilyStep
