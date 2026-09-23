import type { JSX } from "react"

// SVGs lifted from `setting/includes/card-setting.blade.php` and `card-accordion.blade.php`.
// The fills stay literal because the legacy markup hard-codes them (the pencil keeps its pink
// even while `.tbr_btn-light-primary` is hovered).

/** `.tbr_required span svg`; `.tbr_is_required svg path` swaps the fill to `--danger`. */
export const RequiredAsterisk = ({ required }: { required: boolean }): JSX.Element => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="9"
		height="9.582"
		viewBox="0 0 9 9.582"
		aria-hidden="true"
		className="mt-[-2px] ml-[5px] inline-block align-middle"
	>
		<g transform="translate(-2.924)" opacity="0.6">
			<path
				d="M11.829,6.389l-2.613-1.6,2.613-1.6a.2.2,0,0,0,.066-.274l-.768-1.255a.2.2,0,0,0-.274-.066L8.358,3.124V.2a.2.2,0,0,0-.2-.2H6.688a.2.2,0,0,0-.2.2V3.124L3.994,1.6a.2.2,0,0,0-.274.066L2.953,2.919a.2.2,0,0,0,.066.274l2.613,1.6-2.613,1.6a.2.2,0,0,0-.066.274l.768,1.255a.2.2,0,0,0,.274.066L6.489,6.458V9.383a.2.2,0,0,0,.2.2H8.159a.2.2,0,0,0,.2-.2V6.458l2.495,1.526a.2.2,0,0,0,.274-.066l.768-1.255a.2.2,0,0,0-.066-.274Z"
				transform="translate(0 0)"
				fill={required ? "var(--danger)" : "#abb4be"}
			/>
		</g>
	</svg>
)

/** `.tbr_fp_help` info icon (24×24, `#ffa800`). */
export const HelperIcon = (): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
		<rect width="24" height="24" transform="translate(24 24) rotate(180)" fill="#ffa800" opacity="0" />
		<path
			d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
			fill="#ffa800"
		/>
		<circle cx="1" cy="1" r="1" transform="translate(11 7)" fill="#ffa800" />
		<path d="M12,10a1,1,0,0,0-1,1v5a1,1,0,0,0,2,0V11A1,1,0,0,0,12,10Z" fill="#ffa800" />
	</svg>
)

/** `.tbr_fp_setting` pencil (24×24, `#e4007e`). */
export const EditIcon = (): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
		<rect width="24" height="24" fill="#e4007e" opacity="0" />
		<path
			d="M19.4,7.34,16.66,4.6A2,2,0,0,0,14,4.53l-9,9a2,2,0,0,0-.57,1.21L4,18.91A1,1,0,0,0,5,20h.09l4.17-.38a2,2,0,0,0,1.21-.57l9-9a1.92,1.92,0,0,0-.07-2.71ZM9.08,17.62l-3,.28.27-3L12,9.32l2.7,2.7ZM16,10.68,13.32,8l1.95-2L18,8.73Z"
			fill="#e4007e"
		/>
	</svg>
)

/** `#reset-custom-name` reset arrow (24×24, `#e4007e`). */
export const ResetIcon = (): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
		<rect width="24" height="24" fill="none" />
		<path
			d="M8.433,7.174l.975.683a.5.5,0,0,1-.13.884L5.891,9.858A.5.5,0,0,1,5.234,9.4l-.1-3.557a.5.5,0,0,1,.787-.423l.806.565A8,8,0,1,1,4,12H6A6,6,0,1,0,8.433,7.174Z"
			fill="#e4007e"
		/>
	</svg>
)

/** `assets/svg/icons/doc_{type with spaces → _}.svg` */
export const typeIconSrc = (type: string): string => `/assets/svg/icons/doc_${type.replace(/ /g, "_")}.svg`

/** Legacy `Str::limit($value, 30, ' ...')`: `rtrim` on the cut, then the ellipsis. */
export const limitTitle = (value: string): string =>
	value.length <= 30 ? value : `${value.slice(0, 30).replace(/\s+$/, "")} ...`
