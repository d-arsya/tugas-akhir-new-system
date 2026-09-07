import type { JSX } from "react"
import { Controller, type Control, type UseFormRegister, type UseFieldArrayRemove } from "react-hook-form"
import type { IdentityInput } from "@/schemas/register.schema"
import { isFieldVisible, getFieldLabel, getFieldOptions, getOptionValue } from "@roja/utils"
import { SearchableSelect, Button, Input, Label } from "@roja/ui"

export interface HealthDataFieldsProps {
	control: Control<IdentityInput>
	register: UseFormRegister<IdentityInput>
	fields: Record<string, any>[]
	append: (val: { name: string; status: string }) => void
	remove: UseFieldArrayRemove
	formSettings?: any
}

export const HealthDataFields = ({
	control,
	register,
	fields,
	append,
	remove,
	formSettings,
}: HealthDataFieldsProps): JSX.Element | null => {
	if (!isFieldVisible(formSettings, 22)) return null

	return (
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
									placeholder="Kg"
									{...register("weight")}
								/>
							</div>

							<div className="form-group mb-0">
								<Label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 inline-block">Tinggi Badan (Cm)</Label>
								<Input
									type="number"
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
	)
}

export default HealthDataFields
