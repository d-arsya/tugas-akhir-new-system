import { useCallback, useEffect, useMemo, useState } from "react"

import { findActiveChain, type SidebarMenuItem } from "@/components/layout/sidebar-menu"

type OpenMap = Record<string, string | null>

// Every item in the active chain is marked expanded under its parent, like legacy pages
// adding `nav-expanded` to their menu ancestors on load
const chainToOpenMap = (chain: string[]): OpenMap => {
	const map: OpenMap = {}
	chain.forEach((key, index) => {
		map[index === 0 ? "root" : (chain[index - 1] ?? "root")] = key
	})
	return map
}

export const useSidebarNav = (
	items: SidebarMenuItem[],
	pathname: string,
): {
	activeChain: string[]
	openMap: OpenMap
	toggle: (parentKey: string, key: string) => void
} => {
	const activeChain = useMemo(() => findActiveChain(items, pathname), [items, pathname])
	const chainKey = activeChain.join(">")
	const [openMap, setOpenMap] = useState<OpenMap>(() => chainToOpenMap(activeChain))

	useEffect(() => {
		setOpenMap(chainToOpenMap(chainKey ? chainKey.split(">") : []))
	}, [chainKey])

	// Accordion: opening an item collapses its expanded sibling
	const toggle = useCallback((parentKey: string, key: string): void => {
		setOpenMap((prev) => ({ ...prev, [parentKey]: prev[parentKey] === key ? null : key }))
	}, [])

	return { activeChain, openMap, toggle }
}
