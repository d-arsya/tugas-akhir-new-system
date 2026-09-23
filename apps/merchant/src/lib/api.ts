import { createApiClient, createSharedApi, createMerchantApi, setAuthStoreGetter } from "@roja/api-client"
import { getRuntimeEnv } from "@roja/utils"
import useAuthStore from "@/stores/auth.store"

const BASE_URL = getRuntimeEnv("VITE_API_URL", "http://localhost:3000/api/v1")

setAuthStoreGetter(() => useAuthStore.getState())

export const apiClient = createApiClient(BASE_URL)
export const sharedApi = createSharedApi(apiClient)
export const merchantApi = createMerchantApi(apiClient)
export const merchantApiClient = merchantApi

