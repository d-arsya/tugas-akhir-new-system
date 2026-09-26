import type { JSX } from "react"

import { cn } from "@roja/utils"

import LegacyRichEditor from "@/components/legacy/legacy-rich-editor/legacy-rich-editor"

import { FieldError, type SocietyLayout } from "./society-controls"

const EMPTY = "<p><br></p>"

type SocietyRichTextProps = {
	layout: SocietyLayout
	name: string
	label: string
	value: string
	onChange: (value: string) => void
	error: string | undefined
	disabled: boolean
}

const SocietyRichText = ({ layout, name, label, value, onChange, error, disabled }: SocietyRichTextProps): JSX.Element => (
	<div className="flex flex-wrap justify-center">
		<div id={name} className={cn("w-full", layout === "horizontal" && "min-[992px]:w-10/12")}>
			<div className={layout === "horizontal" ? "text-center" : "text-left"}>
				<p className="mt-0 mb-[8px] leading-[24px]">{label}</p>
			</div>
			<div className="mb-0">
				<div inert={disabled} className={cn(disabled && "[&_[role=textbox]]:bg-[var(--bg-editor-disabled,#ecedf0)]")}>
					<LegacyRichEditor
						value={value}
						height={120}
						onChange={(html) => onChange(layout === "horizontal" && html === EMPTY ? "" : html)}
					/>
				</div>
				<FieldError message={error} />
			</div>
		</div>
	</div>
)

export default SocietyRichText
