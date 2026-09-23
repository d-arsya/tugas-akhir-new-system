import { useQuery, useQueryClient, type QueryClient, type UseQueryResult } from "@tanstack/react-query"

import type { AcademicYearDeleteStep, AcademicYearDeleteTarget, AdminRedirectResult } from "@roja/types"

import { useLegacyDeletePage, type LegacyDeletePageSubmit } from "@/hooks/use-legacy-delete-page"
import { adminApi } from "@/lib/api"

// Legacy `AcademicYearController` delete half: `showDeleteForm` / `destroy` and the three
// `showDelegate*Form` / `delegate*` pairs. It lives apart from the list and form hooks for the
// same reason the controller does — two workstreams, one base path, no shared file.
export const academicYearDeleteKeys = {
	all: ["admin-academic-year-delete"] as const,
	step: (id: number, step: AcademicYearDeleteTarget) => [...academicYearDeleteKeys.all, id, step] as const,
}

/** The three steps that move rows; `delete` is the plain confirm. */
export type AcademicYearDelegateStep = Exclude<AcademicYearDeleteTarget, "delete">

const DELEGATE: Record<AcademicYearDelegateStep, (id: number) => Promise<AdminRedirectResult>> = {
	"delegate-registrant": (id) => adminApi.delegateAcademicYearRegistrant(id),
	"delegate-student": (id) => adminApi.delegateAcademicYearStudent(id),
	"delegate-alumni": (id) => adminApi.delegateAcademicYearAlumni(id),
}

/**
 * Legacy navigated away with a full page load, so nothing re-fetched the page it left.
 * Marking the cache stale without refetching does the same: the year may be gone, and a
 * refetch fired while the navigation is in flight would 404 behind the success toast.
 */
const markStale = (queryClient: QueryClient): Promise<void> =>
	Promise.all([
		queryClient.invalidateQueries({ queryKey: academicYearDeleteKeys.all, refetchType: "none" }),
		queryClient.invalidateQueries({ queryKey: ["admin-academic-years"], refetchType: "none" }),
	]).then(() => undefined)

export const useAcademicYearDeleteStep = (
	id: number,
	step: AcademicYearDeleteTarget,
): UseQueryResult<AcademicYearDeleteStep> =>
	useQuery({
		queryKey: academicYearDeleteKeys.step(id, step),
		queryFn: () => adminApi.getAcademicYearDeleteStep(id, step),
		enabled: Number.isFinite(id),
		// The step is a snapshot of what the row looked like when the list rendered
		staleTime: 0,
		retry: false,
	})

/** `academic-year/delete/delete.blade.php` — the plain confirm, driven by `delegate-ajax.js`. */
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

/** One of the three delegation steps; the server answers where the chain goes next. */
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
