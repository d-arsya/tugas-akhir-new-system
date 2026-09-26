import { useEffect, useState, type JSX, type ReactNode } from "react"

import type { AdminRegistrantDetail, AdminRegistrantStatusDto } from "@roja/types"
import { cn } from "@roja/utils"

import LegacyButton from "@/components/legacy/legacy-button"
import LegacyModal, { LegacyModalOverlay } from "@/components/legacy/legacy-modal"
import LegacyRichEditor from "@/components/legacy/legacy-rich-editor/legacy-rich-editor"

import RegistrantMegaRadio from "./registrant-mega-radio"

// `registrant/partials/edit/modals/{data-validation,test-indent,test-regular}.blade.php` + `summernote.js`
// + `custom-ajax.js` (`specificForm`: a summernote left empty posts "").

const EMPTY_NOTE = "<p><br></p>"

type ModalProps = {
	open: boolean
	detail: AdminRegistrantDetail
	submitting: boolean
	onCancel: () => void
	onSubmit: (data: AdminRegistrantStatusDto) => void
}

// The modal content is portalled to <body>, so Simpan is wired by click rather than through a DOM <form>
const Footer = ({ submitting, onCancel, onSave }: { submitting: boolean; onCancel: () => void; onSave: () => void }): ReactNode => (
	<>
		<LegacyButton variant="light" className="mr-[8px]" onClick={onCancel}>
			Batal
		</LegacyButton>{" "}
		<LegacyButton variant="primary" loading={submitting} onClick={onSave}>
			Simpan
		</LegacyButton>
	</>
)

/** `#modalDataValidation.modal-block-lg` (porto: 900px) — the `.tbr_custom_modal` card of `LegacyModal`. */
export const DataValidationModal = ({ open, detail, submitting, onCancel, onSubmit }: ModalProps): JSX.Element => {
	const [value, setValue] = useState("")
	const [note, setNote] = useState("")
	// `disabled` until "invalid" is picked; summernote("disable") later greys the editor but the textarea stays posted
	const [notePosted, setNotePosted] = useState(false)

	useEffect(() => {
		if (!open) return
		setValue(detail.dataValidation === "valid" || detail.dataValidation === "invalid" ? detail.dataValidation : "")
		setNote(detail.dataValidationNote ?? "")
		setNotePosted(detail.dataValidation === "invalid")
	}, [open, detail])

	const submit = (): void => {
		// `input[type=hidden][name=data_validation][value=""]` before the radios: nothing picked posts ""
		const data: AdminRegistrantStatusDto = { data_validation: value }
		if (notePosted) data.data_validation_note = note === EMPTY_NOTE ? "" : note
		onSubmit(data)
	}

	return (
		<LegacyModalOverlay open={open} maxWidth="900px">
			<section className="flex max-h-[calc(100vh-70px)] flex-col overflow-hidden rounded-[20px]">
				{/* `header.card-header.flex-wrap > h2.card-title + span.tbr_text-grey {fullname}` */}
				<header className="flex min-h-[68px] shrink-0 flex-wrap items-center justify-between rounded-t-[20px] border-0 bg-[var(--bg-tertiary)] px-[30px]">
					<h2 className="m-0! p-0! text-[16px]! leading-[18px]! font-semibold! tracking-normal! text-[var(--heading-txt-inverse)]!">
						Pengaturan validasi data
					</h2>
					<span className="text-[var(--grey)]">{detail.fullname}</span>
				</header>
				<div className="overflow-y-auto bg-[var(--bg-secondary)] p-[30px]">
					<div className="mx-[-15px] flex flex-wrap justify-center">
						<div className="w-full px-[15px] min-[992px]:w-3/4">
							<div className="mb-[16px]">
								<RegistrantMegaRadio
									inline
									name="data_validation"
									value={value}
									onChange={(next) => {
										setValue(next)
										if (next === "invalid") setNotePosted(true)
									}}
									options={[
										{ id: "cash", value: "invalid", title: "Data belum valid", description: "Formulir perbaikan data akan diaktifkan." },
										{ id: "transfer", value: "valid", title: "Data sudah valid", description: "Data sudah benar dan bisa lanjut ke tahap berikutnya." },
									]}
								/>
							</div>
						</div>
					</div>
					{/* `div.tbr_visibility_area > hr.tbr_divider_solid.mt-4.mt-sm-2.mb-3` */}
					<div>
						<hr className="mt-[24px] mb-[16px] h-[2px] border-0 bg-[var(--bg-primary)] min-[576px]:mt-[8px]" />
						<p className="mt-0 mb-[8px] leading-[24px] text-[var(--grey)] italic">
							Berikan catatan kepada pendaftar data apa saja yang tidak valid sehingga pendaftar dapat memperbaikinya.
						</p>
						<div
							inert={value !== "invalid"}
							className={cn("mb-[16px]", value !== "invalid" && "[&_[role=textbox]]:bg-[var(--bg-editor-disabled,#ecedf0)]")}
						>
							<LegacyRichEditor value={note} height={120} onChange={setNote} />
						</div>
					</div>
				</div>
				<footer className="-mt-[5px] flex min-h-[68px] shrink-0 items-center justify-end rounded-b-[20px] border-0 bg-[var(--bg-tertiary)] px-[30px]">
					<div className="text-right">
						<Footer submitting={submitting} onCancel={onCancel} onSave={submit} />
					</div>
				</footer>
			</section>
		</LegacyModalOverlay>
	)
}

type TestModalProps = ModalProps & { kind: "indent" | "regular" }

/** `#modalTestIndent` / `#modalTestRegular` (`.modal-block-sm`): "Tidak Lolos" / "Lolos". */
export const TestModal = ({ open, kind, detail, submitting, onCancel, onSubmit }: TestModalProps): JSX.Element => {
	const current = kind === "indent" ? detail.indentTest : detail.regularTest
	const [value, setValue] = useState("")
	useEffect(() => {
		if (open) setValue(current === "success" || current === "failed" ? current : "")
	}, [open, current])

	const field = kind === "indent" ? "indent_test" : "regular_test"
	return (
		<LegacyModal
			open={open}
			size="sm"
			onClose={onCancel}
			title={kind === "indent" ? "Tes Indent" : "Tes Reguler"}
			icon={<span className="text-[var(--grey)]">{detail.fullname}</span>}
			footer={<Footer submitting={submitting} onCancel={onCancel} onSave={() => onSubmit({ [field]: value })} />}
		>
			<div className="mb-[16px]">
				<RegistrantMegaRadio
					name={field}
					value={value}
					onChange={setValue}
					options={[
						{
							id: `${kind}-failed`,
							value: "failed",
							title: "Tidak Lolos",
							description: "Kemungkinan besar calon santri tidak diterima.",
							className: "mb-[48px]",
						},
						{
							id: `${kind}-success`,
							value: "success",
							title: "Lolos",
							description: "Dinyatakan telah lolos tes regular dan dapat diterima.",
							className: "mb-[24px]",
						},
					]}
				/>
			</div>
		</LegacyModal>
	)
}
