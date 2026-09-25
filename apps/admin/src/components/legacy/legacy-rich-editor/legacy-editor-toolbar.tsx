import type { JSX } from "react"

import { EditorParagraphMenu, EditorStyleMenu, EditorTableMenu } from "./legacy-editor-menus"
import { EditorButton, EditorGroup, ROUND_ALL, ROUND_L, ROUND_R } from "./legacy-editor-ui"

export type EditorMenu = "style" | "para" | "table" | null

export type EditorToolbarVariant = "full" | "compact"

type ToolbarProps = {
	/** `compact` is the two-group toolbar of the ewallet status-note editor (`transaction-detail/index.blade.php`). */
	variant?: EditorToolbarVariant
	state: Record<string, boolean>
	menu: EditorMenu
	codeview: boolean
	fullscreen: boolean
	onMenu: (menu: EditorMenu) => void
	onCommand: (command: string, arg?: string) => void
	onFormatBlock: (tag: string) => void
	onTable: (rows: number, cols: number) => void
	onLink: () => void
	onHelp: () => void
	onCodeview: () => void
	onFullscreen: () => void
}

/**
 * The exact groups of `public/assets/js/default-summernote.js`:
 * style | bold underline clear | ul ol paragraph | table | link | fullscreen codeview help,
 * with the `lang: "id-ID"` tooltips.
 *
 * The `compact` variant is the other summernote init in legacy, on the ewallet transaction
 * detail (`toolbar: [['font',['bold','italic','underline','clear']], ['para',['ul','ol','paragraph']]]`):
 * no style, table, link, fullscreen, code view or help.
 */
const LegacyEditorToolbar = ({
	variant = "full",
	state,
	menu,
	codeview,
	fullscreen,
	onMenu,
	onCommand,
	onFormatBlock,
	onTable,
	onLink,
	onHelp,
	onCodeview,
	onFullscreen,
}: ToolbarProps): JSX.Element => {
	const compact = variant === "compact"

	return (
		<div
			className="relative rounded-t-[12px] border-0 bg-[var(--bg-editor-toolbar,#ecedf0)] px-[10px] pt-[3px] pb-[10px]"
			role="toolbar"
		>
			{compact ? null : (
				<EditorGroup>
					<EditorButton title="Gaya" icon="magic" className={ROUND_ALL} caret onAction={() => onMenu(menu === "style" ? null : "style")} />
					{menu === "style" ? <EditorStyleMenu onPick={onFormatBlock} /> : null}
				</EditorGroup>
			)}

			<EditorGroup>
				<EditorButton title="Tebal" icon="bold" className={ROUND_L} active={state["bold"] === true} onAction={() => onCommand("bold")} />
				{compact ? (
					<EditorButton title="Miring" icon="italic" className="ml-[-1px]" active={state["italic"] === true} onAction={() => onCommand("italic")} />
				) : null}
				<EditorButton title="Garis bawah" icon="underline" className="ml-[-1px]" active={state["underline"] === true} onAction={() => onCommand("underline")} />
				<EditorButton title="Bersihkan gaya" icon="eraser" className={`ml-[-1px] ${ROUND_R}`} onAction={() => onCommand("removeFormat")} />
			</EditorGroup>

			<EditorGroup>
				<EditorButton
					title="Pencacahan"
					icon="unorderedlist"
					className={ROUND_L}
					active={state["insertUnorderedList"] === true}
					onAction={() => onCommand("insertUnorderedList")}
				/>
				<EditorButton
					title="Penomoran"
					icon="orderedlist"
					className="ml-[-1px]"
					active={state["insertOrderedList"] === true}
					onAction={() => onCommand("insertOrderedList")}
				/>
				{/* `ui.buttonGroup` nested inside `.note-para`, so the menu lines up with this button */}
				<div className="relative ml-[-1px] inline-flex">
					<EditorButton title="Paragraf" icon="align" className={ROUND_R} caret onAction={() => onMenu(menu === "para" ? null : "para")} />
					{menu === "para" ? <EditorParagraphMenu onCommand={onCommand} state={state} /> : null}
				</div>
			</EditorGroup>

			{compact ? null : (
				<>
					<EditorGroup>
						<EditorButton title="Tabel" icon="table" className={ROUND_ALL} caret onAction={() => onMenu(menu === "table" ? null : "table")} />
						{menu === "table" ? <EditorTableMenu onPick={onTable} /> : null}
					</EditorGroup>

					<EditorGroup>
						<EditorButton title="Tautan" icon="link" className={ROUND_ALL} onAction={onLink} />
					</EditorGroup>

					<EditorGroup>
						<EditorButton title="Layar penuh" icon="arrowsAlt" className={ROUND_L} active={fullscreen} onAction={onFullscreen} />
						<EditorButton title="Kode HTML" icon="code" className="ml-[-1px]" active={codeview} onAction={onCodeview} />
						<EditorButton title="Bantuan" icon="question" className={`ml-[-1px] ${ROUND_R}`} onAction={onHelp} />
					</EditorGroup>
				</>
			)}
		</div>
	)
}

export default LegacyEditorToolbar
