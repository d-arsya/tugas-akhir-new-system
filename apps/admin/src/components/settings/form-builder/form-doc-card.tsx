import type { JSX } from "react"

import type { SettingFormType } from "@roja/types"

import LegacyCard, { LegacyCardText, LegacyCardTitle } from "@/components/legacy/legacy-card"
import { typeIconSrc } from "@/components/settings/form-builder/form-builder-icons"

// The 12 legend tiles of `setting/form.blade.php`, in the legacy order
const DOC_TYPES: { type: SettingFormType; label: string }[] = [
	{ type: "paragraph", label: "Paragraph" },
	{ type: "basic input", label: "Basic Input" },
	{ type: "input number", label: "Input Number" },
	{ type: "radio button", label: "Radio Button" },
	{ type: "checkbox", label: "Checkbox" },
	{ type: "datepicker", label: "Datepicker" },
	{ type: "combo box", label: "Combo Box" },
	{ type: "address group", label: "Address Group" },
	{ type: "location group", label: "Location Group" },
	{ type: "upload", label: "Upload" },
	{ type: "texteditor", label: "Texteditor" },
	{ type: "accordion label", label: "Accordion Label" },
]

// `.tbr_doc_list .tbr_list_item` (app.css 2150-2171)
const TILE_CLASS =
	"relative m-[4px_2px] inline-flex h-[62px] w-[132px] flex-col items-center justify-center rounded-[10px] bg-[var(--bg-form-border)] text-center"

// Port of the right-hand "Dokumentasi" card of `setting/form.blade.php`.
// This page writes a bare `.card-body`, so the padding is bootstrap's 1.25rem, not the kit's 24px.
const FormDocCard = (): JSX.Element => (
	<LegacyCard bodyClassName="p-[20px]">
		{/* `h4.tbr_card_sm_title.mb-0` (app.css 495-498) */}
		<LegacyCardTitle className="mb-0! text-[18px]!">Dokumentasi</LegacyCardTitle>
		<LegacyCardText>Keterangan attribute form</LegacyCardText>
		<div>
			{DOC_TYPES.map((entry) => (
				<div key={entry.type} className={TILE_CLASS}>
					<img src={typeIconSrc(entry.type)} alt={entry.label} width={24} height={24} />
					<span className="text-[var(--grey)]">{entry.label}</span>
				</div>
			))}
		</div>
	</LegacyCard>
)

export default FormDocCard
