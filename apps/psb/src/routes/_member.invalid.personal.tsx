import type { JSX } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { personalSchema, type PersonalInput } from "@/schemas/register.schema"
import { psbApi } from "@/lib/api"
import LocationSelect from "@/components/location-select"
import { useNavigate, createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

const InvalidPersonalStep = (): JSX.Element => {
	const navigate = useNavigate()
	const queryClient = useQueryClient()

	const { data: initialData, isLoading } = useQuery({
		queryKey: ["invalidData"],
		queryFn: () => psbApi.getInvalidData(),
	})

	const mutation = useMutation({
		mutationFn: (data: PersonalInput) => psbApi.updateInvalidStep("personal", data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["invalidData"] })
			navigate({ to: "/invalid/identity" })
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
		values: (initialData ? (initialData as Record<string, unknown>).personal : {}) as PersonalInput,
		defaultValues: {
			fullName: "",
			gender: "male",
			nationality: "wni",
			dateOfBirth: "",
			placeOfBirth: "",
			address: "",
			provinceId: 0,
			regencyId: 0,
			districtId: 0,
			rt: "",
			rw: "",
			postalCode: "",
			phone: "",
			liveWith: "parent",
			previousSchoolName: "",
			previousSchoolProvinceId: 0,
			previousSchoolRegencyId: 0,
			previousSchoolDistrictId: 0,
		},
	})

	const onSubmit = (data: PersonalInput): void => {
		mutation.mutate(data)
	}

	if (isLoading) {
		return <div className="text-center py-10 text-xs">Memuat data...</div>
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="border-l-4 border-l-[var(--primary)] pl-4 py-1 mb-2">
				<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">Perbaiki Data: Data Diri Calon Santri</div>
				<div className="text-[10px] text-[var(--grey)] mt-0.5">Harap perbarui data diri Anda yang ditandai tidak valid.</div>
			</div>

			<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="form-group">
						<label className="control-label">Nama Lengkap</label>
						<input
							type="text"
							className={`form-control ${errors.fullName ? "is-invalid" : ""}`}
							{...register("fullName")}
						/>
						{errors.fullName && <span className="invalid-feedback">{errors.fullName.message}</span>}
					</div>

					<div className="form-group">
						<label className="control-label">Jenis Kelamin</label>
						<select className={`form-control ${errors.gender ? "is-invalid" : ""}`} {...register("gender")}>
							<option value="male">Laki-laki</option>
							<option value="female">Perempuan</option>
						</select>
						{errors.gender && <span className="invalid-feedback">{errors.gender.message}</span>}
					</div>

					<div className="form-group">
						<label className="control-label">Kewarganegaraan</label>
						<select
							className={`form-control ${errors.nationality ? "is-invalid" : ""}`}
							{...register("nationality")}
						>
							<option value="wni">Warga Negara Indonesia (WNI)</option>
							<option value="wna">Warga Negara Asing (WNA)</option>
						</select>
						{errors.nationality && <span className="invalid-feedback">{errors.nationality.message}</span>}
					</div>

					<div className="form-group">
						<label className="control-label">Nomor HP / WhatsApp</label>
						<input
							type="text"
							className={`form-control ${errors.phone ? "is-invalid" : ""}`}
							{...register("phone")}
						/>
						{errors.phone && <span className="invalid-feedback">{errors.phone.message}</span>}
					</div>

					<div className="form-group">
						<label className="control-label">Tempat Lahir</label>
						<input
							type="text"
							className={`form-control ${errors.placeOfBirth ? "is-invalid" : ""}`}
							{...register("placeOfBirth")}
						/>
						{errors.placeOfBirth && <span className="invalid-feedback">{errors.placeOfBirth.message}</span>}
					</div>

					<div className="form-group">
						<label className="control-label">Tanggal Lahir</label>
						<input
							type="date"
							className={`form-control ${errors.dateOfBirth ? "is-invalid" : ""}`}
							{...register("dateOfBirth")}
						/>
						{errors.dateOfBirth && <span className="invalid-feedback">{errors.dateOfBirth.message}</span>}
					</div>
				</div>

				<div className="flex flex-col gap-2">
					<label className="text-xs font-bold uppercase tracking-wider text-[var(--grey)]">
						Alamat Tinggal
					</label>
					<div className="form-group">
						<label className="control-label">Alamat Lengkap</label>
						<textarea
							rows={2}
							className={`form-control ${errors.address ? "is-invalid" : ""}`}
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

					<div className="grid grid-cols-3 gap-4">
						<div className="form-group">
							<label className="control-label">RT</label>
							<input type="text" className={`form-control ${errors.rt ? "is-invalid" : ""}`} {...register("rt")} />
							{errors.rt && <span className="invalid-feedback">{errors.rt.message}</span>}
						</div>
						<div className="form-group">
							<label className="control-label">RW</label>
							<input type="text" className={`form-control ${errors.rw ? "is-invalid" : ""}`} {...register("rw")} />
							{errors.rw && <span className="invalid-feedback">{errors.rw.message}</span>}
						</div>
						<div className="form-group">
							<label className="control-label">Kode Pos</label>
							<input
								type="text"
								className={`form-control ${errors.postalCode ? "is-invalid" : ""}`}
								{...register("postalCode")}
							/>
							{errors.postalCode && <span className="invalid-feedback">{errors.postalCode.message}</span>}
						</div>
					</div>
				</div>

				<div className="flex justify-between gap-4 mt-6 border-t border-slate-100 pt-4">
					<button
						type="button"
						onClick={() => navigate({ to: "/dashboard" })}
						className="roja_btn roja_btn-secondary"
					>
						Kembali ke Dashboard
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

export const Route = createFileRoute("/_member/invalid/personal")({
	component: InvalidPersonalStep,
})

export default InvalidPersonalStep
