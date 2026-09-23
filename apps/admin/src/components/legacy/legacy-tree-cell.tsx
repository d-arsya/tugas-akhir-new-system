import type { JSX, ReactNode } from "react"

/**
 * The indented account name in the Akun tree (`AccountancyService::getName`).
 *
 * Legacy's indentation is not `depth * n`; it is three distinct branches:
 *   level 0  → plain text, no icon
 *   level 1  → the Child.svg dash, then a 15px gap
 *   level n>1 → the same dash pushed right by `35 + 40 * (n - 2)` px, then the 15px gap
 *
 * Phase 2 (Akun) is the only consumer, but it lives in the shared kit so the Akun and
 * Biaya Santri workstreams cannot end up with two different versions.
 */
type LegacyTreeCellProps = {
	level: number
	children: ReactNode
}

const LegacyTreeCell = ({ level, children }: LegacyTreeCellProps): JSX.Element => {
	if (level === 0) return <>{children}</>

	const marginLeft = level > 1 ? 35 + 40 * (level - 2) : 0

	return (
		<>
			{/*
			 * Two details that are only visible against the legacy render:
			 *  1. Tailwind's preflight sets `img { display: block }`, which drops the dash onto its own
			 *     line above the name. Bootstrap's reboot leaves it inline (`vertical-align: middle`).
			 *  2. `getName` emits `…alt='Detail'> <span …>` — a literal space, worth 3.73px at 12px Open
			 *     Sans on top of the 15px margin, for 18.73px in total. `{" "}` is the only way to keep
			 *     it: an adjacent newline is a whitespace-only text node and JSX discards it. It also
			 *     means the cell must not be laid out as a flex row, which would discard it again.
			 */}
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
