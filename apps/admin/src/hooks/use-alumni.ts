import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from "@tanstack/react-query"

import type { AdminAlumniDetail, AdminAlumniList, AdminAlumniMessage, AdminAlumniYearRow } from "@roja/types"

import { adminApi } from "@/lib/api"

import { akademikKeys } from "./use-akademik-keys"

// OWNER: AK-A. Akademik → Alumni reads and writes. Reads are never served stale (legacy reloads every page);
// every write invalidates the whole Akademik root, since an alumni delete reactivates a santri.

export const alumniKeys = {
	years: () => [...akademikKeys.alumni, "years"] as const,
	archive: () => [...akademikKeys.alumni, "archive"] as const,
	byYear: (year: number) => [...akademikKeys.alumni, "year", year] as const,
	detail: (alumniId: number) => [...akademikKeys.alumni, "detail", alumniId] as const,
}

/** `alumni.list` — the "Alumni" tab. */
export const useAlumniYears = (): UseQueryResult<AdminAlumniYearRow[]> =>
	useQuery({ queryKey: alumniKeys.years(), queryFn: () => adminApi.getAlumniYears(), staleTime: 0 })

/** `list.archive` — loaded the first time the "Archive" tab is shown, like legacy's lazy DataTable. */
export const useAlumniArchive = (enabled: boolean): UseQueryResult<AdminAlumniList> =>
	useQuery({ queryKey: alumniKeys.archive(), queryFn: () => adminApi.getAlumniArchive(), enabled, staleTime: 0 })

/** `alumni.listByYear` */
export const useAlumniByYear = (year: number): UseQueryResult<AdminAlumniList> =>
	useQuery({ queryKey: alumniKeys.byYear(year), queryFn: () => adminApi.getAlumniByYear(year), staleTime: 0 })

/** `alumni.edit` */
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

/** `alumni.destroy` */
export const useDeleteAlumni = (): UseMutationResult<AdminAlumniMessage, Error, number> =>
	useAkademikWrite((alumniId: number) => adminApi.deleteAlumni(alumniId))

/** `alumni.destroyByGraduationYear` */
export const useDeleteAlumniYear = (): UseMutationResult<AdminAlumniMessage, Error, number> =>
	useAkademikWrite((year: number) => adminApi.deleteAlumniYear(year))

/** `alumni.update` */
export const useUpdateAlumni = (): UseMutationResult<AdminAlumniMessage, Error, { alumniId: number; form: FormData }> =>
	useAkademikWrite(({ alumniId, form }: { alumniId: number; form: FormData }) => adminApi.updateAlumni(alumniId, form))
