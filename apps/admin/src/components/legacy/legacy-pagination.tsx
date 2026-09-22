import type { JSX } from "react"

import { cn } from "@roja/utils"

type LegacyPaginationProps = {
	// 1-based
	page: number
	pages: number
	onChange: (page: number) => void
}

const ELLIPSIS = "ellipsis"

// DataTables `simple_numbers` with the default 7 buttons (0-based internally, like `_numbers`)
export const pageNumbers = (page: number, pages: number): (number | typeof ELLIPSIS)[] => {
	const current = page - 1
	const range = (from: number, to: number): number[] => Array.from({ length: to - from }, (_, i) => from + i)
	if (pages <= 7) return range(0, pages).map((n) => n + 1)
	if (current <= 3) return [...range(0, 5).map((n) => n + 1), ELLIPSIS, pages]
	if (current >= pages - 1 - 3) return [1, ELLIPSIS, ...range(pages - 5, pages).map((n) => n + 1)]
	return [1, ELLIPSIS, current, current + 1, current + 2, ELLIPSIS, pages]
}

// Legacy paginate icons (assets/js/report/*-datatable.js `nextIcon` / `previousIcon`)
const ChevronIcon = ({ previous }: { previous?: boolean }): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
		<g transform={previous ? "translate(20 20.378) rotate(180)" : "translate(0 -0.378)"}>
			<rect width="20" height="20" transform="translate(0 20.378) rotate(-90)" fill="#c4c6c8" opacity="0" />
			<path
				d="M9.849,16.883A.849.849,0,0,1,9.2,15.49L13,10.939,9.331,6.38A.868.868,0,1,1,10.7,5.31L14.8,10.4a.849.849,0,0,1,0,1.078l-4.245,5.094A.849.849,0,0,1,9.849,16.883Z"
				transform="translate(-1.358 -0.75)"
				fill="#c4c6c8"
			/>
		</g>
	</svg>
)

const LINK_CLASS =
	"relative ml-[-1px] inline-flex h-[34px] w-[34px] items-center justify-center rounded-[5px] border-0 p-0 text-[12px] leading-[15px]"

// Port of the DataTables bootstrap4 pager restyled by public/assets/css/datatable.css
const LegacyPagination = ({ page, pages, onChange }: LegacyPaginationProps): JSX.Element => {
	const total = Math.max(pages, 1)
	const item = (key: string, content: JSX.Element | number | string, target: number | null, state: "active" | "disabled" | "idle"): JSX.Element => (
		<li key={key} className="ml-[8px] pb-0">
			<a
				href="#"
				aria-current={state === "active" ? "page" : undefined}
				onClick={(event) => {
					event.preventDefault()
					if (target !== null && state === "idle") onChange(target)
				}}
				className={cn(
					LINK_CLASS,
					state === "active"
						? "z-[3] cursor-default bg-[var(--primary)] text-white shadow-[0px_8px_10px_0px_rgba(228,0,126,0.25)]"
						: "bg-[var(--bg-inverse)] text-[var(--body-txt-inverse)]",
					state === "disabled" ? "pointer-events-none cursor-default opacity-30" : state === "idle" && "cursor-pointer",
				)}
			>
				{content}
			</a>
		</li>
	)

	return (
		<div className="mt-[15px] text-center min-[768px]:text-right">
			<ul className="m-0 mt-[20px] mb-[2px] flex list-none justify-center p-0 whitespace-nowrap min-[768px]:justify-end">
				{item("previous", <ChevronIcon previous />, page - 1, page <= 1 ? "disabled" : "idle")}
				{pageNumbers(page, total).map((entry, index) =>
					entry === ELLIPSIS
						? item(`ellipsis-${index}`, "…", null, "disabled")
						: item(String(entry), entry, entry, entry === page ? "active" : "idle"),
				)}
				{item("next", <ChevronIcon />, page + 1, page >= total ? "disabled" : "idle")}
			</ul>
		</div>
	)
}

export default LegacyPagination
