import { useQuery, type UseQueryResult } from "@tanstack/react-query"

import type { LevelOption } from "@roja/types"

import { levelKeys } from "@/hooks/use-levels"
import { adminApi } from "@/lib/api"

export type LevelOptionOrder = "id-asc" | "id-desc"

const ordered = (rows: LevelOption[], order: LevelOptionOrder): LevelOption[] =>
	[...rows].sort((a, b) => (order === "id-asc" ? a.id - b.id : b.id - a.id))

export const useLevelOptions = (order: LevelOptionOrder): UseQueryResult<LevelOption[]> =>
	useQuery({
		queryKey: levelKeys.options(),
		queryFn: () => adminApi.getLevelOptions(),
		select: (rows) => ordered(rows, order),
	})
