import type { JSX } from "react"
import type { UseFormRegister } from "react-hook-form"
import type { IdentityInput } from "@/schemas/register.schema"
import { isFieldVisible, getFieldLabel, getFieldOptions, getOptionValue } from "@roja/utils"
import { Input, Label, Textarea } from "@roja/ui"

export interface AchievementAndTalentFieldsProps {
	register: UseFormRegister<IdentityInput>
	watchReading?: string
	formSettings?: any
}

export const AchievementAndTalentFields = ({
	register,
	watchReading,
	formSettings,
}: AchievementAndTalentFieldsProps): JSX.Element => {
	return (
		<>
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
							placeholder="Seni, olahraga, pidato, kepemimpinan, dll."
							{...register("gift")}
						/>
					</div>
				</div>
			)}
		</>
	)
}

export default AchievementAndTalentFields
