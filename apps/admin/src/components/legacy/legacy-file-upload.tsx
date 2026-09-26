import { useEffect, useRef, useState, type JSX } from "react"

import { cn } from "@roja/utils"

import { legacyButtonClass } from "./legacy-button"
import { legacyNotify } from "./legacy-notify"

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
		// maxKb / 1000 (not 1024) and no early return are deliberate: the server rejects oversized files
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
						"mb-[10px] rounded-[6px] bg-[var(--bg-inverse)] bg-contain bg-left bg-no-repeat shadow-[0px_8px_10px_0px_rgba(171,180,190,0.25)] transition-opacity duration-[650ms]",
						PREVIEW[variant],
					)}
				/>
			) : null}
			<div>
				<input
					type="file"
					id={id}
					accept={accept}
					className="hidden"
					onChange={(event) => pick(event.target.files?.[0] ?? null)}
				/>
				<label htmlFor={id} className={legacyButtonClass("secondary", "mb-[8px]")}>
					{buttonLabel}
				</label>
			</div>
		</div>
	)
}

export default LegacyFileUpload
