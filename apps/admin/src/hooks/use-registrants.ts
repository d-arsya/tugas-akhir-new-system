import { useQuery, useQueryClient, type UseQueryResult } from "@tanstack/react-query"

import type {
	AdminRegistrantAcademicYearPage,
	AdminRegistrantAcademicYearRow,
	AdminRegistrantCreateOptions,
	AdminRegistrantDetail,
	AdminRegistrantListTab,
	AdminRegistrantRow,
} from "@roja/types"

import { akademikKeys } from "@/hooks/use-akademik-keys"
import { adminApi } from "@/lib/api"

// Akademik → PSB reads (legacy `RegistrantController`). Every Akademik write invalidates
// `akademikKeys.all`; reads are never cached across page visits (`staleTime: 0`), like legacy's reloads.

export const registrantKeys = {
	years: () => [...akademikKeys.registrant, "years"] as const,
	yearPage: (academicYearId: number) => [...akademikKeys.registrant, "year", academicYearId] as const,
	rows: (academicYearId: number, tab: AdminRegistrantListTab) => [...akademikKeys.registrant, "rows", academicYearId, tab] as const,
	detail: (registrantId: number) => [...akademikKeys.registrant, "detail", registrantId] as const,
	createOptions: () => [...akademikKeys.registrant, "create-options"] as const,
}

export const useRegistrantYears = (): UseQueryResult<AdminRegistrantAcademicYearRow[]> =>
	useQuery({ queryKey: registrantKeys.years(), queryFn: () => adminApi.getRegistrantAcademicYears(), staleTime: 0 })

export const useRegistrantYearPage = (academicYearId: number): UseQueryResult<AdminRegistrantAcademicYearPage> =>
	useQuery({
		queryKey: registrantKeys.yearPage(academicYearId),
		queryFn: () => adminApi.getRegistrantAcademicYearPage(academicYearId),
		staleTime: 0,
	})

export const useRegistrantRows = (academicYearId: number, tab: AdminRegistrantListTab): UseQueryResult<AdminRegistrantRow[]> =>
	useQuery({
		queryKey: registrantKeys.rows(academicYearId, tab),
		queryFn: () => adminApi.getRegistrantRows(academicYearId, tab),
		staleTime: 0,
	})

export const useRegistrantDetail = (registrantId: number): UseQueryResult<AdminRegistrantDetail> =>
	useQuery({ queryKey: registrantKeys.detail(registrantId), queryFn: () => adminApi.getRegistrant(registrantId), staleTime: 0 })

export const useRegistrantCreateOptions = (): UseQueryResult<AdminRegistrantCreateOptions> =>
	useQuery({ queryKey: registrantKeys.createOptions(), queryFn: () => adminApi.getRegistrantCreateOptions(), staleTime: 0 })

/** Every Akademik write refetches every Akademik page (PSB approval creates a santri). */
export const useInvalidateAkademik = (): (() => Promise<void>) => {
	const queryClient = useQueryClient()
	return () => queryClient.invalidateQueries({ queryKey: akademikKeys.all })
}
