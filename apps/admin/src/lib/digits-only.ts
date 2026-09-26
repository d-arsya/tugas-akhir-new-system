import type { KeyboardEvent } from "react"

export const digitsOnly = (event: KeyboardEvent<HTMLInputElement>): void => {
	if (event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1) return
	if (!/[0-9]/.test(event.key)) event.preventDefault()
}
