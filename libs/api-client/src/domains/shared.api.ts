import type { AxiosInstance } from "axios"
import type { ApiResponse, Province, Regency, District } from "@roja/types"

export type Village = {
  id: number;
  districtId: number;
  code?: string;
  name?: string;
};

type SharedApi = {
	getProvinces: () => Promise<Province[]>
	getRegencies: (provinceId: number) => Promise<Regency[]>
	getDistricts: (regencyId: number) => Promise<District[]>
	getVillages: (districtId: number, limit?: number) => Promise<Village[]>
	getGoogleConfig: () => Promise<{ clientId: string | null }>
}

export const createSharedApi = (client: AxiosInstance): SharedApi => ({
	getProvinces: async (): Promise<Province[]> => {
		const { data } = await client.get<ApiResponse<Province[]>>("/location/provinces")
		return data.data
	},
	getRegencies: async (provinceId: number): Promise<Regency[]> => {
		const { data } = await client.get<ApiResponse<Regency[]>>(
			`/location/regencies?province_id=${provinceId}`,
		)
		return data.data
	},
	getDistricts: async (regencyId: number): Promise<District[]> => {
		const { data } = await client.get<ApiResponse<District[]>>(
			`/location/districts?regency_id=${regencyId}`,
		)
		return data.data
	},
	getVillages: async (districtId: number, limit?: number): Promise<Village[]> => {
		const { data } = await client.get<ApiResponse<Village[]>>(
			`/location/villages?district_id=${districtId}` + (limit ? `&limit=${limit}` : '')
		);
		return data.data;
	},
	getGoogleConfig: async (): Promise<{ clientId: string | null }> => {
		const { data } = await client.get<ApiResponse<{ clientId: string | null }>>("/auth/google/config")
		return data.data
	},
})
