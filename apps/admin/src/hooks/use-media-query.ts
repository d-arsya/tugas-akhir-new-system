import { useEffect, useState } from "react"

export const useMediaQuery = (query: string): boolean => {
	const [matches, setMatches] = useState<boolean>(() =>
		typeof window !== "undefined" ? window.matchMedia(query).matches : false,
	)

	useEffect(() => {
		const media = window.matchMedia(query)
		const onChange = (): void => setMatches(media.matches)
		onChange()
		media.addEventListener("change", onChange)
		return () => media.removeEventListener("change", onChange)
	}, [query])

	return matches
}

export const useIsDesktop = (): boolean => useMediaQuery("(min-width: 768px)")
