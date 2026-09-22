import { useMemo, useState, type KeyboardEvent } from "react"

export type LegacySelectOption = { value: string; label: string }

// select2 behaviour: opening resets the search and highlights the selected option;
// arrow keys move the highlight, Enter picks it
export const useLegacySelect = (
	options: LegacySelectOption[],
	value: string,
	onChange: (value: string) => void,
): {
	open: boolean
	setOpen: (open: boolean) => void
	search: string
	setSearch: (search: string) => void
	filtered: LegacySelectOption[]
	highlighted: string | null
	setHighlighted: (value: string) => void
	select: (value: string) => void
	onSearchKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
} => {
	const [open, setOpenState] = useState(false)
	const [search, setSearchState] = useState("")
	const [highlighted, setHighlighted] = useState<string | null>(null)

	const filtered = useMemo(() => {
		const query = search.trim().toLowerCase()
		return query ? options.filter((o) => o.label.toLowerCase().includes(query)) : options
	}, [options, search])

	const setOpen = (next: boolean): void => {
		setOpenState(next)
		if (next) {
			setSearchState("")
			setHighlighted(value)
		}
	}

	const setSearch = (next: string): void => {
		setSearchState(next)
		const query = next.trim().toLowerCase()
		const first = options.find((o) => o.label.toLowerCase().includes(query))
		setHighlighted(first ? first.value : null)
	}

	const select = (next: string): void => {
		setOpenState(false)
		if (next !== value) onChange(next)
	}

	const onSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
		const index = filtered.findIndex((o) => o.value === highlighted)
		if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			event.preventDefault()
			const step = event.key === "ArrowDown" ? 1 : -1
			const next = filtered[Math.min(Math.max(index + step, 0), filtered.length - 1)]
			if (next) setHighlighted(next.value)
		} else if (event.key === "Enter" && highlighted !== null) {
			event.preventDefault()
			select(highlighted)
		}
	}

	return { open, setOpen, search, setSearch, filtered, highlighted, setHighlighted, select, onSearchKeyDown }
}
