import { useQuery, type UseQueryResult } from "@tanstack/react-query"
import type { CapabilityItemRow, CapabilityMassPage, CapabilityMassResult, CapabilityMassWriteDto } from "@roja/types"

import { adminApi } from "@/lib/api"
import { useLegacySubmit, type LegacySubmit } from "@/hooks/use-legacy-submit"

export const capabilityMassKeys = {
	all: ["admin-capability-mass"] as const,
	createPage: (academicYearId: number, gradeId: number, students: string) =>
		[...capabilityMassKeys.all, "create-page", academicYearId, gradeId, students] as const,
	createAccounts: (academicYearId: number, gradeId: number) =>
		[...capabilityMassKeys.all, "create-accounts", academicYearId, gradeId] as const,
	editPage: (academicYearId: number, gradeId: number, students: string) =>
		[...capabilityMassKeys.all, "edit-page", academicYearId, gradeId, students] as const,
	editAccounts: (academicYearId: number, gradeId: number, students: string) =>
		[...capabilityMassKeys.all, "edit-accounts", academicYearId, gradeId, students] as const,
}

export const useCapabilityMassCreatePage = (
	academicYearId: number,
	gradeId: number,
	studentGradeIds: number[],
): UseQueryResult<CapabilityMassPage> =>
	useQuery({
		queryKey: capabilityMassKeys.createPage(academicYearId, gradeId, studentGradeIds.join(",")),
		queryFn: () => adminApi.getCapabilityMassCreate(academicYearId, gradeId, studentGradeIds),
	})

export const useCapabilityMassCreateAccounts = (
	academicYearId: number,
	gradeId: number,
	enabled: boolean,
): UseQueryResult<CapabilityItemRow[]> =>
	useQuery({
		queryKey: capabilityMassKeys.createAccounts(academicYearId, gradeId),
		queryFn: () => adminApi.getCapabilityMassCreateAccounts(academicYearId, gradeId),
		enabled,
	})

export const useCapabilityMassEditPage = (
	academicYearId: number,
	gradeId: number,
	studentGradeIds: number[],
): UseQueryResult<CapabilityMassPage> =>
	useQuery({
		queryKey: capabilityMassKeys.editPage(academicYearId, gradeId, studentGradeIds.join(",")),
		queryFn: () => adminApi.getCapabilityMassEdit(academicYearId, gradeId, studentGradeIds),
	})

export const useCapabilityMassEditAccounts = (
	academicYearId: number,
	gradeId: number,
	studentGradeIds: number[],
	enabled: boolean,
): UseQueryResult<CapabilityItemRow[]> =>
	useQuery({
		queryKey: capabilityMassKeys.editAccounts(academicYearId, gradeId, studentGradeIds.join(",")),
		queryFn: () => adminApi.getCapabilityMassEditAccounts(academicYearId, gradeId, studentGradeIds),
		enabled,
	})

export type CapabilityMassMode = "create" | "edit"

const createForOneStudent = (data: CapabilityMassWriteDto, backTo: string): Promise<CapabilityMassResult> =>
	adminApi
		.createCapability(data.studentGradeIds[0] as number, {
			...(data.note ? { note: data.note } : {}),
			items: data.items,
		})
		.then((result) => ({
			message: result.message,
			redirect: result.redirect ?? backTo,
			studentsProcessed: 1,
			invoicesCreated: result.invoicesCreated,
			...(result.warning ? { warning: result.warning } : {}),
		}))

export const useCapabilityMassSubmit = (
	mode: CapabilityMassMode,
	academicYearId: number,
	gradeId: number,
	backTo: string,
	onDone: (result: CapabilityMassResult) => void,
): LegacySubmit<CapabilityMassWriteDto, CapabilityMassResult> =>
	useLegacySubmit<CapabilityMassWriteDto, CapabilityMassResult>({
		mutationFn: (data) => {
			// Deliberate: a single santri gets an unagreed capability with no invoices, not a mass publish
			if (data.studentGradeIds.length === 1) return createForOneStudent(data, backTo)
			return mode === "create"
				? adminApi.massCreateCapability(academicYearId, gradeId, data)
				: adminApi.massUpdateCapability(academicYearId, gradeId, data)
		},
		onDone,
	})
