import { useQueryClient, useQuery, type UseQueryResult } from "@tanstack/react-query"

import type { AdminSchoolSetting, District, Province, Regency } from "@roja/types"

import { adminApi, sharedApi } from "@/lib/api"

// Legacy Lainnya > Pengaturan > Profil Pondok (`SettingSchoolController`), the single `setting_schools` row
export const schoolSettingKeys = {
	all: ["admin-school-setting"] as const,
	detail: () => [...schoolSettingKeys.all, "detail"] as const,
}

// `Province::all()` and the `location.getRegency` / `location.getDistrict` JSON routes
export const locationKeys = {
	all: ["location"] as const,
	provinces: () => [...locationKeys.all, "provinces"] as const,
	regencies: (provinceId: number | null) => [...locationKeys.all, "regencies", provinceId] as const,
	districts: (regencyId: number | null) => [...locationKeys.all, "districts", regencyId] as const,
}

// The lists never change while the page is open, so they are cached like the legacy page load
const LOCATION_STALE_MS = 30 * 60 * 1000

// Legacy renders `Province::all()` / `where(...)->get()`, which is primary-key order;
// the shared `/location/*` endpoints sort by name, so the rows are put back in id order here
const byId = <T extends { id: number }>(rows: T[]): T[] => [...rows].sort((a, b) => a.id - b.id)

export const useSchoolSetting = (): UseQueryResult<AdminSchoolSetting> =>
	useQuery({ queryKey: schoolSettingKeys.detail(), queryFn: () => adminApi.getSchool() })

/** Legacy reloads the page 1000 ms after saving; the port refetches the row instead. */
export const useRefetchSchoolSetting = (): (() => void) => {
	const queryClient = useQueryClient()
	return () => {
		void queryClient.invalidateQueries({ queryKey: schoolSettingKeys.all })
	}
}

export const useProvinces = (): UseQueryResult<Province[]> =>
	useQuery({
		queryKey: locationKeys.provinces(),
		queryFn: () => sharedApi.getProvinces(),
		select: byId,
		staleTime: LOCATION_STALE_MS,
	})

export const useRegencies = (provinceId: number | null): UseQueryResult<Regency[]> =>
	useQuery({
		queryKey: locationKeys.regencies(provinceId),
		queryFn: () => sharedApi.getRegencies(provinceId ?? 0),
		select: byId,
		enabled: provinceId !== null,
		staleTime: LOCATION_STALE_MS,
	})

export const useDistricts = (regencyId: number | null): UseQueryResult<District[]> =>
	useQuery({
		queryKey: locationKeys.districts(regencyId),
		queryFn: () => sharedApi.getDistricts(regencyId ?? 0),
		select: byId,
		enabled: regencyId !== null,
		staleTime: LOCATION_STALE_MS,
	})
