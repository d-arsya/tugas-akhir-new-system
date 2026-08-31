import type { JSX } from "react"
import { useState } from "react"

type FileUploadFieldProps = {
	label: string
	accept?: string
	onChange: (fileName: string) => void
	error?: string | undefined
	value?: string | undefined
}

const FileUploadField = ({
	label,
	accept = "image/png, image/jpeg, application/pdf",
	onChange,
	error,
	value,
}: FileUploadFieldProps): JSX.Element => {
	const [fileName, setFileName] = useState<string>(value || "")

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const files = e.target.files
		if (files && files.length > 0) {
			const file = files[0]
			if (file) {
				if (file.size > 5 * 1024 * 1024) {
					alert("Ukuran berkas maksimal 5MB")
					return
				}
				setFileName(file.name)
				onChange(file.name)
			}
		}
	}

	return (
		<div className="form-group">
			<label className="control-label">{label}</label>
			<div className="flex flex-col gap-2">
				<div className="flex items-center gap-4">
					<label className="roja_btn roja_btn-secondary flex items-center justify-center cursor-pointer min-h-[40px] px-4 rounded-[6px] text-white">
						<span>Pilih Berkas</span>
						<input
							type="file"
							accept={accept}
							onChange={handleFileChange}
							className="hidden"
						/>
					</label>
					<span className="text-xs text-[var(--body-txt-inverse)]">
						{fileName ? `Terpilih: ${fileName}` : "Belum ada berkas terpilih"}
					</span>
				</div>
				<span className="text-[10px] text-[var(--grey)]">
					Format yang didukung: PDF, JPG, PNG. Maksimal 5MB.
				</span>
				{error && <span className="invalid-feedback">{error}</span>}
			</div>
		</div>
	)
}

export default FileUploadField
