import type { JSX } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { identitySchema, type IdentityInput } from "@/schemas/register.schema"
import { psbApi } from "@/lib/api"
import useWizardStore from "@/stores/wizard.store"
import { useNavigate, createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useFieldArray } from "react-hook-form"
import { ChevronRight } from "lucide-react"
import { isFieldVisible, getFieldLabel, getFieldOptions } from "@roja/utils"

const IdentityStep = (): JSX.Element => {
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const sessionId = useWizardStore((s) => s.sessionId) || ""

	const { data: landingData } = useQuery({
		queryKey: ["landingInfo"],
		queryFn: () => psbApi.getLanding(),
	})
	const formSettings = landingData?.formSettings

	const { data: initialData, isLoading } = useQuery({
		queryKey: ["wizardStep", "identity", sessionId],
		queryFn: () => psbApi.getWizardStep("identity", sessionId),
		enabled: !!sessionId,
	})

	const mutation = useMutation({
		mutationFn: (data: IdentityInput) => psbApi.saveWizardStep("identity", sessionId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["wizardStep", "identity", sessionId] })
			navigate({ to: "/register/family" })
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
			weight: 0,
			height: 0,
			bloodType: "a",
			diseaseHistories: [{ name: "", status: "sembuh" }],
			visualCondition: "normal",
			hearingCondition: "normal",
			immunizationGiven: "complete",
			learningAchievment: "",
			diniyyahAchievment: "",
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
			{/* Section A: Data Kesehatan */}
			{isFieldVisible(formSettings, 22) && (
				<div>
					<div className="border-l-4 border-l-[var(--primary)] pl-4 py-1 mb-6">
						<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">
							{getFieldLabel(formSettings, 22, "A. Data Kesehatan Calon Santri")}
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
										{getFieldOptions(formSettings, 24).length > 0 ? (
											getFieldOptions(formSettings, 24).map((opt) => (
												<option key={opt} value={opt.toLowerCase()}>
													{opt}
												</option>
											))
										) : (
											<>
												<option value="a">A</option>
												<option value="ab">AB</option>
												<option value="b">B</option>
												<option value="o">O</option>
											</>
										)}
									</select>
								</div>
							)}
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-6">
							{isFieldVisible(formSettings, 25) && (
								<div className="form-group mb-0">
									<label className="control-label">{getFieldLabel(formSettings, 25, "Kondisi Penglihatan")}</label>
									<select className="form-control" {...register("visualCondition")}>
										{getFieldOptions(formSettings, 25).length > 0 ? (
											getFieldOptions(formSettings, 25).map((opt) => (
												<option key={opt} value={opt === "Normal" ? "normal" : "abnormal"}>
													{opt}
												</option>
											))
										) : (
											<>
												<option value="normal">Normal</option>
												<option value="abnormal">Tidak Normal / Berkacamata</option>
											</>
										)}
									</select>
								</div>
							)}

							{isFieldVisible(formSettings, 26) && (
								<div className="form-group mb-0">
									<label className="control-label">{getFieldLabel(formSettings, 26, "Kondisi Pendengaran")}</label>
									<select className="form-control" {...register("hearingCondition")}>
										{getFieldOptions(formSettings, 26).length > 0 ? (
											getFieldOptions(formSettings, 26).map((opt) => (
												<option key={opt} value={opt === "Normal" ? "normal" : "abnormal"}>
													{opt}
												</option>
											))
										) : (
											<>
												<option value="normal">Normal</option>
												<option value="abnormal">Kurang Peka Suara</option>
											</>
										)}
									</select>
								</div>
							)}

							{isFieldVisible(formSettings, 27) && (
								<div className="form-group mb-0">
									<label className="control-label">{getFieldLabel(formSettings, 27, "Imunisasi yang Diterima")}</label>
									<select className="form-control" {...register("immunizationGiven")}>
										{getFieldOptions(formSettings, 27).length > 0 ? (
											getFieldOptions(formSettings, 27).map((opt) => (
												<option
													key={opt}
													value={opt === "Lengkap" ? "complete" : opt === "Tidak Lengkap" ? "incomplete" : "not_at_all"}
												>
													{opt}
												</option>
											))
										) : (
											<>
												<option value="complete">Lengkap</option>
												<option value="incomplete">Tidak Lengkap</option>
												<option value="not_at_all">Tidak Imunisasi</option>
											</>
										)}
									</select>
								</div>
							)}
						</div>

						{/* Disease Histories Dynamic Array */}
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

			{/* Section B: Prestasi Belajar */}
			{isFieldVisible(formSettings, 29) && isFieldVisible(formSettings, 30) && (
				<div>
					<div className="border-l-4 border-l-[var(--primary)] pl-4 py-1 mb-6">
						<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">
							{getFieldLabel(formSettings, 29, "B. Prestasi Belajar yang Pernah Diraih")}
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

			{/* Section C: Prestasi Diniyyah */}
			{isFieldVisible(formSettings, 31) && (
				<div>
					<div className="border-l-4 border-l-[var(--primary)] pl-4 py-1 mb-6">
						<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">
							{getFieldLabel(formSettings, 31, "C. Prestasi Diniyyah & Kemampuan Al-Qur'an")}
						</div>
					</div>
					<div className="flex flex-col gap-5">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6">
							{isFieldVisible(formSettings, 32) && (
								<div className="form-group mb-0">
									<label className="control-label">{getFieldLabel(formSettings, 32, "Kemampuan Membaca")}</label>
									<select className="form-control" {...register("reading")}>
										<option value="quran">Baca Al-Qur'an</option>
										<option value="jilid">Jilid / Iqra</option>
									</select>
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

			{/* Section D: Bakat & Potensi */}
			{isFieldVisible(formSettings, 34) && isFieldVisible(formSettings, 35) && (
				<div>
					<div className="border-l-4 border-l-[var(--primary)] pl-4 py-1 mb-6">
						<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">
							{getFieldLabel(formSettings, 34, "D. Bakat / Potensi yang Dimiliki")}
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
					onClick={() => navigate({ to: "/register/personal" })}
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

export const Route = createFileRoute("/_wizard/register/identity")({
	component: IdentityStep,
})

export default IdentityStep
