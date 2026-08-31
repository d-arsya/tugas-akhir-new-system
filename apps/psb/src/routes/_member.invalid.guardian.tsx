import type { JSX } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { guardianSchema, type GuardianInput } from "@/schemas/register.schema"
import { psbApi } from "@/lib/api"
import LocationSelect from "@/components/location-select"
import { useNavigate, createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

const InvalidGuardianStep = (): JSX.Element => {
	const navigate = useNavigate()
	const queryClient = useQueryClient()

	const { data: initialData, isLoading } = useQuery({
		queryKey: ["invalidData"],
		queryFn: () => psbApi.getInvalidData(),
	})

	const mutation = useMutation({
		mutationFn: (data: GuardianInput) => psbApi.updateInvalidStep("guardian", data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["invalidData"] })
			navigate({ to: "/invalid/attachment" })
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
		values: (initialData ? (initialData as Record<string, unknown>).guardian : {}) as GuardianInput,
		defaultValues: {
			guardianName: "",
			guardianRelationship: "",
			guardianOccupation: "",
			guardianPhone: "",
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
		<div className="flex flex-col gap-6">
			<div className="border-l-4 border-l-[var(--primary)] pl-4 py-1 mb-2">
				<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">Perbaiki Data: Data Wali</div>
				<div className="text-[10px] text-[var(--grey)] mt-0.5">Harap perbarui data wali Anda jika diperlukan.</div>
			</div>

			<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="form-group">
						<label className="control-label">Nama Lengkap Wali</label>
						<input
							type="text"
							className={`form-control ${errors.guardianName ? "is-invalid" : ""}`}
							{...register("guardianName")}
						/>
						{errors.guardianName && <span className="invalid-feedback">{errors.guardianName.message}</span>}
					</div>
					<div className="form-group">
						<label className="control-label">Hubungan dengan Calon Santri</label>
						<input
							type="text"
							className={`form-control ${errors.guardianRelationship ? "is-invalid" : ""}`}
							{...register("guardianRelationship")}
						/>
						{errors.guardianRelationship && (
							<span className="invalid-feedback">{errors.guardianRelationship.message}</span>
						)}
					</div>
					<div className="form-group">
						<label className="control-label">Pekerjaan Wali</label>
						<input
							type="text"
							className={`form-control ${errors.guardianOccupation ? "is-invalid" : ""}`}
							{...register("guardianOccupation")}
						/>
						{errors.guardianOccupation && (
							<span className="invalid-feedback">{errors.guardianOccupation.message}</span>
						)}
					</div>
					<div className="form-group">
						<label className="control-label">Nomor HP / WhatsApp Wali</label>
						<input
							type="text"
							className={`form-control ${errors.guardianPhone ? "is-invalid" : ""}`}
							{...register("guardianPhone")}
						/>
						{errors.guardianPhone && <span className="invalid-feedback">{errors.guardianPhone.message}</span>}
					</div>
				</div>

				<div className="flex flex-col gap-2 border-t border-[var(--bg-form-border)] pt-4">
					<label className="text-xs font-bold uppercase tracking-wider text-[var(--grey)]">
						Alamat Wali
					</label>
					<div className="form-group">
						<label className="control-label">Alamat Lengkap</label>
						<textarea
							rows={2}
							className={`form-control ${errors.guardianAddress ? "is-invalid" : ""}`}
							{...register("guardianAddress")}
						/>
						{errors.guardianAddress && <span className="invalid-feedback">{errors.guardianAddress.message}</span>}
					</div>

					<LocationSelect
						prefix="guardian"
						register={register}
						errors={errors}
						watch={watch}
						setValue={setValue}
						provinceLabel="Provinsi Wali"
						regencyLabel="Kabupaten/Kota Wali"
						districtLabel="Kecamatan Wali"
					/>
				</div>

				<div className="flex justify-between gap-4 mt-6 border-t border-slate-100 pt-4">
					<button
						type="button"
						onClick={() => navigate({ to: "/invalid/family" })}
						className="roja_btn roja_btn-secondary"
					>
						Sebelumnya
					</button>
					<button
						type="submit"
						className="roja_btn roja_btn-primary text-white bg-[var(--primary)]"
						disabled={mutation.isPending}
					>
						{mutation.isPending ? "Menyimpan..." : "Lanjutkan"}
					</button>
				</div>
			</form>
		</div>
	)
}

export const Route = createFileRoute("/_member/invalid/guardian")({
	component: InvalidGuardianStep,
})

export default InvalidGuardianStep
