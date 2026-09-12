import type { JSX, ChangeEvent } from "react"
import { useState } from "react"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { toast } from "sonner"
import { Upload, FileCheck } from "lucide-react"

export interface FileUploadFieldProps {
	label: string
	accept?: string
	maxSizeMb?: number
	description?: string
	onChange: (file: File) => void
	error?: string | undefined
	value?: File | string | null | undefined
	className?: string
}

export const FileUploadField = ({
	label,
	accept = "image/png, image/jpeg, application/pdf",
	maxSizeMb = 5,
	description,
	onChange,
	error,
	value,
	className = "",
}: FileUploadFieldProps): JSX.Element => {
	const [fileName, setFileName] = useState<string>(
		value instanceof File ? value.name : typeof value === "string" ? value : ""
	)

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
		const files = e.target.files
		if (files && files.length > 0) {
			const file = files[0]
			if (file) {
				if (file.size > maxSizeMb * 1024 * 1024) {
					toast.error("Ukuran Berkas Terlalu Besar", {
						description: `Ukuran berkas maksimal ${maxSizeMb}MB.`,
					})
					return
				}
				setFileName(file.name)
				onChange(file)
			}
		}
	}

	const fallbackDesc = `Format yang didukung: PDF, JPG, PNG. Maksimal ${maxSizeMb}MB.`

	return (
		<div className={`flex flex-col gap-2 ${className}`}>
			<Label>{label}</Label>
			<div className="flex flex-col gap-2 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
				<div className="flex items-center gap-4">
					<Button
						type="button"
						variant="outline"
						size="sm"
						asChild
						className="cursor-pointer font-semibold border-slate-300 hover:bg-slate-100"
					>
						<label className="flex items-center gap-2 cursor-pointer">
							<Upload className="w-4 h-4 text-slate-500" />
							<span>Pilih Berkas</span>
							<input
								type="file"
								accept={accept}
								onChange={handleFileChange}
								className="hidden"
							/>
						</label>
					</Button>
					<span className="text-xs text-slate-600 font-medium flex items-center gap-1.5 truncate">
						{fileName ? (
							<>
								<FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
								<span className="truncate">{fileName}</span>
							</>
						) : (
							<span className="text-slate-400 italic">Belum ada berkas terpilih</span>
						)}
					</span>
				</div>
				<span className="text-[10px] text-slate-400 font-medium">
					{description || fallbackDesc}
				</span>
				{error && <p className="text-xs text-destructive mt-0.5">{error}</p>}
			</div>
		</div>
	)
}

export default FileUploadField
