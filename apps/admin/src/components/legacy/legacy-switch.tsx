import type { JSX } from "react"

import { cn } from "@roja/utils"

import { ensureLegacyStyle } from "./legacy-style"

// `@keyframes expand-on|expand-off` (porto/css/theme.css 12508-12560): the handle stretches 9px mid-travel
ensureLegacyStyle(
	"legacy-ios-switch",
	"@keyframes legacy-expand-on{0%{padding-right:0}40%{padding-right:9px}100%{padding-right:0}}" +
		"@keyframes legacy-expand-off{0%{padding-right:0;left:2px}40%{padding-right:9px;left:-7px}100%{padding-right:0;left:2px}}",
)

type LegacySwitchProps = { checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean; name?: string }

// Port of the ios7-switch markup built by the legacy jQuery plugin, sized by
// `.tbr_form_panel .tbr_fp_display .ios-switch` (app.css 2256-2292): 65x35 track, 36px fills, 30px handle
const LegacySwitch = ({ checked, onChange, disabled = false, name }: LegacySwitchProps): JSX.Element => (
	<label
		className={cn("m-0 inline-block h-[36px] align-middle", disabled ? "cursor-default opacity-50" : "cursor-pointer")}
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
		<span className="relative block h-[35px] w-[65px] rounded-[100px] bg-[var(--bg-inverse)] [backface-visibility:hidden]">
			{/* `.on-background.background-fill` — fades in over .3s (with a .2s delay when switching on) */}
			<span
				aria-hidden="true"
				className={cn(
					"absolute top-0 left-0 block h-[36px] w-full rounded-[100px] bg-[var(--secondary)]",
					checked ? "opacity-100 transition-[opacity] duration-300 delay-200" : "opacity-0 transition-[opacity] duration-300",
				)}
			/>
			{/* `.state-background.background-fill` — collapses to scale(0) to reveal the colour underneath */}
			<span
				aria-hidden="true"
				className={cn(
					"absolute top-0 left-0 z-[2] block h-[36px] w-full rounded-[36px] bg-[var(--bg-inverse)] transition-transform duration-[400ms]",
					checked ? "scale-0" : "scale-100 delay-[250ms]",
				)}
			/>
			{/* `.handle` — 30px, travels 30px right, with the legacy stretch animation */}
			<span
				aria-hidden="true"
				className={cn(
					"absolute top-[3px] z-[3] block h-[30px] w-[30px] rounded-[20px] bg-[var(--bg-form-border)] [box-sizing:content-box] [transition:transform_0.3s_0.25s_cubic-bezier(0.455,0.03,0.215,1.33)]",
					checked
						? "left-[2px] translate-x-[30px] [animation:legacy-expand-on_0.3s_0.2s]"
						: "left-[3px] translate-x-0 [animation:legacy-expand-off_0.3s_0.2s]",
				)}
			/>
		</span>
	</label>
)

export default LegacySwitch
