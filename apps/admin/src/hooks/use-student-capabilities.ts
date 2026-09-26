import {
	useMutation,
	useQuery,
	useQueryClient,
	type UseMutationResult,
	type UseQueryResult,
} from "@tanstack/react-query"

import type {
	AdminMessageResult,
	CapabilityAcademicYearRow,
	CapabilityGradeRow,
	CapabilityHistoryRow,
	CapabilityItemPage,
	CapabilityItemRow,
	CapabilityPublishResult,
	CapabilitySelectionDto,
	CapabilitySelectionResult,
	CapabilityStudentPage,
	CapabilityStudentRow,
	CapabilityWriteDto,
} from "@roja/types"

import { legacyNotify } from "@/components/legacy/legacy-notify"
import { useLegacySubmit, type LegacySubmit } from "@/hooks/use-legacy-submit"
import { adminApi } from "@/lib/api"
import { saveBlob } from "@/lib/download"
import { legacyErrors } from "@/lib/legacy-errors"

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

export const capabilityPrintUrl = (capabilityId: number, studentGradeId: number): string =>
	adminApi.capabilityPrintUrl(capabilityId, studentGradeId)

export const useCapabilityAcademicYears = (): UseQueryResult<CapabilityAcademicYearRow[]> =>
	useQuery({ queryKey: studentCapabilityKeys.years(), queryFn: () => adminApi.getCapabilityAcademicYears() })

export const useCapabilityGrades = (academicYearId: number): UseQueryResult<CapabilityGradeRow[]> =>
	useQuery({
		queryKey: studentCapabilityKeys.grades(academicYearId),
		queryFn: () => adminApi.getCapabilityGrades(academicYearId),
	})

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

export const useStoreCapabilitySelection = (
	academicYearId: number,
	gradeId: number,
): UseMutationResult<CapabilitySelectionResult, unknown, CapabilitySelectionDto> =>
	useMutation({
		mutationFn: (data: CapabilitySelectionDto) => adminApi.storeCapabilitySelection(academicYearId, gradeId, data),
	})

export const useReloadStudentCapability = (): (() => Promise<void>) => {
	const client = useQueryClient()
	return () => client.invalidateQueries({ queryKey: studentCapabilityKeys.all })
}

export const useCreateCapability = (
	studentGradeId: number,
	onDone: (data: CapabilityPublishResult) => void,
): LegacySubmit<void, CapabilityPublishResult> =>
	useLegacySubmit({
		mutationFn: () => adminApi.createCapability(studentGradeId, { items: [] }),
		afterMs: 0,
		onDone,
	})

export const useChangeCapability = (
	studentGradeId: number,
	onDone: (data: CapabilityPublishResult) => void,
): LegacySubmit<void, CapabilityPublishResult> =>
	useLegacySubmit({
		mutationFn: () => adminApi.changeCapability(studentGradeId),
		afterMs: 0,
		onDone,
	})

export const useSaveCapabilityItems = (
	capabilityId: number,
	studentGradeId: number,
	onDone: () => void,
): LegacySubmit<CapabilityWriteDto, AdminMessageResult> =>
	useLegacySubmit({
		mutationFn: (payload: CapabilityWriteDto) => adminApi.updateCapabilityItems(capabilityId, studentGradeId, payload),
		onDone,
	})

export const usePublishCapability = (
	capabilityId: number,
	studentGradeId: number,
	unsavedItems: () => CapabilityWriteDto | null,
	onDone: () => void,
): LegacySubmit<void, CapabilityPublishResult> =>
	useLegacySubmit({
		mutationFn: async () => {
			const draft = unsavedItems()
			if (draft && draft.items.length > 0) {
				await adminApi.updateCapabilityItems(capabilityId, studentGradeId, draft)
			}
			return adminApi.publishCapability(capabilityId, studentGradeId)
		},
		successMessage: (data: CapabilityPublishResult) => {
			if (data.warning) legacyNotify.error(data.warning, "Peringatan!")
			return data.message
		},
		onDone,
	})

export const useDownloadCapability = (
	capabilityId: number,
	studentGradeId: number,
): UseMutationResult<{ blob: Blob; fileName: string | null }, unknown, void> =>
	useMutation({
		mutationFn: () => adminApi.downloadCapability(capabilityId, studentGradeId),
		onSuccess: ({ blob, fileName }) => saveBlob(blob, fileName ?? "Kesanggupan.pdf"),
		onError: (error) => legacyNotify.error(legacyErrors(error)),
	})
