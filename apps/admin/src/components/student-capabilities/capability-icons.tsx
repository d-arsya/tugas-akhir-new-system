import type { JSX } from "react"

// Inline SVGs the Kesanggupan blades write by hand, transcribed verbatim. The shared ones
// (`InfoCircleIcon`, `BackArrowIcon`, `ChevronActionIcon`) come from the legacy kit instead.

/**
 * `.tbr_academic_year_action` (app.css 3022-3042) — the pink pill the drill-down icons sit in.
 * Legacy's hover rule fills `#Path_295`, `#Path_954`, `#Rectangle_2779` and `#Rectangle_1086`
 * white **by id**, which skips the transparent backing rect; the icons below tag exactly those
 * shapes with `.cap-fill` so the hover reaches the same ones.
 */
export const CAPABILITY_ACTION_CLASS =
	"inline-block rounded-[7px] bg-[#fae3f0] p-[7px] align-middle transition-all duration-300 hover:bg-[var(--primary)] hover:shadow-[0px_8px_10px_0px_rgba(228,0,126,0.25)] [&:hover_.cap-fill]:fill-white"

/** `StudentCapabilityService::getActionCapability()` — the level-3 "list" glyph. */
export const ListActionIcon = (): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
		<rect width="24" height="24" fill="none" />
		<rect className="cap-fill" width="16" height="3" rx="1.5" transform="translate(4 5)" fill="#e4007e" />
		<path
			className="cap-fill"
			d="M5.5,15h13a1.5,1.5,0,0,1,0,3H5.5a1.5,1.5,0,0,1,0-3Zm0-5h13a1.5,1.5,0,0,1,0,3H5.5a1.5,1.5,0,0,1,0-3Z"
			fill="#e4007e"
			fillRule="evenodd"
			opacity="0.3"
		/>
	</svg>
)

/** `Grade::studentCapabilityAction()` / `StudentCostService::action()` — the level-1/2 arrow. */
export const ArrowActionIcon = (): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
		<path d="M24,0H0V24H24Z" fill="none" fillRule="evenodd" />
		<rect
			className="cap-fill"
			width="2"
			height="13.961"
			rx="1"
			transform="translate(5.039 13) rotate(-90)"
			fill="#e4007e"
			opacity="0.3"
		/>
		<path
			className="cap-fill"
			d="M1.707.293A1,1,0,0,0,.293,1.71l6,6.01a1,1,0,0,0,1.383.03l6-5.509A1,1,0,0,0,12.324.764L7.03,5.625Z"
			transform="translate(10.991 19) rotate(-90)"
			fill="#e4007e"
		/>
	</svg>
)

/** `student-capability.blade.php:49-54` — the red warning triangle of "Belum ada kesanggupan". */
export const WarningTriangleIcon = (): JSX.Element => (
	<svg className="mr-[8px] shrink-0" xmlns="http://www.w3.org/2000/svg" width="37" height="37" viewBox="0 0 37 37" aria-hidden="true">
		<rect width="37" height="37" fill="none" />
		<path
			d="M15.593,4.768,2.891,27.632a1.523,1.523,0,0,0,1.331,2.262H30.9a1.523,1.523,0,0,0,1.3-2.317L18.223,4.714a1.523,1.523,0,0,0-2.63.055Z"
			transform="translate(1.411 2.083)"
			fill="#f8374b"
			fillRule="evenodd"
			opacity="0.3"
		/>
		<rect width="3" height="10" rx="1" transform="translate(17 14)" fill="#f8374b" />
		<rect width="3" height="3" rx="1" transform="translate(17 26)" fill="#f8374b" />
	</svg>
)

