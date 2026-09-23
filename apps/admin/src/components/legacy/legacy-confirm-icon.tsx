import type { JSX } from "react"

/**
 * `include/modal-delete.blade.php` — 69×69, circle r=28.5 at .2 opacity + question mark.
 * Shared by `legacy-confirm-delete` (the magnific modal) and `legacy-delete-page` (the
 * full-page delete/delegate shell), so neither owns it.
 *
 * `.tbr_modal_confirm-warning` re-fills the same glyph with `--warning` (app.css 1975-1978),
 * which is what the Tahun Ajaran save-confirmation modals use.
 */
type LegacyConfirmIconProps = { variant?: "danger" | "warning" }

const FILL = { danger: "#f8374b", warning: "#ffa800" } as const

const LegacyConfirmIcon = ({ variant = "danger" }: LegacyConfirmIconProps): JSX.Element => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="69"
		height="69"
		viewBox="0 0 69 69"
		aria-hidden="true"
		className="inline-block"
	>
		<rect width="69" height="69" fill="none" />
		<circle cx="28.5" cy="28.5" r="28.5" transform="translate(6 6)" fill={FILL[variant]} opacity="0.2" />
		<path
			d="M20.745,34.9a2.875,2.875,0,1,1-2.875,2.875A2.875,2.875,0,0,1,20.745,34.9Zm-4.051-3.254v-4.77h3.623a7.792,7.792,0,0,0,7.909-8.09,7.792,7.792,0,0,0-7.909-8.09c-4.649,0-7.849,3.5-7.849,8.09H7.336A12.746,12.746,0,0,1,20.317,5.922a12.861,12.861,0,1,1,0,25.72Z"
			transform="translate(13.755 11.104)"
			fill={FILL[variant]}
			fillRule="evenodd"
		/>
	</svg>
)

export default LegacyConfirmIcon
