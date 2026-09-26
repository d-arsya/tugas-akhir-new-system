const injected = new Set<string>()

export const ensureLegacyStyle = (id: string, css: string): void => {
	if (typeof document === "undefined" || injected.has(id)) return
	injected.add(id)
	const style = document.createElement("style")
	style.id = id
	style.textContent = css
	document.head.append(style)
}
