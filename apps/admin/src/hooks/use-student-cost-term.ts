import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from "@tanstack/react-query"

import type { AdminMessageResult, StudentCostTermDetail, StudentCostTermPayload } from "@roja/types"

import { studentCostKeys } from "@/hooks/use-student-costs"
import { adminApi } from "@/lib/api"

export type StudentCostTermRef = { academicYearId: number; gradeId: number; accountancyId: number }

export type StudentCostTermParams = { academicYearId: string; gradeId: string; accountancyId: string }

export const studentCostTermKeys = {
	all: ["admin-student-cost-terms"] as const,
	detail: (ref: StudentCostTermRef) =>
		[...studentCostTermKeys.all, "detail", ref.academicYearId, ref.gradeId, ref.accountancyId] as const,
}

const valid = (ref: StudentCostTermRef): boolean =>
	Number.isFinite(ref.academicYearId) && Number.isFinite(ref.gradeId) && Number.isFinite(ref.accountancyId)

export const useStudentCostTerm = (ref: StudentCostTermRef): UseQueryResult<StudentCostTermDetail> =>
	useQuery({
		queryKey: studentCostTermKeys.detail(ref),
		queryFn: () => adminApi.getStudentCostTerm(ref.academicYearId, ref.gradeId, ref.accountancyId),
		enabled: valid(ref),
	})

export const useCreateStudentCostTerm = (
	ref: StudentCostTermRef,
): UseMutationResult<AdminMessageResult, Error, StudentCostTermPayload> => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (payload: StudentCostTermPayload) =>
			adminApi.createStudentCostTerm(ref.academicYearId, ref.gradeId, ref.accountancyId, payload),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: studentCostTermKeys.detail(ref) })
			void queryClient.invalidateQueries({ queryKey: studentCostKeys.accounts(ref.academicYearId, ref.gradeId) })
		},
	})
}

export const useUpdateStudentCostTerm = (
	ref: StudentCostTermRef,
): UseMutationResult<AdminMessageResult, Error, StudentCostTermPayload> => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (payload: StudentCostTermPayload) =>
			adminApi.updateStudentCostTerm(ref.academicYearId, ref.gradeId, ref.accountancyId, payload),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: studentCostTermKeys.detail(ref) })
			void queryClient.invalidateQueries({ queryKey: studentCostKeys.accounts(ref.academicYearId, ref.gradeId) })
		},
	})
}
