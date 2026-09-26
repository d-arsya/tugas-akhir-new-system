import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from "@tanstack/react-query"

import type {
	AdminMessageResult,
	StudentCostAccountPage,
	StudentCostAppliedPayload,
	StudentCostGradeRow,
	StudentCostYearRow,
} from "@roja/types"

import { adminApi } from "@/lib/api"

export const studentCostKeys = {
	all: ["admin-student-costs"] as const,
	years: () => [...studentCostKeys.all, "years"] as const,
	grades: (academicYearId: number) => [...studentCostKeys.all, "grades", academicYearId] as const,
	accounts: (academicYearId: number, gradeId: number) =>
		[...studentCostKeys.all, "accounts", academicYearId, gradeId] as const,
}

export const useStudentCostYears = (): UseQueryResult<StudentCostYearRow[]> =>
	useQuery({ queryKey: studentCostKeys.years(), queryFn: () => adminApi.getStudentCostYears() })

export const useStudentCostGrades = (academicYearId: number): UseQueryResult<StudentCostGradeRow[]> =>
	useQuery({
		queryKey: studentCostKeys.grades(academicYearId),
		queryFn: () => adminApi.getStudentCostGrades(academicYearId),
		enabled: Number.isFinite(academicYearId),
	})

export const useStudentCostAccounts = (
	academicYearId: number,
	gradeId: number,
): UseQueryResult<StudentCostAccountPage> =>
	useQuery({
		queryKey: studentCostKeys.accounts(academicYearId, gradeId),
		queryFn: () => adminApi.getStudentCostAccounts(academicYearId, gradeId),
		enabled: Number.isFinite(academicYearId) && Number.isFinite(gradeId),
	})

export const useApplyStudentCostItems = (
	academicYearId: number,
	gradeId: number,
): UseMutationResult<AdminMessageResult, Error, StudentCostAppliedPayload> => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (payload: StudentCostAppliedPayload) =>
			adminApi.applyStudentCostItems(academicYearId, gradeId, payload),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: studentCostKeys.all }),
	})
}
