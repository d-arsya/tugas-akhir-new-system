// Tiny `<style>` injector for the handful of legacy keyframes/@font-face rules Tailwind cannot express.
// globals.css is shared, so each legacy component ships the CSS it needs and registers it once.

const injected = new Set<string>()

export const ensureLegacyStyle = (id: string, css: string): void => {
	if (typeof document === "undefined" || injected.has(id)) return
	injected.add(id)
	const style = document.createElement("style")
	style.id = id
	style.textContent = css
	document.head.append(style)
}
