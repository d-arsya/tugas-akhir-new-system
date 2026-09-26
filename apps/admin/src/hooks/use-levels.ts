import { useMutation, useQuery, useQueryClient, type QueryClient, type UseMutationResult, type UseQueryResult } from "@tanstack/react-query"

import type {
	AdminMessageResult,
	AdminRedirectResult,
	LevelDelegatePayload,
	LevelDeleteStep,
	LevelDeleteTarget,
	LevelDetail,
	LevelPayload,
	LevelRow,
} from "@roja/types"

import { useLegacyDeletePage, type LegacyDeletePageSubmit } from "@/hooks/use-legacy-delete-page"
import { adminApi } from "@/lib/api"

export const levelKeys = {
	all: ["admin-levels"] as const,
	list: () => [...levelKeys.all, "list"] as const,
	options: () => [...levelKeys.all, "options"] as const,
	detail: (id: number) => [...levelKeys.all, "detail", id] as const,
	deleteStep: (id: number, step: LevelDeleteTarget) => [...levelKeys.all, "delete-step", id, step] as const,
}

export type LevelDelegateStep = Exclude<LevelDeleteTarget, "delete">

const DELEGATE: Record<LevelDelegateStep, (id: number, data: LevelDelegatePayload) => Promise<AdminRedirectResult>> = {
	"delegate-major": (id, data) => adminApi.delegateLevelMajor(id, data),
	"delegate-grade": (id, data) => adminApi.delegateLevelGrade(id, data),
	"delegate-registrant": (id, data) => adminApi.delegateLevelRegistrant(id, data),
	"delegate-student": (id, data) => adminApi.delegateLevelStudent(id, data),
}

const markStale = (queryClient: QueryClient): Promise<void> =>
	queryClient.invalidateQueries({ queryKey: levelKeys.all, refetchType: "none" })

export const useLevels = (): UseQueryResult<LevelRow[]> =>
	useQuery({ queryKey: levelKeys.list(), queryFn: () => adminApi.getLevelRows() })

export const useLevel = (id: number): UseQueryResult<LevelDetail> =>
	useQuery({ queryKey: levelKeys.detail(id), queryFn: () => adminApi.getLevel(id), enabled: Number.isFinite(id) })

export const useLevelDeleteStep = (id: number, step: LevelDeleteTarget): UseQueryResult<LevelDeleteStep> =>
	useQuery({
		queryKey: levelKeys.deleteStep(id, step),
		queryFn: () => adminApi.getLevelDeleteStep(id, step),
		enabled: Number.isFinite(id),
		staleTime: 0,
		retry: false,
	})

export const useCreateLevel = (): UseMutationResult<AdminMessageResult, Error, LevelPayload> => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (payload: LevelPayload) => adminApi.createLevel(payload),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: levelKeys.all }),
	})
}

export const useUpdateLevel = (id: number): UseMutationResult<AdminMessageResult, Error, LevelPayload> => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (payload: LevelPayload) => adminApi.updateLevel(id, payload),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: levelKeys.all }),
	})
}

export const useDeleteLevel = (id: number): LegacyDeletePageSubmit<void> => {
	const queryClient = useQueryClient()
	return useLegacyDeletePage<void>({
		mutationFn: async () => {
			const result = await adminApi.deleteLevel(id)
			await markStale(queryClient)
			return result
		},
	})
}

export const useDelegateLevel = (id: number, step: LevelDelegateStep): LegacyDeletePageSubmit<LevelDelegatePayload> => {
	const queryClient = useQueryClient()
	return useLegacyDeletePage<LevelDelegatePayload>({
		mutationFn: async (payload: LevelDelegatePayload) => {
			const result = await DELEGATE[step](id, payload)
			await markStale(queryClient)
			return result
		},
	})
}
