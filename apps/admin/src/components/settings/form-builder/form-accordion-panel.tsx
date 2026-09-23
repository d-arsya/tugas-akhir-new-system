import type { JSX } from "react"

import type { SettingFormItem } from "@roja/types"

import {
	EditIcon,
	limitTitle,
	typeIconSrc,
} from "@/components/settings/form-builder/form-builder-icons"
import {
	PANEL_CLASS,
	PANEL_EDIT_BUTTON_CLASS,
	PANEL_ICON_CLASS,
	PANEL_TITLE_CLASS,
} from "@/components/settings/form-builder/form-panel"

type FormAccordionPanelProps = {
	item: SettingFormItem
	/** `SettingFormService::alpabhetIcon`: "" renders the hidden eye instead of a letter. */
	letter: string
	onEdit: () => void
}

// Port of `setting/includes/card-accordion.blade.php`.
// `.tbr_form_acc_panel` (app.css 2191-2196): grey background, 40px above, flattened when it opens a pane.
const FormAccordionPanel = ({ item, letter, onEdit }: FormAccordionPanelProps): JSX.Element => (
	<div className={`${PANEL_CLASS} mt-[40px] bg-[var(--bg-form-border)] first:mt-0`}>
		<div className="flex max-[992px]:mb-[12px]">
			<div className={`${PANEL_ICON_CLASS} mr-[8px]`}>
				<img src={typeIconSrc(item.type)} alt="accordion" width={24} height={24} />
			</div>
			<div className={`${PANEL_ICON_CLASS} font-semibold text-[var(--grey)]`}>
				{letter === "" ? (
					<img src="/assets/svg/icons/visibility_hidden.svg" alt="" width={24} height={24} />
				) : (
					letter
				)}
			</div>
		</div>

		<div id={`card-title-${item.id}`} className={PANEL_TITLE_CLASS}>
			<div className="font-semibold">{limitTitle(item.label)}</div>
		</div>

		{/* `.tbr_fp_single_actions` (app.css 2242-2248) — no toggles, just the edit button */}
		<div className="flex w-[210px] min-w-[210px] items-center justify-end max-[992px]:justify-center">
			<button
				type="button"
				onClick={(event) => {
					event.currentTarget.blur()
					onEdit()
				}}
				className={PANEL_EDIT_BUTTON_CLASS}
				aria-label="Edit keterangan"
			>
				<EditIcon />
			</button>
		</div>
	</div>
)

export default FormAccordionPanel
