import {
	useMutation,
	useQuery,
	useQueryClient,
	type UseMutationResult,
	type UseQueryResult,
} from "@tanstack/react-query"

import type {
	CapabilityAcademicYearRow,
	CapabilityGradeRow,
	CapabilityHistoryRow,
	CapabilityItemPage,
	CapabilityItemRow,
	CapabilitySelectionDto,
	CapabilitySelectionResult,
	CapabilityStudentPage,
	CapabilityStudentRow,
} from "@roja/types"

import { adminApi } from "@/lib/api"

// Queries behind Kesanggupan's five drill-down pages (legacy `StudentCapabilityController`
// @academicYearList, @gradeList, @capabilityList, @studentCapability(List), @studentCapabilityItem(List)).
// Every list is complete rather than paged — legacy pages all of them in the browser.
export const studentCapabilityKeys = {
	all: ["admin-student-capabilities"] as const,
	years: () => [...studentCapabilityKeys.all, "years"] as const,
	grades: (academicYearId: number) => [...studentCapabilityKeys.all, "grades", academicYearId] as const,
	students: (academicYearId: number, gradeId: number) =>
		[...studentCapabilityKeys.all, "students", academicYearId, gradeId] as const,
	studentPage: (studentGradeId: number) => [...studentCapabilityKeys.all, "student", studentGradeId] as const,
	history: (studentGradeId: number) => [...studentCapabilityKeys.all, "history", studentGradeId] as const,
	itemPage: (capabilityId: number, studentGradeId: number) =>
		[...studentCapabilityKeys.all, "item-page", capabilityId, studentGradeId] as const,
	items: (capabilityId: number, studentGradeId: number) =>
		[...studentCapabilityKeys.all, "items", capabilityId, studentGradeId] as const,
}

export const useCapabilityAcademicYears = (): UseQueryResult<CapabilityAcademicYearRow[]> =>
	useQuery({ queryKey: studentCapabilityKeys.years(), queryFn: () => adminApi.getCapabilityAcademicYears() })

export const useCapabilityGrades = (academicYearId: number): UseQueryResult<CapabilityGradeRow[]> =>
	useQuery({
		queryKey: studentCapabilityKeys.grades(academicYearId),
		queryFn: () => adminApi.getCapabilityGrades(academicYearId),
	})

/**
 * Level 3. The API answers 422 when the grade has no applied cost term — legacy's `@capability`
 * guard, which redirected to level 2 — so this never retries: the page reacts to the first error.
 */
export const useCapabilityStudents = (academicYearId: number, gradeId: number): UseQueryResult<CapabilityStudentRow[]> =>
	useQuery({
		queryKey: studentCapabilityKeys.students(academicYearId, gradeId),
		queryFn: () => adminApi.getCapabilityStudents(academicYearId, gradeId),
		retry: false,
	})

export const useCapabilityStudentPage = (studentGradeId: number): UseQueryResult<CapabilityStudentPage> =>
	useQuery({
		queryKey: studentCapabilityKeys.studentPage(studentGradeId),
		queryFn: () => adminApi.getCapabilityStudentPage(studentGradeId),
	})

export const useCapabilityHistory = (studentGradeId: number): UseQueryResult<CapabilityHistoryRow[]> =>
	useQuery({
		queryKey: studentCapabilityKeys.history(studentGradeId),
		queryFn: () => adminApi.getCapabilityHistory(studentGradeId),
	})

export const useCapabilityItemPage = (capabilityId: number, studentGradeId: number): UseQueryResult<CapabilityItemPage> =>
	useQuery({
		queryKey: studentCapabilityKeys.itemPage(capabilityId, studentGradeId),
		queryFn: () => adminApi.getCapabilityItemPage(capabilityId, studentGradeId),
	})

export const useCapabilityItems = (capabilityId: number, studentGradeId: number): UseQueryResult<CapabilityItemRow[]> =>
	useQuery({
		queryKey: studentCapabilityKeys.items(capabilityId, studentGradeId),
		queryFn: () => adminApi.getCapabilityItems(capabilityId, studentGradeId),
	})

/**
 * `save-data-to-session.js` — POST the tick list, then follow the answered redirect 1000 ms later.
 * Legacy shows no success notice on this one, only the spinner; a failure shows the PNotify error.
 * The redirect carries the list in `?students=` (brief, seam 1), so nothing else is stored.
 */
export const useStoreCapabilitySelection = (
	academicYearId: number,
	gradeId: number,
): UseMutationResult<CapabilitySelectionResult, unknown, CapabilitySelectionDto> =>
	useMutation({
		mutationFn: (data: CapabilitySelectionDto) => adminApi.storeCapabilitySelection(academicYearId, gradeId, data),
	})

/**
 * Legacy's `window.location.reload()` after a write on levels 4 and 5 — re-fetch everything the
 * santri's pages show, since a publish or a change touches both the history and the item pages.
 */
export const useReloadStudentCapability = (): (() => Promise<void>) => {
	const client = useQueryClient()
	return () => client.invalidateQueries({ queryKey: studentCapabilityKeys.all })
}
