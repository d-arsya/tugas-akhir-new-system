import { useEffect, useRef, useState, type JSX, type MouseEvent as ReactMouseEvent } from "react"

import { cn } from "@roja/utils"

import LegacyEditorHelpDialog from "./legacy-editor-help-dialog"
import LegacyEditorLinkDialog, { type EditorLink } from "./legacy-editor-link-dialog"
import LegacyEditorToolbar, { type EditorMenu } from "./legacy-editor-toolbar"

// Summernote's `dom.emptyPara`; `setting/annc-ajax.js` treats it as an empty field
const EMPTY = "<p><br></p>"
const STATE_COMMANDS = ["bold", "underline", "insertUnorderedList", "insertOrderedList", "justifyLeft", "justifyCenter", "justifyRight", "justifyFull"]

const escapeHtml = (value: string): string =>
	value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

type LegacyRichEditorProps = { value: string; onChange: (html: string) => void; height?: number }

/**
 * Port of the legacy summernote editor (`default-summernote.js`, `height: 130`, `lang: "id-ID"`).
 * A `contentEditable` driven by `document.execCommand`, so the stored HTML stays byte-for-byte
 * what the browser produced — the PSB portal renders it with `{!! … !!}`.
 */
const LegacyRichEditor = ({ value, onChange, height = 130 }: LegacyRichEditorProps): JSX.Element => {
	const frame = useRef<HTMLDivElement>(null)
	const editable = useRef<HTMLDivElement>(null)
	const emitted = useRef<string | null>(null)
	const range = useRef<Range | null>(null)

	const [menu, setMenu] = useState<EditorMenu>(null)
	const [dialog, setDialog] = useState<"link" | "help" | null>(null)
	const [code, setCode] = useState<string | null>(null)
	const [fullscreen, setFullscreen] = useState(false)
	const [state, setState] = useState<Record<string, boolean>>({})
	const [area, setArea] = useState(height)
	const [selectedText, setSelectedText] = useState("")

	// Summernote's Enter produces `<p>`, not `<div>`
	useEffect(() => {
		try {
			document.execCommand("defaultParagraphSeparator", false, "p")
		} catch {
			/* not supported — the browser default stands */
		}
	}, [])

	// Only write into the DOM for values this editor did not produce, so typing never loses the caret
	useEffect(() => {
		const node = editable.current
		if (node === null || value === emitted.current) return
		node.innerHTML = value === "" ? EMPTY : value
		emitted.current = node.innerHTML
	}, [value])

	// `.note-dropdown-menu` closes on any click outside the toolbar
	useEffect(() => {
		if (menu === null) return undefined
		const onDown = (event: MouseEvent): void => {
			if (!frame.current?.contains(event.target as Node)) setMenu(null)
		}
		document.addEventListener("mousedown", onDown)
		return () => document.removeEventListener("mousedown", onDown)
	}, [menu])

	// Summernote normalises an emptied editor back to `dom.emptyPara`, caret inside the paragraph
	const fillEmpty = (node: HTMLDivElement): void => {
		if (node.innerHTML !== "" && node.innerHTML !== "<br>") return
		node.innerHTML = EMPTY
		const paragraph = node.firstElementChild
		if (paragraph === null) return
		const caret = document.createRange()
		caret.setStart(paragraph, 0)
		caret.collapse(true)
		const selection = window.getSelection()
		selection?.removeAllRanges()
		selection?.addRange(caret)
	}

	const emit = (): void => {
		const node = editable.current
		if (node === null) return
		fillEmpty(node)
		emitted.current = node.innerHTML
		onChange(node.innerHTML)
	}

	const refresh = (): void => {
		const next: Record<string, boolean> = {}
		for (const command of STATE_COMMANDS) {
			try {
				next[command] = document.queryCommandState(command)
			} catch {
				next[command] = false
			}
		}
		setState(next)
	}

	const remember = (): void => {
		const selection = window.getSelection()
		if (selection !== null && selection.rangeCount > 0 && editable.current?.contains(selection.anchorNode) === true) {
			range.current = selection.getRangeAt(0).cloneRange()
			setSelectedText(selection.toString())
		}
		refresh()
	}

	// Only put the caret back when it left the editable (a dialog took focus); a live selection stands
	const restore = (): void => {
		const node = editable.current
		if (node === null) return
		const selection = window.getSelection()
		if (selection !== null && selection.rangeCount > 0 && node.contains(selection.anchorNode)) return
		node.focus()
		if (range.current === null) return
		selection?.removeAllRanges()
		selection?.addRange(range.current)
	}

	const run = (command: string, argument?: string): void => {
		restore()
		document.execCommand(command, false, argument)
		setMenu(null)
		emit()
		refresh()
	}

	// `dom.createTable`: `<table class="table table-bordered">` with a `<br>` in every cell
	const insertTable = (rows: number, cols: number): void => {
		const cells = "<td><br></td>".repeat(cols)
		const body = `<tr>${cells}</tr>`.repeat(rows)
		run("insertHTML", `<table class="table table-bordered"><tbody>${body}</tbody></table>`)
	}

	const insertLink = ({ text, url, newWindow }: EditorLink): void => {
		setDialog(null)
		const target = newWindow ? ' target="_blank"' : ""
		run("insertHTML", `<a href="${escapeHtml(url)}"${target}>${escapeHtml(text)}</a>`)
	}

	// `codeview.activate()` swaps the editable for a textarea and `deactivate()` writes it back
	const toggleCodeview = (): void => {
		setMenu(null)
		if (code === null) {
			setCode(editable.current?.innerHTML ?? "")
			return
		}
		const node = editable.current
		if (node !== null) {
			node.innerHTML = code
			emitted.current = node.innerHTML
			onChange(node.innerHTML)
		}
		setCode(null)
	}

	// `.note-statusbar .note-resizebar` (cursor `ns-resize`)
	const startResize = (event: ReactMouseEvent): void => {
		event.preventDefault()
		const startY = event.clientY
		const startHeight = area
		const move = (moveEvent: MouseEvent): void => setArea(Math.max(30, startHeight + moveEvent.clientY - startY))
		const up = (): void => {
			document.removeEventListener("mousemove", move)
			document.removeEventListener("mouseup", up)
		}
		document.addEventListener("mousemove", move)
		document.addEventListener("mouseup", up)
	}

	return (
		<div
			ref={frame}
			className={cn(
				"relative rounded-[10px] border-2 border-[var(--bg-editor-toolbar,#ecedf0)]!",
				fullscreen && "fixed top-0 left-0 z-[1050] w-full! rounded-none",
			)}
		>
			<LegacyEditorToolbar
				state={state}
				menu={menu}
				codeview={code !== null}
				fullscreen={fullscreen}
				onMenu={setMenu}
				onCommand={run}
				onFormatBlock={(tag) => run("formatBlock", `<${tag}>`)}
				onTable={insertTable}
				onLink={() => {
					setMenu(null)
					setDialog("link")
				}}
				onHelp={() => {
					setMenu(null)
					setDialog("help")
				}}
				onCodeview={toggleCodeview}
				onFullscreen={() => setFullscreen((current) => !current)}
			/>

			<div className="relative overflow-hidden">
				{code === null ? (
					<div
						ref={editable}
						role="textbox"
						aria-multiline="true"
						tabIndex={0}
						contentEditable
						suppressContentEditableWarning
						spellCheck={false}
						style={{ height: fullscreen ? "calc(100vh - 100px)" : area }}
						onInput={emit}
						onKeyUp={remember}
						onMouseUp={remember}
						onBlur={remember}
						className="overflow-auto bg-[var(--bg-inverse)] p-[10px] break-words outline-none"
					/>
				) : (
					<textarea
						value={code}
						spellCheck={false}
						onChange={(event) => setCode(event.target.value)}
						style={{ height: fullscreen ? "calc(100vh - 100px)" : area }}
						className="mb-0 block w-full resize-none rounded-none border-0 bg-[#222] p-[10px] text-[14px] text-[#ccc] shadow-none outline-none [font-family:Menlo,Monaco,monospace,sans-serif]"
					/>
				)}
			</div>

			{fullscreen ? null : (
				<div className="rounded-b-[4px] border-0 bg-[var(--bg-editor-toolbar,#ecedf0)]">
					<div role="presentation" onMouseDown={startResize} className="h-[9px] w-full cursor-ns-resize pt-px">
						<div className="mx-auto my-px w-[20px] border-t border-[#00000032]!" />
						<div className="mx-auto my-px w-[20px] border-t border-[#00000032]!" />
						<div className="mx-auto my-px w-[20px] border-t border-[#00000032]!" />
					</div>
				</div>
			)}

			<LegacyEditorLinkDialog
				open={dialog === "link"}
				selectedText={selectedText}
				onClose={() => setDialog(null)}
				onInsert={insertLink}
			/>
			<LegacyEditorHelpDialog open={dialog === "help"} onClose={() => setDialog(null)} />
		</div>
	)
}

export default LegacyRichEditor
