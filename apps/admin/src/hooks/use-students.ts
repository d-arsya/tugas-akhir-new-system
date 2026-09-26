import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from "@tanstack/react-query"

import type {
	AdminStudentAcademicYear,
	AdminStudentCreated,
	AdminStudentDetail,
	AdminStudentDropoutDto,
	AdminStudentGradeRow,
	AdminStudentIdsDto,
	AdminStudentMajorDto,
	AdminStudentMessage,
	AdminStudentOptions,
	AdminStudentRosterPage,
	AdminStudentRosterRow,
	AdminStudentStatusDto,
	AdminStudentSubGradeDto,
	AdminStudentYearRow,
	SocietyDraft,
	SocietyDraftStepKey,
} from "@roja/types"

import { legacyNotify } from "@/components/legacy/legacy-notify"
import { akademikKeys } from "@/hooks/use-akademik-keys"
import { adminApi } from "@/lib/api"
import { saveBlob } from "@/lib/download"
import { legacyErrors } from "@/lib/legacy-errors"

const ROSTER_EXPORT_FILE = "Hasil export data santri.xlsx"

export const studentKeys = {
	years: () => [...akademikKeys.student, "years"] as const,
	year: (academicYearId: number) => [...akademikKeys.student, "year", academicYearId] as const,
	grades: (academicYearId: number) => [...akademikKeys.student, "grades", academicYearId] as const,
	rosterPage: (academicYearId: number, grade: number, levelId: number) =>
		[...akademikKeys.student, "roster-page", academicYearId, grade, levelId] as const,
	roster: (academicYearId: number, grade: number, levelId: number) =>
		[...akademikKeys.student, "roster", academicYearId, grade, levelId] as const,
	options: () => [...akademikKeys.student, "options"] as const,
	detail: (studentGradeId: number) => [...akademikKeys.student, "detail", studentGradeId] as const,
}

const FRESH = { staleTime: 0 } as const

export const useStudentAcademicYears = (): UseQueryResult<AdminStudentYearRow[]> =>
	useQuery({ queryKey: studentKeys.years(), queryFn: () => adminApi.getStudentAcademicYears(), ...FRESH })

export const useStudentAcademicYear = (academicYearId: number): UseQueryResult<AdminStudentAcademicYear> =>
	useQuery({ queryKey: studentKeys.year(academicYearId), queryFn: () => adminApi.getStudentAcademicYear(academicYearId), ...FRESH })

export const useStudentGrades = (academicYearId: number): UseQueryResult<AdminStudentGradeRow[]> =>
	useQuery({ queryKey: studentKeys.grades(academicYearId), queryFn: () => adminApi.getStudentGrades(academicYearId), ...FRESH })

export const useStudentRosterPage = (academicYearId: number, grade: number, levelId: number): UseQueryResult<AdminStudentRosterPage> =>
	useQuery({
		queryKey: studentKeys.rosterPage(academicYearId, grade, levelId),
		queryFn: () => adminApi.getStudentRosterPage(academicYearId, grade, levelId),
		retry: false,
		...FRESH,
	})

export const useStudentRoster = (academicYearId: number, grade: number, levelId: number): UseQueryResult<AdminStudentRosterRow[]> =>
	useQuery({
		queryKey: studentKeys.roster(academicYearId, grade, levelId),
		queryFn: () => adminApi.getStudentRoster(academicYearId, grade, levelId),
		...FRESH,
	})

export const useStudentOptions = (): UseQueryResult<AdminStudentOptions> =>
	useQuery({ queryKey: studentKeys.options(), queryFn: () => adminApi.getStudentOptions(), ...FRESH })

export const useStudentDetail = (studentGradeId: number): UseQueryResult<AdminStudentDetail> =>
	useQuery({
		queryKey: studentKeys.detail(studentGradeId),
		queryFn: () => adminApi.getStudentDetail(studentGradeId),
		retry: false,
		...FRESH,
	})

const useAkademikWrite = <TVariables, TData>(
	mutationFn: (variables: TVariables) => Promise<TData>,
): UseMutationResult<TData, unknown, TVariables> => {
	const queryClient = useQueryClient()
	return useMutation<TData, unknown, TVariables>({
		mutationFn,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: akademikKeys.all }),
	})
}

export type StudentBulkAction = "next" | "stay" | "graduate"

export const useStudentBulk = (): UseMutationResult<AdminStudentMessage, unknown, { action: StudentBulkAction; data: AdminStudentIdsDto }> =>
	useAkademikWrite(({ action, data }: { action: StudentBulkAction; data: AdminStudentIdsDto }) =>
		action === "next"
			? adminApi.nextStudentGrades(data)
			: action === "stay"
				? adminApi.stayStudentGrades(data)
				: adminApi.graduateStudents(data),
	)

export const useStudentDropout = (): UseMutationResult<AdminStudentMessage, unknown, AdminStudentDropoutDto> =>
	useAkademikWrite((data: AdminStudentDropoutDto) => adminApi.dropoutStudents(data))

export const useStudentMajorUpdate = (): UseMutationResult<AdminStudentMessage, unknown, AdminStudentMajorDto> =>
	useAkademikWrite((data: AdminStudentMajorDto) => adminApi.updateStudentMajor(data))

export const useStudentStatusUpdate = (): UseMutationResult<AdminStudentMessage, unknown, AdminStudentStatusDto> =>
	useAkademikWrite((data: AdminStudentStatusDto) => adminApi.updateStudentStatus(data))

export const useStudentSubGradeUpdate = (): UseMutationResult<AdminStudentMessage, unknown, AdminStudentSubGradeDto> =>
	useAkademikWrite((data: AdminStudentSubGradeDto) => adminApi.updateStudentSubGrade(data))

export const useStudentDelete = (): UseMutationResult<AdminStudentMessage, unknown, number> =>
	useAkademikWrite((studentGradeId: number) => adminApi.deleteStudent(studentGradeId))

export const useStudentGradeDelete = (): UseMutationResult<AdminStudentMessage, unknown, { academicYearId: number; grade: number }> =>
	useAkademikWrite(({ academicYearId, grade }: { academicYearId: number; grade: number }) =>
		adminApi.deleteStudentsByGrade(academicYearId, grade),
	)

export const useStudentUpdate = (): UseMutationResult<AdminStudentMessage, unknown, { studentGradeId: number; form: FormData }> =>
	useAkademikWrite(({ studentGradeId, form }: { studentGradeId: number; form: FormData }) => adminApi.updateStudent(studentGradeId, form))

export const useStudentCreate = (): UseMutationResult<AdminStudentCreated, unknown, FormData> =>
	useAkademikWrite((form: FormData) => adminApi.createStudent(form))

export const useValidateStudentStep = (): UseMutationResult<AdminStudentMessage, unknown, { step: SocietyDraftStepKey; draft: SocietyDraft }> =>
	useMutation({
		mutationFn: ({ step, draft }: { step: SocietyDraftStepKey; draft: SocietyDraft }) => adminApi.validateStudentStep(step, draft),
	})

export const useDownloadStudentRoster = (academicYearId: number, grade: number, levelId: number): UseMutationResult<void, unknown, void> =>
	useMutation<void, unknown, void>({
		mutationFn: async () => {
			const { blob, fileName } = await adminApi.downloadStudentRoster(academicYearId, grade, levelId)
			saveBlob(blob, fileName ?? ROSTER_EXPORT_FILE)
		},
		onError: (error) => legacyNotify.error(legacyErrors(error)),
	})

export const studentPrintUrl = (studentGradeId: number): string => adminApi.studentPrintUrl(studentGradeId)
