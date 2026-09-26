import type { JSX, ReactNode } from "react"

type LegacyTreeCellProps = {
	level: number
	children: ReactNode
}

const LegacyTreeCell = ({ level, children }: LegacyTreeCellProps): JSX.Element => {
	if (level === 0) return <>{children}</>

	const marginLeft = level > 1 ? 35 + 40 * (level - 2) : 0

	return (
		<>
			<img
				src="/assets/svg/icons/Child.svg"
				alt=""
				aria-hidden="true"
				className="inline align-middle"
				style={{ marginLeft }}
			/>{" "}
			<span style={{ marginLeft: 15 }}>{children}</span>
		</>
	)
}

export default LegacyTreeCell
