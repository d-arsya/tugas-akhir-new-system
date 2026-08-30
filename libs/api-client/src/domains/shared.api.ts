import type { AxiosInstance } from "axios"
import type { ApiResponse, Province, Regency, District } from "@roja/types"

type SharedApi = {
	getProvinces: () => Promise<Province[]>
	getRegencies: (provinceId: number) => Promise<Regency[]>
	getDistricts: (regencyId: number) => Promise<District[]>
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
})
