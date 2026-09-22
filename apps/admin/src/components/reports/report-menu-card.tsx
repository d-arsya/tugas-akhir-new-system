import type { JSX } from "react"
import { Link } from "@tanstack/react-router"

import { legacyButtonClass } from "@/components/legacy/legacy-button"

type ReportMenuCardProps = {
	to: "/reports/income" | "/reports/arrears"
	icon: string
	title: string
	description: string
}

const ArrowIcon = (): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<path d="M24,0H0V24H24Z" fill="none" fillRule="evenodd" />
		<rect width="2" height="13.961" rx="1" transform="translate(5.039 13) rotate(-90)" fill="#FFFFFF" opacity="0.3" />
		<path
			d="M1.707.293A1,1,0,0,0,.293,1.71l6,6.01a1,1,0,0,0,1.383.03l6-5.509A1,1,0,0,0,12.324.764L7.03,5.625Z"
			transform="translate(10.991 19) rotate(-90)"
			fill="#FFFFFF"
		/>
	</svg>
)

// Port of the `a.card.tbr_card.h-100` menu entries in report/index.blade.php
const ReportMenuCard = ({ to, icon, title, description }: ReportMenuCardProps): JSX.Element => (
	<Link to={to} className="block h-full rounded-[4px] text-[var(--secondary)]">
		<div className="relative h-full rounded-[12px] bg-[var(--bg-secondary)] p-[20px] shadow-[0px_8px_30px_0px_rgba(0,0,0,0.08)]">
			<div className="flex">
				<div className="mr-[16px] shrink-0">
					<img src={icon} alt="icon" className="h-[60px] w-[60px]" />
				</div>
				<div className="mb-[16px]">
					{/* "!" utilities: globals.css styles h6 outside any @layer */}
					<h6 className="my-[10px]! text-[16px]! leading-[22.4px]! font-bold! tracking-normal! text-[#ffc107]!">{title}</h6>
					<p className="m-0 mb-[20px] text-[12px] leading-[20.4px] text-[#999999]">{description}</p>
				</div>
			</div>
			<div className="absolute right-0 bottom-0 p-[16px]">
				<span className={legacyButtonClass("secondary", "ml-[8px] h-[40px] w-[40px] p-[8px]")}>
					<ArrowIcon />
				</span>
			</div>
		</div>
	</Link>
)

export default ReportMenuCard
