import type { JSX } from "react"
import { useState } from "react"
import { Button, Label } from "@roja/ui"
import { toast } from "sonner"
import { Upload, FileCheck } from "lucide-react"

type FileUploadFieldProps = {
	label: string
	accept?: string
	onChange: (file: File) => void
	error?: string | undefined
	value?: any
}

const FileUploadField = ({
	label,
	accept = "image/png, image/jpeg, application/pdf",
	onChange,
	error,
	value,
}: FileUploadFieldProps): JSX.Element => {
	const [fileName, setFileName] = useState<string>(
		value instanceof File ? value.name : typeof value === "string" ? value : ""
	)

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const files = e.target.files
		if (files && files.length > 0) {
			const file = files[0]
			if (file) {
				if (file.size > 5 * 1024 * 1024) {
					toast.error("Ukuran berkas maksimal 5MB")
					return
				}
				setFileName(file.name)
				onChange(file)
			}
		}
	}

	return (
		<div className="flex flex-col gap-2">
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
						<label className="flex items-center gap-2">
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
					Format yang didukung: PDF, JPG, PNG. Maksimal 5MB.
				</span>
				{error && <p className="text-xs text-destructive mt-0.5">{error}</p>}
			</div>
		</div>
	)
}

export default FileUploadField
