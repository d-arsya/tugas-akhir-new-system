import { useEffect, useState } from "react"

export const useDarkMode = (): { isDark: boolean; toggle: () => void } => {
	const [isDark, setIsDark] = useState<boolean>(() => {
		if (typeof window === "undefined") return false
		return localStorage.getItem("roja-theme") === "dark"
	})

	useEffect(() => {
		const html = document.documentElement
		if (isDark) {
			html.setAttribute("data-theme", "dark")
			localStorage.setItem("roja-theme", "dark")
		} else {
			html.removeAttribute("data-theme")
			localStorage.setItem("roja-theme", "light")
		}
	}, [isDark])

	const toggle = (): void => setIsDark((prev) => !prev)

	return { isDark, toggle }
}
