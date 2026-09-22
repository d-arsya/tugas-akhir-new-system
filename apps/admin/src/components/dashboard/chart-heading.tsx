import type { JSX } from "react"

type ChartHeadingProps = {
	icon: "primary" | "secondary"
	title: string
}

// Legacy `.tbr_chart_heading` + `h3.tbr_card_title.my-0`. "!" beats globals.css h3 (outside any @layer)
const ChartHeading = ({ icon, title }: ChartHeadingProps): JSX.Element => (
	<div className="flex items-center justify-start">
		<img className="mr-[8px]" src={`/assets/svg/icons/heading_${icon}_chart.svg`} alt={`${icon} chart`} />
		<div>
			<h3 className="my-0! text-[20px]! leading-[1.4rem]!">{title}</h3>
		</div>
	</div>
)

export default ChartHeading
