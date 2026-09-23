import { useEffect, useRef, useState, type JSX } from "react"

import { cn } from "@roja/utils"

import { legacyButtonClass } from "./legacy-button"
import { legacyNotify } from "./legacy-notify"

// `.tbr_logo_preview` / `.tbr_favicon_preview` (public/assets/css/form.css 354-376).
// The shadow uses `--rgb-shadow-inverse: 171,180,190`, which the new globals.css sets to black
const PREVIEW = {
	logo: "h-[54px] w-[134px]",
	favicon: "h-[62px] w-[62px]",
} as const

type LegacyFileUploadProps = {
	id: string
	variant: "logo" | "favicon"
	previewUrl: string | null
	accept: string
	maxKb: number
	sizeErrorText: string
	buttonLabel?: string
	onChange: (file: File | null) => void
}

const LegacyFileUpload = ({
	id,
	variant,
	previewUrl,
	accept,
	maxKb,
	sizeErrorText,
	buttonLabel = "Upload",
	onChange,
}: LegacyFileUploadProps): JSX.Element => {
	const [dataUrl, setDataUrl] = useState<string | null>(null)
	const [faded, setFaded] = useState(true)
	const reader = useRef<FileReader | null>(null)

	useEffect(() => () => reader.current?.abort(), [])

	const pick = (file: File | null): void => {
		onChange(file)
		if (file === null) {
			setDataUrl(null)
			return
		}
		// `checkFileSize()`: the legacy threshold is `maxKb / 1000` MB, so 500 kB really means 0.5 MB.
		// It never clears the input — the file still goes up and the server rejects it
		if (file.size / 1024 / 1024 > maxKb / 1000) legacyNotify.error(sizeErrorText)

		const fileReader = new FileReader()
		reader.current = fileReader
		fileReader.onload = () => {
			setDataUrl(typeof fileReader.result === "string" ? fileReader.result : null)
			setFaded(false)
			requestAnimationFrame(() => setFaded(true))
		}
		fileReader.readAsDataURL(file)
	}

	const url = dataUrl ?? previewUrl

	return (
		<div>
			{url !== null ? (
				<div
					style={{ backgroundImage: `url(${url})`, opacity: faded ? 1 : 0 }}
					className={cn(
						// `.hide().fadeIn(650)` in `setting/upload-logo-school.js`
						"mb-[10px] rounded-[6px] bg-[var(--bg-inverse)] bg-contain bg-left bg-no-repeat shadow-[0px_8px_10px_0px_rgba(171,180,190,0.25)] transition-opacity duration-[650ms]",
						PREVIEW[variant],
					)}
				/>
			) : null}
			{/* `.tbr_form_upload > input.d-none + label.btn.tbr_btn.tbr_btn-secondary` */}
			<div>
				<input
					type="file"
					id={id}
					accept={accept}
					className="hidden"
					onChange={(event) => pick(event.target.files?.[0] ?? null)}
				/>
				{/* Bootstrap reboot gives every label `margin-bottom: .5rem`, which makes the row 48px tall */}
				<label htmlFor={id} className={legacyButtonClass("secondary", "mb-[8px]")}>
					{buttonLabel}
				</label>
			</div>
		</div>
	)
}

export default LegacyFileUpload
