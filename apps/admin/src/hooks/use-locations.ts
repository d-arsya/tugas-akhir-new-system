import { useQuery, type UseQueryResult } from "@tanstack/react-query"

import type { District, Province, Regency } from "@roja/types"

import { sharedApi } from "@/lib/api"

export const locationKeys = {
	all: ["location"] as const,
	provinces: () => [...locationKeys.all, "provinces"] as const,
	regencies: (provinceId: number | null) => [...locationKeys.all, "regencies", provinceId] as const,
	districts: (regencyId: number | null) => [...locationKeys.all, "districts", regencyId] as const,
}

const LOCATION_STALE_MS = 30 * 60 * 1000

const byId = <T extends { id: number }>(rows: T[]): T[] => [...rows].sort((a, b) => a.id - b.id)

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
