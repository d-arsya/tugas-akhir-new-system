import type { MouseEvent } from "react"

// Port of the legacy `[anim="ripple"]` effect (admin.pondokroja.com public/assets/css/app.css + js/app.js)
export const RIPPLE_CLASS =
	"relative overflow-hidden before:pointer-events-none before:absolute before:block before:rounded-full before:bg-white before:content-[''] before:top-[calc(var(--y)*1px)] before:left-[calc(var(--x)*1px)] before:w-[calc(var(--d)*1px)] before:h-[calc(var(--d)*1px)] before:opacity-[calc(var(--o,1)*0.3)] before:[transition:calc(var(--t,0)*600ms)_linear] before:[transform:translate(-50%,-50%)_scale(var(--s,1))] before:origin-center"

export const triggerRipple = (event: MouseEvent<HTMLElement>): void => {
	const el = event.currentTarget
	const rect = el.getBoundingClientRect()
	const diameter = Math.sqrt(rect.width ** 2 + rect.height ** 2) * 2
	el.style.cssText = "--s: 0; --o: 1;"
	// Force a reflow so the reset above is applied before the animated state
	void el.offsetTop
	el.style.cssText = `--t: 1; --o: 0; --d: ${diameter}; --x: ${event.clientX - rect.left}; --y: ${event.clientY - rect.top};`
}
