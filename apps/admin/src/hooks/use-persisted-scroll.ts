import { useCallback, useEffect, useRef, type RefObject, type UIEvent } from "react"

const readPosition = (key: string): number | null => {
	try {
		const value = localStorage.getItem(key)
		return value === null ? null : Number(value)
	} catch {
		return null
	}
}

export const usePersistedScroll = <T extends HTMLElement>(
	key: string,
): { ref: RefObject<T | null>; onScroll: (event: UIEvent<T>) => void } => {
	const ref = useRef<T>(null)

	useEffect(() => {
		const position = readPosition(key)
		if (ref.current && position !== null && !Number.isNaN(position)) {
			ref.current.scrollTop = position
		}
	}, [key])

	const onScroll = useCallback(
		(event: UIEvent<T>): void => {
			try {
				localStorage.setItem(key, String(event.currentTarget.scrollTop))
			} catch {
				// Storage unavailable (private mode); scroll position simply isn't remembered
			}
		},
		[key],
	)

	return { ref, onScroll }
}
