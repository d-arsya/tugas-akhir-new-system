import type { JSX } from "react"
import type { UseFormRegister } from "react-hook-form"
import type { IdentityInput } from "@/schemas/register.schema"
import { isFieldVisible, getFieldLabel } from "@roja/utils"
import { Input, Label } from "@roja/ui"

export interface IdentityNumbersFieldsProps {
	register: UseFormRegister<IdentityInput>
	formSettings?: any
}

export const IdentityNumbersFields = ({
	register,
	formSettings,
}: IdentityNumbersFieldsProps): JSX.Element => {
	return (
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
							placeholder="Nomor KIP jika ada"
							{...register("kip")}
						/>
					</div>
				)}
			</div>
		</div>
	)
}

export default IdentityNumbersFields
