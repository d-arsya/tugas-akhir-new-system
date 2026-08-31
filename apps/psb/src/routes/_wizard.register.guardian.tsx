import type { JSX } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { guardianSchema, type GuardianInput } from "@/schemas/register.schema"
import { psbApi } from "@/lib/api"
import useWizardStore from "@/stores/wizard.store"
import LocationSelect from "@/components/location-select"
import { useNavigate, createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ChevronRight } from "lucide-react"

const GuardianStep = (): JSX.Element => {
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const sessionId = useWizardStore((s) => s.sessionId) || ""

	const { data: initialData, isLoading } = useQuery({
		queryKey: ["wizardStep", "guardian", sessionId],
		queryFn: () => psbApi.getWizardStep("guardian", sessionId),
		enabled: !!sessionId,
	})

	const mutation = useMutation({
		mutationFn: (data: GuardianInput) => psbApi.saveWizardStep("guardian", sessionId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["wizardStep", "guardian", sessionId] })
			navigate({ to: "/register/attachment" })
		},
	})

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
	} = useForm<GuardianInput>({
		resolver: zodResolver(guardianSchema) as unknown as import("react-hook-form").Resolver<GuardianInput>,
		values: (initialData || {}) as GuardianInput,
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
						<div className="form-group mb-0">
							<label className="control-label">Nama Lengkap Wali</label>
							<input
								type="text"
								className={`form-control ${errors.guardianName ? "is-invalid" : ""}`}
								placeholder="Sesuai KTP Wali"
								{...register("guardianName")}
							/>
							{errors.guardianName && <span className="invalid-feedback">{errors.guardianName.message}</span>}
						</div>

						<div className="form-group mb-0">
							<label className="control-label">Hubungan Kekerabatan</label>
							<input
								type="text"
								className={`form-control ${errors.guardianRelationship ? "is-invalid" : ""}`}
								placeholder="Contoh: Paman / Kakek"
								{...register("guardianRelationship")}
							/>
							{errors.guardianRelationship && (
								<span className="invalid-feedback">{errors.guardianRelationship.message}</span>
							)}
						</div>

						<div className="form-group mb-0">
							<label className="control-label">Nomor Telepon / WA Wali</label>
							<input
								type="text"
								className={`form-control ${errors.guardianPhone ? "is-invalid" : ""}`}
								placeholder="Contoh: 081234567890"
								{...register("guardianPhone")}
							/>
							{errors.guardianPhone && <span className="invalid-feedback">{errors.guardianPhone.message}</span>}
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-6">
						<div className="form-group mb-0">
							<label className="control-label">Pendidikan Terakhir Wali</label>
							<select className="form-control" {...register("guardianLastEducation")}>
								<option value="tidak sekolah">Tidak Sekolah</option>
								<option value="sd">SD</option>
								<option value="smp">SMP</option>
								<option value="sma">SMA</option>
								<option value="diploma">Diploma</option>
								<option value="s1">S1</option>
								<option value="s2">S2</option>
								<option value="s3">S3</option>
							</select>
						</div>

						<div className="form-group mb-0">
							<label className="control-label">Pekerjaan Wali</label>
							<input
								type="text"
								className={`form-control ${errors.guardianOccupation ? "is-invalid" : ""}`}
								placeholder="Pekerjaan saat ini"
								{...register("guardianOccupation")}
							/>
							{errors.guardianOccupation && (
								<span className="invalid-feedback">{errors.guardianOccupation.message}</span>
							)}
						</div>

						<div className="form-group mb-0">
							<label className="control-label">Penghasilan Bulanan (Rp)</label>
							<input
								type="number"
								className="form-control"
								placeholder="Contoh: 4000000"
								{...register("guardianIncome")}
							/>
						</div>
					</div>

					<div className="form-group mb-0">
						<label className="control-label">Alamat Lengkap Wali</label>
						<textarea
							rows={2}
							className={`form-control ${errors.guardianAddress ? "is-invalid" : ""}`}
							placeholder="Masukkan alamat lengkap rumah wali"
							{...register("guardianAddress")}
						/>
						{errors.guardianAddress && (
							<span className="invalid-feedback">{errors.guardianAddress.message}</span>
						)}
					</div>

					<LocationSelect
						prefix="guardian"
						register={register}
						errors={errors}
						watch={watch}
						setValue={setValue}
						provinceLabel="Provinsi Tempat Tinggal Wali"
						regencyLabel="Kabupaten/Kota Wali"
						districtLabel="Kecamatan Wali"
					/>
				</div>
			</div>

			<div className="flex justify-between gap-4 mt-8 border-t border-[var(--bg-form-border)] pt-6">
				<button
					type="button"
					onClick={() => navigate({ to: "/register/family" })}
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

export const Route = createFileRoute("/_wizard/register/guardian")({
	component: GuardianStep,
})

export default GuardianStep
