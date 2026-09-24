import { useQuery, type UseQueryResult } from "@tanstack/react-query"
import type { CapabilityItemRow, CapabilityMassPage, CapabilityMassResult, CapabilityMassWriteDto } from "@roja/types"

import { adminApi } from "@/lib/api"
import { useLegacySubmit, type LegacySubmit } from "@/hooks/use-legacy-submit"

// Queries and the two submits behind the bulk Kesanggupan pages — legacy
// `StudentCapabilityController@massCreate*`, `@massStore`, `@massEdit*` and `@massUpdate`.
//
// **The selection is the query key.** The ticked santri travel in the URL as `?students=1,2,3`
// and nowhere else — no sessionStorage, no store, no server-side session — so two tabs open on
// two grades cache separately and neither can write the other's santri. `massEdit` genuinely
// depends on the whole list (the shown accounts are its intersection), so the joined ids are
// part of the key rather than a fetch-time argument.

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

/**
 * `mass-create-ajax.js`: PNotify on success, then `window.location = res.redirect` 1000 ms later.
 *
 * Which endpoint the submit hits is the caller's choice, because legacy switches the form's
 * `action` on the size of the selection — one santri posts to `@store` and gets an **unagreed**
 * capability with no invoices, two or more post to `@massStore`/`@massUpdate` and are approved
 * and published in the same request. That flip is deliberate and is reproduced, not fixed.
 */
export const useCapabilityMassSubmit = (
	mutationFn: (data: CapabilityMassWriteDto) => Promise<CapabilityMassResult>,
	onDone: (result: CapabilityMassResult) => void,
): LegacySubmit<CapabilityMassWriteDto, CapabilityMassResult> =>
	useLegacySubmit<CapabilityMassWriteDto, CapabilityMassResult>({ mutationFn, onDone })
