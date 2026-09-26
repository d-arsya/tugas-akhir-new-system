import { useQuery, useQueryClient, type QueryClient, type UseQueryResult } from "@tanstack/react-query"

import type { AcademicYearDeleteStep, AcademicYearDeleteTarget, AdminRedirectResult } from "@roja/types"

import { academicYearKeys } from "@/hooks/use-academic-years"
import { useLegacyDeletePage, type LegacyDeletePageSubmit } from "@/hooks/use-legacy-delete-page"
import { adminApi } from "@/lib/api"

export const academicYearDeleteKeys = {
	all: ["admin-academic-year-delete"] as const,
	step: (id: number, step: AcademicYearDeleteTarget) => [...academicYearDeleteKeys.all, id, step] as const,
}

export type AcademicYearDelegateStep = Exclude<AcademicYearDeleteTarget, "delete">

const DELEGATE: Record<AcademicYearDelegateStep, (id: number) => Promise<AdminRedirectResult>> = {
	"delegate-registrant": (id) => adminApi.delegateAcademicYearRegistrant(id),
	"delegate-student": (id) => adminApi.delegateAcademicYearStudent(id),
	"delegate-alumni": (id) => adminApi.delegateAcademicYearAlumni(id),
}

const markStale = (queryClient: QueryClient): Promise<void> =>
	Promise.all([
		queryClient.invalidateQueries({ queryKey: academicYearDeleteKeys.all, refetchType: "none" }),
		queryClient.invalidateQueries({ queryKey: academicYearKeys.all, refetchType: "none" }),
	]).then(() => undefined)

export const useAcademicYearDeleteStep = (
	id: number,
	step: AcademicYearDeleteTarget,
): UseQueryResult<AcademicYearDeleteStep> =>
	useQuery({
		queryKey: academicYearDeleteKeys.step(id, step),
		queryFn: () => adminApi.getAcademicYearDeleteStep(id, step),
		enabled: Number.isFinite(id),
		staleTime: 0,
		retry: false,
	})

export const useDeleteAcademicYear = (id: number): LegacyDeletePageSubmit<void> => {
	const queryClient = useQueryClient()
	return useLegacyDeletePage<void>({
		mutationFn: async () => {
			const result = await adminApi.deleteAcademicYear(id)
			await markStale(queryClient)
			return result
		},
	})
}

export const useDelegateAcademicYear = (
	id: number,
	step: AcademicYearDelegateStep,
): LegacyDeletePageSubmit<void> => {
	const queryClient = useQueryClient()
	return useLegacyDeletePage<void>({
		mutationFn: async () => {
			const result = await DELEGATE[step](id)
			await markStale(queryClient)
			return result
		},
	})
}
