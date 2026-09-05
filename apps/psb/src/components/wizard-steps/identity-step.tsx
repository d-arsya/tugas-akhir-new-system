import type { JSX } from "react"
import { useEffect } from "react"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { identitySchema, type IdentityInput } from "@/schemas/register.schema"
import { psbApi } from "@/lib/api"
import useWizardStore from "@/stores/wizard.store"
import { useNavigate } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ChevronRight } from "lucide-react"
import { isFieldVisible, getFieldLabel, getFieldOptions, getOptionValue } from "@roja/utils"
import { SearchableSelect, Button, Input, Label, Textarea } from "@roja/ui"
import { toast } from "sonner"

export const IdentityStepContent = ({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }): JSX.Element => {
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
			toast.error(error instanceof Error ? error.message : "Sesi pendaftaran Anda telah berakhir.")
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
			toast.error(err instanceof Error ? err.message : "Sesi pendaftaran Anda telah berakhir.")
			navigate({ to: "/" })
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
							<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 15, "NIK (Nomor Induk Kependudukan)")}</Label>
							<Input
								type="text"
								maxLength={16}
								className=""
								placeholder="16 digit NIK"
								{...register("nik")}
							/>
						</div>
					)}

					{isFieldVisible(formSettings, 14) && (
						<div className="form-group mb-0">
							<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 14, "NISN (Nomor Induk Siswa Nasional)")}</Label>
							<Input
								type="text"
								className=""
								placeholder="10 digit NISN"
								{...register("nisn")}
							/>
						</div>
					)}

					{isFieldVisible(formSettings, 18) && (
						<div className="form-group mb-0">
							<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 18, "No. Ijazah / SKL")}</Label>
							<Input
								type="text"
								className=""
								placeholder="Nomor Ijazah Terakhir"
								{...register("certificateNumber")}
							/>
						</div>
					)}

					{isFieldVisible(formSettings, 16) && (
						<div className="form-group mb-0">
							<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 16, "No. KSP (Kartu Sejahtera)")}</Label>
							<Input
								type="text"
								className=""
								placeholder="Nomor KSP jika ada"
								{...register("ksp")}
							/>
						</div>
					)}

					{isFieldVisible(formSettings, 17) && (
						<div className="form-group mb-0">
							<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 17, "No. KIP (Kartu Indonesia Pintar)")}</Label>
							<Input
								type="text"
								className=""
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
										<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">Berat Badan (Kg)</Label>
										<Input
											type="number"
											className=""
											placeholder="Kg"
											{...register("weight")}
										/>
									</div>

									<div className="form-group mb-0">
										<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">Tinggi Badan (Cm)</Label>
										<Input
											type="number"
											className=""
											placeholder="Cm"
											{...register("height")}
										/>
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

						{isFieldVisible(formSettings, 28) && (
							<div className="flex flex-col gap-3 pt-2">
								<div className="flex justify-between items-center max-w-lg">
									<Label className="control-label mb-0">
										{getFieldLabel(formSettings, 28, "Riwayat Penyakit Pernah Diderita")}
									</Label>
									<Button
										type="button"
										onClick={() => append({ name: "", status: "sembuh" })}
										variant="roja-light-secondary"
										size="sm"
										className="text-[10px] h-8"
									>
										+ Tambah Penyakit
									</Button>
								</div>

								{fields.map((field, index) => (
									<div key={field.id} className="flex gap-3 items-center max-w-lg">
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
													triggerClassName="form-control w-48"
													options={[
														{ value: "sembuh", label: "Sembuh" },
														{ value: "masa perawatan", label: "Masa Perawatan" },
														{ value: "belum sembuh", label: "Belum Sembuh" }
													]}
												/>
											)}
										/>
										{fields.length > 1 && (
											<Button
												type="button"
												onClick={() => remove(index)}
												variant="roja-danger"
												size="sm"
												className="shrink-0 text-[10px] h-8"
											>
												Hapus
											</Button>
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
						<Textarea
							rows={2}
							className=""
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
									<Input
										type="text"
										className=""
										placeholder="Contoh: Jilid 4"
										{...register("jilidChapter")}
									/>
								</div>
							)}
						</div>

						{isFieldVisible(formSettings, 33) && (
							<div className="form-group mb-0">
								<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">{getFieldLabel(formSettings, 33, "Hafalan Al-Qur'an (Juz / Surat)")}</Label>
								<Textarea
									rows={2}
									className=""
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
						<Textarea
							rows={2}
							className=""
							placeholder="Seni, olahraga, pidato, kepemimpinan, dll."
							{...register("gift")}
						/>
					</div>
				</div>
			)}

			<div className="flex justify-between gap-4 mt-8 border-t border-[var(--bg-form-border)] pt-6">
				<Button
					type="button"
					onClick={onPrev}
					variant="outline"
				>
					Sebelumnya
				</Button>
				<Button
					type="submit"
					variant="roja-warning"
					disabled={mutation.isPending}
				>
					<span>{mutation.isPending ? "Menyimpan..." : "Lanjutkan"}</span>
					<ChevronRight className="w-5 h-5 ml-1" />
				</Button>
			</div>
		</form>
	)
}

export default IdentityStepContent
