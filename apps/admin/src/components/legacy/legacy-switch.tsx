import type { JSX } from "react"

import { cn } from "@roja/utils"

import { ensureLegacyStyle } from "./legacy-style"

// `@keyframes expand-on|expand-off` (porto/css/theme.css 12508-12560): the handle stretches 9px mid-travel
ensureLegacyStyle(
	"legacy-ios-switch",
	"@keyframes legacy-expand-on{0%{padding-right:0}40%{padding-right:9px}100%{padding-right:0}}" +
		"@keyframes legacy-expand-off{0%{padding-right:0;left:2px}40%{padding-right:9px;left:-7px}100%{padding-right:0;left:2px}}",
)

/**
 * `default` is the form-builder switch, sized by `.tbr_form_panel .tbr_fp_display .ios-switch`
 * (app.css 2256-2292): 65×35 track, 36px fills, a 30px handle in `--bg-form-border`.
 *
 * `lg` is plain `.switch.switch-lg` as porto sizes it (theme.css 12407-12415, 12465-12476):
 * a 75×45 track and a **white** 41px handle. Tahun Ajaran's PSB and Akademik toggles use it.
 * In both cases the handle travels a fixed 30px — porto does not scale the translate.
 */
type LegacySwitchSize = "default" | "lg"

type LegacySwitchProps = {
	checked: boolean
	onChange: (checked: boolean) => void
	disabled?: boolean
	name?: string
	size?: LegacySwitchSize
}

const SIZES = {
	default: {
		label: "h-[36px]",
		track: "h-[35px] w-[65px]",
		fill: "h-[36px]",
		stateFill: "h-[36px] rounded-[36px]",
		handle: "top-[3px] h-[30px] w-[30px] bg-[var(--bg-form-border)]",
		handleOff: "left-[3px]",
	},
	lg: {
		label: "h-[45px]",
		track: "h-[45px] w-[75px]",
		fill: "h-full",
		stateFill: "h-full rounded-[100px]",
		handle: "top-[2px] h-[41px] w-[41px] bg-white",
		handleOff: "left-[2px]",
	},
} as const satisfies Record<LegacySwitchSize, Record<string, string>>

// Port of the ios7-switch markup built by the legacy jQuery plugin
const LegacySwitch = ({
	checked,
	onChange,
	disabled = false,
	name,
	size = "default",
}: LegacySwitchProps): JSX.Element => {
	const s = SIZES[size]

	return (
		<label
			className={cn(
				"m-0 inline-block align-middle",
				s.label,
				disabled ? "cursor-default opacity-50" : "cursor-pointer",
			)}
			// `.switch` wraps a `.d-none` checkbox; the plugin toggles `.on` / `.off` on the rendered switch
		>
			<input
				type="checkbox"
				name={name}
				checked={checked}
				disabled={disabled}
				onChange={(event) => onChange(event.target.checked)}
				className="hidden"
			/>
			<span
				className={cn(
					"relative block rounded-[100px] bg-[var(--bg-inverse)] [backface-visibility:hidden]",
					s.track,
				)}
			>
				{/* `.on-background.background-fill` — fades in over .3s (with a .2s delay when switching on) */}
				<span
					aria-hidden="true"
					className={cn(
						"absolute top-0 left-0 block w-full rounded-[100px] bg-[var(--secondary)]",
						s.fill,
						checked
							? "opacity-100 transition-[opacity] duration-300 delay-200"
							: "opacity-0 transition-[opacity] duration-300",
					)}
				/>
				{/* `.state-background.background-fill` — collapses to scale(0) to reveal the colour underneath */}
				<span
					aria-hidden="true"
					className={cn(
						"absolute top-0 left-0 z-[2] block w-full bg-[var(--bg-inverse)] transition-transform duration-[400ms]",
						s.stateFill,
						checked ? "scale-0" : "scale-100 delay-[250ms]",
					)}
				/>
				{/* `.handle` — travels a fixed 30px right, with the legacy stretch animation */}
				<span
					aria-hidden="true"
					className={cn(
						"absolute z-[3] block rounded-[20px] [box-sizing:content-box] [transition:transform_0.3s_0.25s_cubic-bezier(0.455,0.03,0.215,1.33)]",
						s.handle,
						checked
							? "left-[2px] translate-x-[30px] [animation:legacy-expand-on_0.3s_0.2s]"
							: cn(s.handleOff, "translate-x-0 [animation:legacy-expand-off_0.3s_0.2s]"),
					)}
				/>
			</span>
		</label>
	)
}

export default LegacySwitch
