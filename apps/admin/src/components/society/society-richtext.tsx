import type { JSX } from "react"

import { cn } from "@roja/utils"

import LegacyRichEditor from "@/components/legacy/legacy-rich-editor/legacy-rich-editor"

import { FieldError, type SocietyLayout } from "./society-controls"

// Settings 30 / 35 — `textarea.summernote` under a `p.mb-2` label (`getInputLabel` of 29 / 34),
// `registrant/summernote.js` (`height: 120`). A disabled textarea is `summernote("disable")`:
// the editable turns `--bg-editor-disabled` (summernote.css 157-160) and nothing reacts.

/** Summernote's empty paragraph; the wizard's `submit-data.js` posts it as "". */
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
	// `div.row.no-gutters.justify-content-center > div.col-12` (edit) / `div.col-xl-10.col-lg-10.col-md-12` (wizard)
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
