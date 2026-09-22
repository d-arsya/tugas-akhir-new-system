import { createApiClient, createSharedApi, createPsbApi, setAuthStoreGetter } from "@roja/api-client"
import { getRuntimeEnv } from "@roja/utils"
import useAuthStore from "@/stores/auth.store"
import { hijackPsbApi } from "./dev-hijack"

const BASE_URL = getRuntimeEnv("VITE_API_URL", "http://localhost:3000/api/v1")

setAuthStoreGetter(() => useAuthStore.getState())

export const apiClient = createApiClient(BASE_URL)
export const sharedApi = createSharedApi(apiClient)
export const psbApi = hijackPsbApi(createPsbApi(apiClient))


