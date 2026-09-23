import type { JSX } from "react"

import EditorModal from "./legacy-editor-modal"

// `options.keyMap.pc` paired with the `id-ID` `help` strings (porto/vendor/summernote/lang/summernote-id-ID.js)
const SHORTCUTS: [string, string][] = [
	["ENTER", "Tambahkan paragraf"],
	["CTRL+Z", "Urungkan perintah terakhir"],
	["CTRL+Y", "Kembalikan perintah terakhir"],
	["TAB", "Tab"],
	["SHIFT+TAB", "Untab"],
	["CTRL+B", "Mengaktifkan gaya tebal"],
	["CTRL+I", "Mengaktifkan gaya italic"],
	["CTRL+U", "Mengaktifkan gaya underline"],
	["CTRL+SHIFT+S", "Mengaktifkan gaya strikethrough"],
	["CTRL+BACKSLASH", "Hapus semua gaya"],
	["CTRL+SHIFT+L", "Atur rata kiri"],
	["CTRL+SHIFT+E", "Atur rata tengah"],
	["CTRL+SHIFT+R", "Atur rata kanan"],
	["CTRL+SHIFT+J", "Atur rata kiri-kanan"],
	["CTRL+SHIFT+NUM7", "Nyalakan urutan tanpa nomor"],
	["CTRL+SHIFT+NUM8", "Nyalakan urutan bernomor"],
	["CTRL+LEFTBRACKET", "Outdent di paragraf terpilih"],
	["CTRL+RIGHTBRACKET", "Indent di paragraf terpilih"],
	["CTRL+NUM0", "Ubah format gaya tulisan terpilih menjadi paragraf"],
	["CTRL+NUM1", "Ubah format gaya tulisan terpilih menjadi Heading 1"],
	["CTRL+NUM2", "Ubah format gaya tulisan terpilih menjadi Heading 2"],
	["CTRL+NUM3", "Ubah format gaya tulisan terpilih menjadi Heading 3"],
	["CTRL+NUM4", "Ubah format gaya tulisan terpilih menjadi Heading 4"],
	["CTRL+NUM5", "Ubah format gaya tulisan terpilih menjadi Heading 5"],
	["CTRL+NUM6", "Ubah format gaya tulisan terpilih menjadi Heading 6"],
	["CTRL+ENTER", "Masukkan garis horizontal"],
	["CTRL+K", "Tampilkan Link Dialog"],
]

// `helpDialog` — `lang.shortcut.shortcuts` is the title, plus summernote's own credit line
const LegacyEditorHelpDialog = ({ open, onClose }: { open: boolean; onClose: () => void }): JSX.Element => (
	<EditorModal open={open} title="Jalan pintas" onClose={onClose}>
		<div className="max-h-[300px] overflow-y-auto">
			{SHORTCUTS.map(([key, description]) => (
				<div key={key} className="mx-[-15px] flex flex-wrap">
					<div className="w-1/2 px-[15px] text-right">
						<kbd className="rounded-[3px] bg-[#212529] px-[4px] py-[2px] text-[10px] text-white">{key}</kbd>
					</div>
					<div className="w-1/2 px-[15px]">{description}</div>
				</div>
			))}
		</div>
		<p className="mt-[16px] mb-0 text-center">Summernote 0.8.18</p>
	</EditorModal>
)

export default LegacyEditorHelpDialog
