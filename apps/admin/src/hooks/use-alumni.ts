import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from "@tanstack/react-query"

import type { AdminAlumniDetail, AdminAlumniList, AdminAlumniMessage, AdminAlumniYearRow } from "@roja/types"

import { legacyNotify } from "@/components/legacy/legacy-notify"
import { adminApi } from "@/lib/api"
import { saveBlob } from "@/lib/download"
import { SYSTEM_ERROR } from "@/lib/legacy-errors"

import { akademikKeys } from "./use-akademik-keys"

const EXPORT_FILE = "Hasil export data alumni.xlsx"

export const alumniKeys = {
	years: () => [...akademikKeys.alumni, "years"] as const,
	archive: () => [...akademikKeys.alumni, "archive"] as const,
	byYear: (year: number) => [...akademikKeys.alumni, "year", year] as const,
	detail: (alumniId: number) => [...akademikKeys.alumni, "detail", alumniId] as const,
}

export const useAlumniYears = (): UseQueryResult<AdminAlumniYearRow[]> =>
	useQuery({ queryKey: alumniKeys.years(), queryFn: () => adminApi.getAlumniYears(), staleTime: 0 })

export const useAlumniArchive = (enabled: boolean): UseQueryResult<AdminAlumniList> =>
	useQuery({ queryKey: alumniKeys.archive(), queryFn: () => adminApi.getAlumniArchive(), enabled, staleTime: 0 })

export const useAlumniByYear = (year: number): UseQueryResult<AdminAlumniList> =>
	useQuery({ queryKey: alumniKeys.byYear(year), queryFn: () => adminApi.getAlumniByYear(year), staleTime: 0 })

export const useAlumniDetail = (alumniId: number): UseQueryResult<AdminAlumniDetail> =>
	useQuery({ queryKey: alumniKeys.detail(alumniId), queryFn: () => adminApi.getAlumniDetail(alumniId), staleTime: 0, gcTime: 0 })

const useAkademikWrite = <TVariables>(
	mutationFn: (variables: TVariables) => Promise<AdminAlumniMessage>,
): UseMutationResult<AdminAlumniMessage, Error, TVariables> => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: akademikKeys.all }),
	})
}

export const useDeleteAlumni = (): UseMutationResult<AdminAlumniMessage, Error, number> =>
	useAkademikWrite((alumniId: number) => adminApi.deleteAlumni(alumniId))

export const useDeleteAlumniYear = (): UseMutationResult<AdminAlumniMessage, Error, number> =>
	useAkademikWrite((year: number) => adminApi.deleteAlumniYear(year))

export const useUpdateAlumni = (): UseMutationResult<AdminAlumniMessage, Error, { alumniId: number; form: FormData }> =>
	useAkademikWrite(({ alumniId, form }: { alumniId: number; form: FormData }) => adminApi.updateAlumni(alumniId, form))

export const useDownloadAlumniExport = (year: number): UseMutationResult<void, unknown, void> =>
	useMutation<void, unknown, void>({
		mutationFn: async () => {
			const { blob, fileName } = await adminApi.downloadAlumniExport(year)
			saveBlob(blob, fileName ?? EXPORT_FILE)
		},
		onError: () => legacyNotify.error(SYSTEM_ERROR),
	})

export const alumniPrintUrl = (alumniId: number): string => adminApi.alumniPrintUrl(alumniId)
