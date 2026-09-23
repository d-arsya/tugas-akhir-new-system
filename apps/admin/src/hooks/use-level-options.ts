import { useQuery, type UseQueryResult } from "@tanstack/react-query"

import type { LevelOption } from "@roja/types"

import { adminApi } from "@/lib/api"

/**
 * The Jenjang picker both Akademik forms need (`GET /admin/levels/options`).
 *
 * Legacy fetches it twice with two different orders: `MajorController@index` does
 * `Level::get()` (insertion order, which is id order in this database) while
 * `GradeController@index` does `Level::latest()->get()` (created_at DESC — and every
 * level's created_at ascends with its id, so id DESC reproduces it). The endpoint has
 * no `order` parameter, so the order is applied here, per page.
 *
 * WS-3 owns this file only because the contract offers no shared levels hook yet; it
 * belongs next to WS-2's Jenjang queries once those land.
 */
export const levelOptionKeys = {
	all: ["admin-levels"] as const,
	options: () => [...levelOptionKeys.all, "options"] as const,
}

export type LevelOptionOrder = "id-asc" | "id-desc"

const ordered = (rows: LevelOption[], order: LevelOptionOrder): LevelOption[] =>
	[...rows].sort((a, b) => (order === "id-asc" ? a.id - b.id : b.id - a.id))

export const useLevelOptions = (order: LevelOptionOrder): UseQueryResult<LevelOption[]> =>
	useQuery({
		queryKey: levelOptionKeys.options(),
		queryFn: () => adminApi.getLevelOptions(),
		select: (rows) => ordered(rows, order),
	})
