import type { JSX } from "react"

import type { SettingFormItem, SettingFormPatch } from "@roja/types"

import LegacySwitch from "@/components/legacy/legacy-switch"
import {
	HelperIcon,
	RequiredAsterisk,
	limitTitle,
	typeIconSrc,
} from "@/components/settings/form-builder/form-builder-icons"
import FormEditButton from "@/components/settings/form-builder/form-edit-button"
import FormPanelTooltip from "@/components/settings/form-builder/form-panel-tooltip"

type FormPanelProps = {
	item: SettingFormItem
	onPatch: (data: SettingFormPatch) => void
	onEdit: () => void
}

export const PANEL_CLASS =
	"relative mb-[12px] flex w-full min-h-[57px] items-center justify-between overflow-hidden rounded-[10px] py-[8px] pr-[12px] pl-[8px] max-[992px]:flex-col max-[992px]:py-[10px]"

export const PANEL_ICON_CLASS =
	"flex h-[40px] w-[40px] max-w-[40px] min-w-[40px] items-center justify-center rounded-[40px] bg-[var(--bg-inverse)]"

export const PANEL_TITLE_CLASS = "flex-1 px-[24px] max-[992px]:mb-[12px] max-[992px]:text-center"

const VISIBILITY_ON_TITLE = "Klik menjadi putih jika tidak ingin ditampilkan di halaman PSB"
const VISIBILITY_OFF_TITLE = "Klik menjadi hijau jika ingin ditampilkan di halaman PSB"

const LAYER_CLASS =
	"pointer-events-none absolute top-0 left-0 block h-[36px] w-[36px] rounded-[6px] bg-auto bg-center bg-no-repeat transition-all duration-300"
const LAYER_HIDDEN = "invisible scale-0 opacity-0"
const LAYER_SHOWN = "visible scale-100 opacity-100"

type RequiredFlagProps = { label: string; required: boolean; className?: string }

const RequiredFlag = ({ label, required, className }: RequiredFlagProps): JSX.Element => (
	<span className={className}>
		{label}{" "}
		<RequiredAsterisk required={required} />
	</span>
)

const FormPanel = ({ item, onPatch, onEdit }: FormPanelProps): JSX.Element => {
	const toggleStatus = (checked: boolean): void => onPatch({ status: checked, visibility: checked })

	return (
		<div className={`${PANEL_CLASS} bg-[var(--bg-form-builder-panel)]`}>
			<div className={`${PANEL_ICON_CLASS} max-[992px]:mb-[12px]`}>
				<img src={typeIconSrc(item.type)} alt={item.type} width={24} height={24} />
			</div>

			<div id={`card-title-${item.id}`} className={PANEL_TITLE_CLASS}>
				<div className="font-semibold">{limitTitle(item.label)}</div>
				<div className="text-[var(--grey)]">
					<RequiredFlag label="Pendaftar" required={item.registrantRequired} className="mr-[24px]" />
					<RequiredFlag label="Admin" required={item.adminRequired} />
				</div>
			</div>

			<div className="flex w-[210px] min-w-[210px] items-center justify-between">
				<div className="w-[24px] max-w-[24px] min-w-[24px]">
					{item.helper ? (
						<FormPanelTooltip title={item.helper} className="inline-flex">
							<HelperIcon />
						</FormPanelTooltip>
					) : null}
				</div>

				<div>
					<LegacySwitch checked={item.status} onChange={toggleStatus} name="status" />
				</div>

				<FormPanelTooltip
					title={item.visibility ? VISIBILITY_ON_TITLE : VISIBILITY_OFF_TITLE}
					className="relative inline-block"
				>
					<span className="relative block h-[36px] w-[36px]">
						<input
							type="checkbox"
							name="visibility"
							id={`visibility-${item.id}`}
							checked={item.visibility}
							disabled={!item.status}
							onChange={(event) => onPatch({ visibility: event.target.checked })}
							className="absolute top-0 left-0 z-[-1] h-[36px] w-[36px] opacity-0"
						/>
						<label
							htmlFor={`visibility-${item.id}`}
							className={`relative block h-[36px] w-[36px] rounded-[6px] bg-transparent ${item.status ? "cursor-pointer" : "cursor-default"}`}
						>
							<span className={`${LAYER_CLASS} bg-[var(--bg-inverse)] bg-[url('/assets/svg/icons/visibility_hidden.svg')] ${item.visibility ? LAYER_HIDDEN : LAYER_SHOWN}`} />
							<span className={`${LAYER_CLASS} bg-[rgba(var(--secondary-rgb),0.16)] bg-[url('/assets/svg/icons/visibility_visible.svg')] ${item.visibility ? LAYER_SHOWN : LAYER_HIDDEN}`} />
						</label>
					</span>
				</FormPanelTooltip>

				<FormEditButton onEdit={onEdit} />
			</div>
		</div>
	)
}

export default FormPanel
