import { useEffect, useState, type JSX } from "react"

import LegacyCheckbox from "../legacy-checkbox"
import LegacyInput from "../legacy-input"
import EditorModal from "./legacy-editor-modal"

export type EditorLink = { text: string; url: string; newWindow: boolean }

type LinkDialogProps = {
	open: boolean
	selectedText: string
	onClose: () => void
	onInsert: (link: EditorLink) => void
}

const LegacyEditorLinkDialog = ({ open, selectedText, onClose, onInsert }: LinkDialogProps): JSX.Element => {
	const [text, setText] = useState(selectedText)
	const [url, setUrl] = useState("http://")
	const [newWindow, setNewWindow] = useState(true)

	useEffect(() => {
		if (!open) return
		setText(selectedText)
		setUrl("http://")
		setNewWindow(true)
	}, [open, selectedText])

	const submit = (): void => {
		if (url.trim() === "") return
		onInsert({ text: text === "" ? url : text, url, newWindow })
	}

	return (
		<EditorModal
			open={open}
			title="Tambah tautan"
			onClose={onClose}
			footer={
				<input
					type="button"
					value="Tambah tautan"
					disabled={url.trim() === ""}
					onClick={submit}
					className="cursor-pointer rounded-[4px] border-0 bg-[#ccc] px-[12px] py-[6px] text-[12.8px] text-white disabled:cursor-default disabled:opacity-65"
				/>
			}
		>
			<div className="mb-[16px]">
				<label htmlFor="note-link-text" className="mb-[8px] block leading-[20px]">
					Tampilan teks
				</label>
				<LegacyInput id="note-link-text" type="text" value={text} onChange={(event) => setText(event.target.value)} />
			</div>
			<div className="mb-[16px]">
				<label htmlFor="note-link-url" className="mb-[8px] block leading-[20px]">
					Tautan tujuan
				</label>
				<LegacyInput
					id="note-link-url"
					type="text"
					value={url}
					onChange={(event) => setUrl(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === "Enter") submit()
					}}
				/>
			</div>
			<LegacyCheckbox
				id="note-link-new-window"
				checked={newWindow}
				onChange={setNewWindow}
				label="Buka di jendela baru"
			/>
		</EditorModal>
	)
}

export default LegacyEditorLinkDialog
