import type { JSX } from "react"

type EwalletErrorAlertProps = { lines: string[] }

const EwalletErrorAlert = ({ lines }: EwalletErrorAlertProps): JSX.Element => (
	<div role="alert" className="relative mt-[8px] mb-0 rounded-[8px] border-0 bg-[rgba(248,55,75,0.1)] px-[20px] py-[12px] text-center font-bold text-[var(--danger)]">
		{lines.map((line, index) => (
			<span key={index}>
				{line}
				<br />
			</span>
		))}
	</div>
)

export default EwalletErrorAlert
