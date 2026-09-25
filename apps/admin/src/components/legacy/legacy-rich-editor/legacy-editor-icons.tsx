import type { JSX } from "react"

import { ensureLegacyStyle } from "../legacy-style"
import { SUMMERNOTE_WOFF2_BASE64 } from "./summernote-font"

ensureLegacyStyle(
	"legacy-summernote-font",
	`@font-face{font-family:summernote;font-style:normal;font-weight:400;font-display:auto;src:url(data:font/woff2;base64,${SUMMERNOTE_WOFF2_BASE64}) format("woff2")}`,
)

// `.note-icon-*` code points from porto/vendor/summernote/summernote-bs4.css
const GLYPH = {
	align: "",
	alignCenter: "",
	italic: "",
	indent: "",
	alignJustify: "",
	alignLeft: "",
	outdent: "",
	alignRight: "",
	arrowsAlt: "",
	bold: "",
	caret: "",
	close: "",
	code: "",
	eraser: "",
	link: "",
	magic: "",
	orderedlist: "",
	question: "",
	table: "",
	underline: "",
	unorderedlist: "",
} as const

export type EditorIconName = keyof typeof GLYPH

// `[class^=note-icon]:before` — inline-block, middle-aligned, inherits the button's font size
const EditorIcon = ({ name }: { name: EditorIconName }): JSX.Element => (
	<i aria-hidden="true" className="inline-block align-middle not-italic [font-family:summernote] [text-rendering:auto]">
		{GLYPH[name]}
	</i>
)

export default EditorIcon
