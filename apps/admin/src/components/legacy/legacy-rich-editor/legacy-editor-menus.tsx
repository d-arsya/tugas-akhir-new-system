import { useState, type JSX, type MouseEvent } from "react"

import { EditorButton, EditorDropdown, EditorDropdownItem, ROUND_L, ROUND_R } from "./legacy-editor-ui"

// `styleTags` defaults with the `id-ID` titles from porto/vendor/summernote/lang/summernote-id-ID.js
const STYLE_ITEMS = [
	{ tag: "p", title: "p" },
	{ tag: "blockquote", title: "Kutipan" },
	{ tag: "pre", title: "Kode" },
	{ tag: "h1", title: "Heading 1" },
	{ tag: "h2", title: "Heading 2" },
	{ tag: "h3", title: "Heading 3" },
	{ tag: "h4", title: "Heading 4" },
	{ tag: "h5", title: "Heading 5" },
	{ tag: "h6", title: "Heading 6" },
] as const

const HEADING = "m-0! p-0! leading-normal! tracking-normal!"

const preview = (tag: string, title: string): JSX.Element => {
	if (tag === "p") return <p className="m-0 p-0">{title}</p>
	if (tag === "blockquote") return <blockquote className="m-0 px-[10px] py-[5px]">{title}</blockquote>
	if (tag === "pre") return <pre className="m-0 px-[10px] py-[5px]">{title}</pre>
	if (tag === "h1") return <h1 className={HEADING}>{title}</h1>
	if (tag === "h2") return <h2 className={HEADING}>{title}</h2>
	if (tag === "h3") return <h3 className={HEADING}>{title}</h3>
	if (tag === "h4") return <h4 className={HEADING}>{title}</h4>
	if (tag === "h5") return <h5 className={HEADING}>{title}</h5>
	return <h6 className={HEADING}>{title}</h6>
}

// `.note-style .note-dropdown-menu.show { min-width: 260px !important }` (summernote.css 59-61)
export const EditorStyleMenu = ({ onPick }: { onPick: (tag: string) => void }): JSX.Element => (
	<EditorDropdown className="min-w-[260px]!">
		{STYLE_ITEMS.map((item) => (
			<EditorDropdownItem key={item.tag} onAction={() => onPick(item.tag)}>
				{preview(item.tag, item.title)}
			</EditorDropdownItem>
		))}
	</EditorDropdown>
)

type ParaProps = { onCommand: (command: string) => void; state: Record<string, boolean> }

// `.note-para .note-dropdown-menu { min-width: 228px; padding: 5px }` with two button groups side by side
export const EditorParagraphMenu = ({ onCommand, state }: ParaProps): JSX.Element => (
	<EditorDropdown className="flex min-w-[228px] p-[5px]">
		<div className="inline-flex">
			<EditorButton title="Rata kiri" icon="alignLeft" className={ROUND_L} active={state["justifyLeft"] === true} onAction={() => onCommand("justifyLeft")} />
			<EditorButton title="Rata tengah" icon="alignCenter" className="ml-[-1px]" active={state["justifyCenter"] === true} onAction={() => onCommand("justifyCenter")} />
			<EditorButton title="Rata kanan" icon="alignRight" className="ml-[-1px]" active={state["justifyRight"] === true} onAction={() => onCommand("justifyRight")} />
			<EditorButton title="Rata kanan kiri" icon="alignJustify" className={`ml-[-1px] ${ROUND_R}`} active={state["justifyFull"] === true} onAction={() => onCommand("justifyFull")} />
		</div>
		<div className="ml-[5px] inline-flex">
			<EditorButton title="Outdent" icon="outdent" className={ROUND_L} onAction={() => onCommand("outdent")} />
			<EditorButton title="Indent" icon="indent" className={`ml-[-1px] ${ROUND_R}`} onAction={() => onCommand("indent")} />
		</div>
	</EditorDropdown>
)

// The repeating 18px cell sprites from summernote-bs4.css (`.note-dimension-picker-*`)
const CELL_PX = 18
const UNHIGHLIGHTED =
	"url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASAgMAAAAroGbEAAAACVBMVEUAAIj4+Pjp6ekKlAqjAAAAAXRSTlMAQObYZgAAAAFiS0dEAIgFHUgAAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfYAR0BKhmnaJzPAAAAG0lEQVQI12NgAAOtVatWMTCohoaGUY+EmIkEAEruEzK2J7tvAAAAAElFTkSuQmCC)"
const HIGHLIGHTED =
	"url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASAgMAAAAroGbEAAAACVBMVEUAAIjd6vvD2f9LKLW+AAAAAXRSTlMAQObYZgAAAAFiS0dEAIgFHUgAAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfYAR0BKwNDEVT0AAAAG0lEQVQI12NgAAOtVatWMTCohoaGUY+EmIkEAEruEzK2J7tvAAAAAElFTkSuQmCC)"

// `.note-table .note-dimension-picker` — `insertTableMaxSize` is 10x10
export const EditorTableMenu = ({ onPick }: { onPick: (rows: number, cols: number) => void }): JSX.Element => {
	const [dim, setDim] = useState({ c: 1, r: 1 })

	const track = (event: MouseEvent<HTMLDivElement>): void => {
		const box = event.currentTarget.getBoundingClientRect()
		const c = Math.min(10, Math.max(1, Math.ceil((event.clientX - box.left) / CELL_PX)))
		const r = Math.min(10, Math.max(1, Math.ceil((event.clientY - box.top) / CELL_PX)))
		setDim({ c, r })
	}

	return (
		<EditorDropdown className="min-w-0! p-[5px]">
			<div className="relative text-[18px]" onMouseDown={(event) => event.preventDefault()}>
				<div
					className="relative z-[1] bg-repeat"
					style={{
						backgroundImage: UNHIGHLIGHTED,
						width: `${Math.max(5, dim.c > 3 ? dim.c + 1 : 5)}em`,
						height: `${Math.max(5, dim.r > 3 ? dim.r + 1 : 5)}em`,
					}}
				/>
				<div
					className="absolute top-0 left-0 z-[2] bg-repeat"
					style={{ backgroundImage: HIGHLIGHTED, width: `${dim.c}em`, height: `${dim.r}em` }}
				/>
				<div
					role="presentation"
					onMouseMove={track}
					onClick={() => onPick(dim.r, dim.c)}
					className="absolute top-0 left-0 z-[3] h-[10em] w-[10em] cursor-pointer"
				/>
			</div>
			<div className="mt-[2px] text-center text-[12px]">{`${dim.c} x ${dim.r}`}</div>
		</EditorDropdown>
	)
}
