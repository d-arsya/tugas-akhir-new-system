import { useEffect, useRef, useState, type JSX, type ReactNode } from "react"

import { SOCIETY_ATTACHMENT_RULES, cn } from "@roja/utils"

import LegacyTooltip from "@/components/legacy/legacy-tooltip"

import { FieldError, StackedLabel, type SocietyLayout } from "./society-controls"

const MAX_UPLOAD_MB = 2

const lastSegment = (url: string): string => url.split("?")[0]?.split("/").pop() ?? url

type PreviewLinkProps = { url: string | null; download: boolean; tip: string; icon: string; alt: string; className?: string }

const PreviewLink = ({ url, download, tip, icon, alt, className }: PreviewLinkProps): JSX.Element => {
	const image = <img src={icon} alt={alt} />
	return (
		<LegacyTooltip content={tip} {...(className === undefined ? {} : { className })}>
			{url !== null ? (
				<a href={url} {...(download ? { target: "_self", download: "" } : { target: "_blank", rel: "noreferrer" })}>
					{image}
				</a>
			) : (
				<span>{image}</span>
			)}
		</LegacyTooltip>
	)
}

type SocietyAttachmentInputProps = {
	layout: SocietyLayout
	name: string
	label: string
	info: "required" | "optional"
	photoHint: boolean
	url: string | null
	file: File | undefined
	onFileChange: (name: string, file: File | null) => void
	error: string | undefined
	disabled: boolean
}

const SocietyAttachmentInput = ({ layout, name, label, info, photoHint, url, file, onFileChange, error, disabled }: SocietyAttachmentInputProps): JSX.Element => {
	const input = useRef<HTMLInputElement>(null)
	const [caption, setCaption] = useState<string>(() => (layout === "stacked" && url !== null ? lastSegment(url) : SOCIETY_ATTACHMENT_RULES.emptyLabel))
	const [sizeError, setSizeError] = useState(false)
	const timer = useRef<number | undefined>(undefined)

	useEffect(() => () => window.clearTimeout(timer.current), [])
	useEffect(() => {
		if (file === undefined && layout === "stacked") setCaption(url !== null ? lastSegment(url) : SOCIETY_ATTACHMENT_RULES.emptyLabel)
	}, [url, file, layout])

	const pick = (picked: File | null): void => {
		if (picked === null) return
		setCaption(picked.name)
		if (picked.size / 1024 / 1024 > MAX_UPLOAD_MB) {
			if (input.current !== null) input.current.value = ""
			setSizeError(true)
			onFileChange(name, null)
			timer.current = window.setTimeout(() => setCaption("Choose File"), 500)
			return
		}
		setSizeError(false)
		onFileChange(name, picked)
	}

	const message = sizeError ? SOCIETY_ATTACHMENT_RULES.tooLargeMessage : error

	const control: ReactNode = (
		<div className="relative flex w-full flex-wrap items-stretch">
			<div className="relative mb-0 flex min-h-[40px] w-[1%] min-w-0 flex-auto items-center">
				<input
					ref={input}
					type="file"
					accept={SOCIETY_ATTACHMENT_RULES.accept}
					name={name}
					id={name}
					disabled={disabled}
					onChange={(event) => pick(event.target.files?.[0] ?? null)}
					className="relative z-[2] m-0 min-h-[40px] w-full cursor-pointer opacity-0 disabled:cursor-default"
				/>
				<label
					htmlFor={name}
					className={cn(
						"absolute top-0 right-0 left-0 z-[1] m-0 flex min-h-[40px] w-[92%] items-center justify-start overflow-hidden rounded-[4px] border-0 bg-transparent py-[6px] pr-[12px] pl-[100px] leading-[1.5] font-normal text-ellipsis whitespace-nowrap text-[var(--body-txt-inverse)]",
						disabled && "pointer-events-none opacity-50",
					)}
				>
					<span
						aria-hidden="true"
						className="absolute top-0 bottom-0 left-0 z-[3] flex min-h-[40px] items-center justify-center rounded-[6px] bg-[var(--secondary)] px-[16px] text-[12px] tracking-[0.5px] text-white"
					>
						Upload
					</span>
					<span className="overflow-hidden text-ellipsis whitespace-nowrap">{file?.name ?? caption}</span>
				</label>
			</div>
			{layout === "stacked" ? (
				<div className="flex items-center justify-center">
					<PreviewLink url={url} download tip="Lihat lampiran sebelumnya dengan cara mendownload." icon="/assets/svg/icons/preview_download.svg" alt="Download" className="mr-[8px]" />
					<PreviewLink url={url} download={false} tip="Lihat lampiran sebelumnya pada tab baru." icon="/assets/svg/icons/preview_new_tab.svg" alt="New Tab" />
				</div>
			) : null}
		</div>
	)

	const hint = (
		<p className="mt-[8px] mb-[4px] text-[var(--grey)] italic">
			{SOCIETY_ATTACHMENT_RULES.hint}
			{photoHint ? (
				<>
					{" "}
					Foto yang diupload harus dengan ukuran 3 x 4 cm
				</>
			) : null}
		</p>
	)

	if (layout === "horizontal") {
		return (
			<div className="mx-[-15px] mb-[16px] flex flex-wrap">
				<label htmlFor={name} className="relative m-0 w-full px-[15px] leading-[20px] min-[992px]:w-1/3 min-[992px]:text-right">
					{label}
					<span className="block text-[11px] text-[var(--grey)]">{info}</span>
				</label>
				<div className="relative w-full px-[15px] min-[992px]:w-2/3">
					{control}
					<FieldError message={message} />
					{hint}
				</div>
			</div>
		)
	}

	return (
		<div className="mb-[16px] border-b border-[var(--bg-quaternary)]! pb-[8px] last:border-b-0 last:pb-0">
			<StackedLabel htmlFor={name} label={label} info={info} className="mb-[8px]" />
			{control}
			<FieldError message={message} className="m-0" />
			{hint}
		</div>
	)
}

export default SocietyAttachmentInput
