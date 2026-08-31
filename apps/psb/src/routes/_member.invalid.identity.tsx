import type { JSX } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { identitySchema, type IdentityInput } from "@/schemas/register.schema"
import { psbApi } from "@/lib/api"
import { useNavigate, createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

const InvalidIdentityStep = (): JSX.Element => {
	const navigate = useNavigate()
	const queryClient = useQueryClient()

	const { data: initialData, isLoading } = useQuery({
		queryKey: ["invalidData"],
		queryFn: () => psbApi.getInvalidData(),
	})

	const mutation = useMutation({
		mutationFn: (data: IdentityInput) => psbApi.updateInvalidStep("identity", data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["invalidData"] })
			navigate({ to: "/invalid/family" })
		},
	})

	const {
		register,
		handleSubmit,
		control,
		watch,
	} = useForm<IdentityInput>({
		resolver: zodResolver(identitySchema) as unknown as import("react-hook-form").Resolver<IdentityInput>,
		values: (initialData ? (initialData as Record<string, unknown>).identity : {}) as IdentityInput,
		defaultValues: {
			weight: undefined,
			height: undefined,
			bloodType: "o",
			visualCondition: "normal",
			hearingCondition: "normal",
			immunizationGiven: "complete",
			diseaseHistories: [{ name: "", status: "sembuh" }],
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
		<div className="flex flex-col gap-6">
			<div className="border-l-4 border-l-[var(--primary)] pl-4 py-1 mb-2">
				<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">Perbaiki Data: Identitas & Riwayat Kesehatan</div>
				<div className="text-[10px] text-[var(--grey)] mt-0.5">Harap perbarui data kesehatan, prestasi, atau Al-Qur'an Anda.</div>
			</div>

			<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
				{/* Section A: Data Kesehatan */}
				<div className="roja_card">
					<div className="card-header">
						<span className="font-bold text-sm">A. Data Kesehatan Kamu</span>
					</div>
					<div className="card-body flex flex-col gap-4">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="form-group">
								<label className="control-label">Berat Badan (Kg)</label>
								<input type="number" className="form-control" placeholder="Kg" {...register("weight")} />
							</div>

							<div className="form-group">
								<label className="control-label">Tinggi Badan (Cm)</label>
								<input type="number" className="form-control" placeholder="Cm" {...register("height")} />
							</div>

							<div className="form-group">
								<label className="control-label">Golongan Darah</label>
								<select className="form-control" {...register("bloodType")}>
									<option value="a">A</option>
									<option value="ab">AB</option>
									<option value="b">B</option>
									<option value="o">O</option>
								</select>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="form-group">
								<label className="control-label">Kondisi Penglihatan</label>
								<select className="form-control" {...register("visualCondition")}>
									<option value="normal">Normal</option>
									<option value="abnormal">Tidak Normal / Berkacamata</option>
								</select>
							</div>

							<div className="form-group">
								<label className="control-label">Kondisi Pendengaran</label>
								<select className="form-control" {...register("hearingCondition")}>
									<option value="normal">Normal</option>
									<option value="abnormal">Kurang Peka Suara</option>
								</select>
							</div>

							<div className="form-group">
								<label className="control-label">Imunisasi yang Diterima</label>
								<select className="form-control" {...register("immunizationGiven")}>
									<option value="complete">Lengkap</option>
									<option value="incomplete">Tidak Lengkap</option>
									<option value="not_at_all">Tidak Imunisasi</option>
								</select>
							</div>
						</div>

						{/* Disease Histories Dynamic Array */}
						<div className="flex flex-col gap-3 pt-2">
							<div className="flex justify-between items-center">
								<label className="text-xs font-bold uppercase tracking-wider text-[var(--grey)]">
									Riwayat Penyakit Pernah Diderita
								</label>
								<button
									type="button"
									onClick={() => append({ name: "", status: "sembuh" })}
									className="roja_btn roja_btn-sm roja_btn-light-secondary"
								>
									+ Tambah Penyakit
								</button>
							</div>

							{fields.map((field, index) => (
								<div key={field.id} className="flex gap-2 items-center">
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
											className="roja_btn roja_btn-sm roja_btn-danger"
										>
											Hapus
										</button>
									)}
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Section B: Prestasi Belajar */}
				<div className="roja_card">
					<div className="card-header">
						<span className="font-bold text-sm">B. Prestasi Belajar yang Pernah Kamu Raih</span>
					</div>
					<div className="card-body">
						<div className="form-group mb-0">
							<textarea
								rows={3}
								className="form-control"
								placeholder="Tuliskan kejuaraan atau prestasi belajar yang pernah didapat"
								{...register("learningAchievment")}
							/>
						</div>
					</div>
				</div>

				{/* Section C: Prestasi Diniyyah */}
				<div className="roja_card">
					<div className="card-header">
						<span className="font-bold text-sm">C. Prestasi Diniyyah & Kemampuan Al-Qur'an</span>
					</div>
					<div className="card-body flex flex-col gap-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="form-group">
								<label className="control-label">Kemampuan Membaca</label>
								<select className="form-control" {...register("reading")}>
									<option value="quran">Baca Al-Qur'an</option>
									<option value="jilid">Jilid / Iqra</option>
								</select>
							</div>

							{watchReading === "jilid" && (
								<div className="form-group">
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

						<div className="form-group mb-0">
							<label className="control-label">Hafalan Al-Qur'an (Juz / Surat)</label>
							<textarea
								rows={2}
								className="form-control"
								placeholder="Contoh: Juz 30, Surat Al-Waqi'ah s.d. An-Naas"
								{...register("quranMemorizing")}
							/>
						</div>
					</div>
				</div>

				{/* Section D: Bakat & Potensi */}
				<div className="roja_card">
					<div className="card-header">
						<span className="font-bold text-sm">D. Bakat / Potensi yang Dimiliki</span>
					</div>
					<div className="card-body">
						<div className="form-group mb-0">
							<textarea
								rows={3}
								className="form-control"
								placeholder="Seni, olahraga, pidato, kepemimpinan, dll."
								{...register("gift")}
							/>
						</div>
					</div>
				</div>

				<div className="flex justify-between gap-4 mt-6 border-t border-slate-100 pt-4">
					<button
						type="button"
						onClick={() => navigate({ to: "/invalid/personal" })}
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

export const Route = createFileRoute("/_member/invalid/identity")({
	component: InvalidIdentityStep,
})

export default InvalidIdentityStep
