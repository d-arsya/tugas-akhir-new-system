import type { JSX } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { familySchema, type FamilyInput } from "@/schemas/register.schema"
import { psbApi } from "@/lib/api"
import { useNavigate, createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

const InvalidFamilyStep = (): JSX.Element => {
	const navigate = useNavigate()
	const queryClient = useQueryClient()

	const { data: initialData, isLoading } = useQuery({
		queryKey: ["invalidData"],
		queryFn: () => psbApi.getInvalidData(),
	})

	const mutation = useMutation({
		mutationFn: (data: FamilyInput) => psbApi.updateInvalidStep("family", data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["invalidData"] })
			navigate({ to: "/invalid/guardian" })
		},
	})

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FamilyInput>({
		resolver: zodResolver(familySchema) as unknown as import("react-hook-form").Resolver<FamilyInput>,
		values: (initialData ? (initialData as Record<string, unknown>).family : {}) as FamilyInput,
		defaultValues: {
			fatherName: "",
			fatherOccupation: "",
			fatherIncome: 0,
			motherName: "",
			motherOccupation: "",
			motherIncome: 0,
			numberOfSiblings: 0,
			childOrder: 1,
			familyStatus: "complete",
		},
	})

	const onSubmit = (data: FamilyInput): void => {
		mutation.mutate(data)
	}

	if (isLoading) {
		return <div className="text-center py-10 text-xs">Memuat data...</div>
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="border-l-4 border-l-[var(--primary)] pl-4 py-1 mb-2">
				<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">Perbaiki Data: Data Keluarga</div>
				<div className="text-[10px] text-[var(--grey)] mt-0.5">Harap perbarui latar belakang keluarga Anda.</div>
			</div>

			<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
				<div className="flex flex-col gap-4">
					<label className="text-xs font-bold uppercase tracking-wider text-[var(--grey)]">
						Data Ayah Kandung
					</label>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="form-group">
							<label className="control-label">Nama Lengkap Ayah</label>
							<input
								type="text"
								className={`form-control ${errors.fatherName ? "is-invalid" : ""}`}
								{...register("fatherName")}
							/>
							{errors.fatherName && <span className="invalid-feedback">{errors.fatherName.message}</span>}
						</div>
						<div className="form-group">
							<label className="control-label">Pekerjaan Ayah</label>
							<input
								type="text"
								className={`form-control ${errors.fatherOccupation ? "is-invalid" : ""}`}
								{...register("fatherOccupation")}
							/>
							{errors.fatherOccupation && (
								<span className="invalid-feedback">{errors.fatherOccupation.message}</span>
							)}
						</div>
						<div className="form-group">
							<label className="control-label">Penghasilan Bulanan Ayah</label>
							<input
								type="number"
								className={`form-control ${errors.fatherIncome ? "is-invalid" : ""}`}
								{...register("fatherIncome")}
							/>
							{errors.fatherIncome && <span className="invalid-feedback">{errors.fatherIncome.message}</span>}
						</div>
					</div>
				</div>

				<div className="flex flex-col gap-4 border-t border-[var(--bg-form-border)] pt-4">
					<label className="text-xs font-bold uppercase tracking-wider text-[var(--grey)]">
						Data Ibu Kandung
					</label>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="form-group">
							<label className="control-label">Nama Lengkap Ibu</label>
							<input
								type="text"
								className={`form-control ${errors.motherName ? "is-invalid" : ""}`}
								{...register("motherName")}
							/>
							{errors.motherName && <span className="invalid-feedback">{errors.motherName.message}</span>}
						</div>
						<div className="form-group">
							<label className="control-label">Pekerjaan Ibu</label>
							<input
								type="text"
								className={`form-control ${errors.motherOccupation ? "is-invalid" : ""}`}
								{...register("motherOccupation")}
							/>
							{errors.motherOccupation && (
								<span className="invalid-feedback">{errors.motherOccupation.message}</span>
							)}
						</div>
						<div className="form-group">
							<label className="control-label">Penghasilan Bulanan Ibu</label>
							<input
								type="number"
								className={`form-control ${errors.motherIncome ? "is-invalid" : ""}`}
								{...register("motherIncome")}
							/>
							{errors.motherIncome && <span className="invalid-feedback">{errors.motherIncome.message}</span>}
						</div>
					</div>
				</div>

				<div className="flex justify-between gap-4 mt-6 border-t border-slate-100 pt-4">
					<button
						type="button"
						onClick={() => navigate({ to: "/invalid/identity" })}
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

export const Route = createFileRoute("/_member/invalid/family")({
	component: InvalidFamilyStep,
})

export default InvalidFamilyStep
