import { useEffect, useState, type JSX } from "react"

import type { SettingFormItem, SettingFormPatch } from "@roja/types"

import LegacyButton from "@/components/legacy/legacy-button"
import LegacyCheckbox from "@/components/legacy/legacy-checkbox"
import LegacyModal from "@/components/legacy/legacy-modal"
import LegacyTextarea from "@/components/legacy/legacy-textarea"
import { PANEL_ICON_CLASS } from "@/components/settings/form-builder/form-panel"
import { ResetIcon, typeIconSrc } from "@/components/settings/form-builder/form-builder-icons"

type FormEditModalProps = {
	item: SettingFormItem | null
	saving: boolean
	onClose: () => void
	onSubmit: (data: SettingFormPatch) => void
}

const HELP_BLOCK_CLASS = "ml-[8px] m-0 mb-[4px] p-0 text-[11px] leading-[20px] font-normal text-[var(--grey)] opacity-80"

const RESET_BUTTON_CLASS =
	"ml-[16px] min-h-[40px] min-w-[40px] shrink-0 cursor-pointer rounded-[6px] border-0 bg-[rgba(228,0,126,0.16)] p-[8px] transition-all duration-300 outline-none hover:bg-[var(--primary)] focus:bg-[var(--primary)]"

const FormEditModal = ({ item, saving, onClose, onSubmit }: FormEditModalProps): JSX.Element => {
	const isAccordion = item?.type === "accordion label"
	const [description, setDescription] = useState("")
	const [registrantRequired, setRegistrantRequired] = useState(false)
	const [adminRequired, setAdminRequired] = useState(false)

	useEffect(() => {
		if (!item) return
		setDescription(item.customName ?? item.defaultLabel ?? "")
		setRegistrantRequired(item.registrantRequired)
		setAdminRequired(item.adminRequired)
	}, [item])

	const submit = (): void => {
		if (!item) return
		onSubmit(
			isAccordion
				? { customName: description }
				: { customName: description, registrantRequired, adminRequired },
		)
	}

	return (
		<LegacyModal
			open={item !== null}
			onClose={onClose}
			size="sm"
			title="Edit keterangan"
			icon={
				<div className={PANEL_ICON_CLASS}>
					<img src={typeIconSrc(isAccordion ? "accordion label" : "basic input")} alt="Paragraph" width={24} height={24} />
				</div>
			}
			footer={
				<>
					<LegacyButton variant="light" onClick={onClose} className="mr-[8px] bg-[var(--bg-inverse)]">
						Batal
					</LegacyButton>{" "}
					<LegacyButton variant="primary" loading={saving} onClick={submit}>
						Simpan
					</LegacyButton>
				</>
			}
		>
			<div className={isAccordion ? "mb-[4px]" : "mb-[16px]"}>
				<label htmlFor={`custom_name-${item?.id ?? 0}`} className="m-0 flex leading-[20px] font-medium">
					Keterangan
					<span className={HELP_BLOCK_CLASS}>required</span>
				</label>
				<div className="flex items-start">
					<LegacyTextarea
						id={`custom_name-${item?.id ?? 0}`}
						name="custom_name"
						rows={3}
						noResize
						spellCheck={false}
						value={description}
						onChange={(event) => setDescription(event.target.value)}
					/>
					<button
						type="button"
						className={RESET_BUTTON_CLASS}
						aria-label="Kembalikan ke keterangan bawaan"
						onClick={() => setDescription(item?.defaultLabel ?? "")}
					>
						<ResetIcon />
					</button>
				</div>
			</div>

			{isAccordion ? null : (
				<>
					<div className="mb-[16px]">
						<LegacyCheckbox
							id={`registrant_required-${item?.id ?? 0}`}
							name="registrant_required"
							checked={registrantRequired}
							onChange={setRegistrantRequired}
							label="Required"
							description="Form ini wajib untuk diisi oleh pendaftar."
						/>
					</div>
					<div>
						<LegacyCheckbox
							id={`admin_required-${item?.id ?? 0}`}
							name="admin_required"
							checked={adminRequired}
							onChange={setAdminRequired}
							label="Admin Required"
							description="Pada saat admin menambahkan pendaftar atau santri."
						/>
					</div>
				</>
			)}
		</LegacyModal>
	)
}

export default FormEditModal
