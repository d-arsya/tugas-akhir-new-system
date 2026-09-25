import type { JSX } from "react"

import type { EwalletWidget } from "@roja/types"
import { cn } from "@roja/utils"

import { rupiahDots } from "@/lib/legacy-format"
import { RIPPLE_CLASS, triggerRipple } from "@/lib/ripple"

import { RupiahIcon } from "./ewallet-icons"

// `span.tbr_widget.tbr_widget-{info|primary|secondary}[anim=ripple]` (public/assets/css/widget.css).
// The blades give it `p-3` (Bootstrap's `!important`, so 16px instead of `.tbr_widget`'s 25px).

const VARIANT = {
	info: "bg-[var(--info)] shadow-[0px_8px_10px_0px_rgba(var(--info-rgb),0.25)]",
	primary: "bg-[var(--primary)] shadow-[0px_8px_10px_0px_rgba(var(--primary-rgb),0.25)]",
	secondary: "bg-[var(--secondary)] shadow-[0px_8px_10px_0px_rgba(var(--secondary-rgb),0.25)]",
} as const

type TileProps = { variant: keyof typeof VARIANT; value: string; label: string; className?: string }

/** The tile itself: rupiah icon in a 60px tinted square, the figure in bold 20px, the caption under it. */
export const EwalletTile = ({ variant, value, label, className }: TileProps): JSX.Element => (
	<span
		onClick={triggerRipple}
		className={cn(
			"relative flex h-auto w-full flex-row flex-nowrap items-center rounded-[12px] bg-[url('/assets/svg/etc/Widget-Bg.svg')] bg-contain bg-right-bottom bg-no-repeat p-[16px] text-[var(--light)] transition-all duration-300 hover:shadow-none focus:shadow-none active:shadow-none",
			RIPPLE_CLASS,
			VARIANT[variant],
			className,
		)}
	>
		<div className="mr-[20px] flex h-[60px] w-[60px] items-center justify-center rounded-[10px] bg-white/10">
			<RupiahIcon />
		</div>
		<div>
			<div className="mt-[7px] mb-[8px] text-[20px] font-bold">{value}</div>
			<div>{label}</div>
		</div>
	</span>
)

/**
 * The three tiles above the Akun Dompet table (`index.blade.php`, `.tbr_dashboard.row`):
 * `col-lg-4` with `px-lg-3`, `px-lg-1`, `px-lg-3`. The figures start at `0` and are replaced by
 * `ewallet-widget-ajax.js` once the answer lands; they are the **stored** balances.
 */
const EwalletWidgets = ({ widget }: { widget: EwalletWidget | undefined }): JSX.Element => (
	<div className="mx-[-15px] flex flex-wrap">
		<div className="w-full px-[15px] min-[992px]:w-1/3 min-[992px]:px-[16px]">
			<EwalletTile
				variant="info"
				value={rupiahDots(widget?.total ?? 0)}
				label="Total saldo keseluruhan"
				className="mb-[16px] min-[1200px]:mb-[24px]"
			/>
		</div>
		<div className="w-full px-[15px] min-[992px]:w-1/3 min-[992px]:px-[4px]">
			<EwalletTile
				variant="primary"
				value={rupiahDots(widget?.student ?? 0)}
				label="Total saldo santri"
				className="mb-[16px] min-[1200px]:mb-[24px]"
			/>
		</div>
		<div className="w-full px-[15px] min-[992px]:w-1/3 min-[992px]:px-[16px]">
			<EwalletTile
				variant="secondary"
				value={rupiahDots(widget?.merchant ?? 0)}
				label="Total saldo merchant"
				className="mb-[16px] min-[1200px]:mb-[24px]"
			/>
		</div>
	</div>
)

export default EwalletWidgets
