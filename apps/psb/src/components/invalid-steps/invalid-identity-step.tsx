import type { JSX } from "react"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { identitySchema, type IdentityInput } from "@/schemas/register.schema"
import { psbApi } from "@/lib/api"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ChevronRight } from "lucide-react"
import { isFieldVisible, getFieldLabel, getFieldOptions, getOptionValue } from "@roja/utils"
import { SearchableSelect, Input, Label, Textarea } from "@roja/ui"

export const InvalidIdentityStepContent = ({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }): JSX.Element => {
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
								className={errors.nik ? "border-destructive focus-visible:ring-destructive" : ""}
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
								className={errors.nisn ? "border-destructive focus-visible:ring-destructive" : ""}
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

export default InvalidIdentityStepContent