/** `student-capability.blade.php:69-74` and `:83-88` — the clipboard tick, red or green. */
export const ClipboardCheckIcon = ({ color }: { color: "#f8374b" | "#28af52" }): JSX.Element => (
	<svg className="mr-[8px] shrink-0" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">
		<rect width="36" height="36" fill="none" />
		<path
			d="M10,3v.75A2.25,2.25,0,0,0,12.25,6h7.5A2.25,2.25,0,0,0,22,3.75V3h3a3,3,0,0,1,3,3V30a3,3,0,0,1-3,3H7a3,3,0,0,1-3-3V6A3,3,0,0,1,7,3Z"
			transform="translate(2 1.5)"
			fill={color}
			fillRule="evenodd"
			opacity="0.3"
		/>
		<path
			d="M12.312,18.625a1.419,1.419,0,0,1-1.006-.431L8.431,15.319a1.423,1.423,0,0,1,2.013-2.012l1.869,1.869,4.744-4.744a1.423,1.423,0,0,1,2.013,2.013l-5.75,5.75A1.419,1.419,0,0,1,12.312,18.625Z"
			transform="translate(4 5)"
			fill={color}
			fillRule="evenodd"
		/>
		<path
			d="M12,2.5a1.5,1.5,0,0,1,3,0h2.25a.75.75,0,0,1,.75.75v1.5a.75.75,0,0,1-.75.75H9.75A.75.75,0,0,1,9,4.75V3.25a.75.75,0,0,1,.75-.75Z"
			transform="translate(4.5 0.5)"
			fill={color}
			fillRule="evenodd"
		/>
	</svg>
)

/** `capability-item.blade.php:65-69` — the white printer on the secondary button. */
export const PrintIcon = (): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
		<rect width="24" height="24" fill="none" />
		<path
			d="M16,17v4a1,1,0,0,1-1,1H9a1,1,0,0,1-1-1V17H5a2,2,0,0,1-2-2V8A2,2,0,0,1,5,6H19a2,2,0,0,1,2,2v7a2,2,0,0,1-2,2Zm1.5-6A1.5,1.5,0,1,0,16,9.5,1.5,1.5,0,0,0,17.5,11ZM10,14v6h4V14Z"
			fill="#fff"
			fillRule="evenodd"
		/>
		<rect width="8" height="2" rx="1" transform="translate(8 2)" fill="#fff" opacity="0.3" />
	</svg>
)

/** `capability-item.blade.php:75-79` — the white cloud-download on the danger button. */
export const DownloadIcon = (): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
		<path d="M0,0H24V24H0Z" fill="none" fillRule="evenodd" />
		<path
			d="M5.747,13.043A6,6,0,1,1,14.811,6.5H17.25a3.75,3.75,0,0,1,0,7.5h-9A3.736,3.736,0,0,1,5.747,13.043Z"
			fill="#fff"
			fillRule="evenodd"
			opacity="0.3"
		/>
		<path
			d="M11.129,15.734V17.69H9.121a.5.5,0,0,0-.5.5v1.023a.5.5,0,0,0,.5.5h2.008V21.67a.5.5,0,0,0,.823.382l3.506-2.968a.5.5,0,0,0,0-.763l-3.506-2.968a.5.5,0,0,0-.823.382Z"
			transform="translate(30.621 6.702) rotate(90)"
			fill="#fff"
		/>
	</svg>
)

/** `capability-item.blade.php:83-87` — the double tick on "Telah Disepakati". */
export const ApproveIcon = (): JSX.Element => (
	<svg className="mr-[4px]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
		<path d="M0,0H24V24H0Z" fill="none" fillRule="evenodd" />
		<path
			d="M9.262,16.648a1,1,0,1,1-1.524-1.3l8.5-10a1,1,0,0,1,1.426-.1l4.5,4a1,1,0,0,1-1.329,1.495L17.1,7.427Z"
			transform="translate(30 22) rotate(180)"
			fill="#fff"
			opacity="0.3"
		/>
		<path
			d="M4.262,17.648a1,1,0,1,1-1.524-1.3l8.5-10a1,1,0,0,1,1.426-.1l4.5,4a1,1,0,1,1-1.329,1.495L12.1,8.427Z"
			transform="translate(20 24) rotate(180)"
			fill="#fff"
		/>
	</svg>
)
