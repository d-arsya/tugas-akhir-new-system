import { createApiClient, createSharedApi, createSantriApi, setAuthStoreGetter } from "@roja/api-client"
import { getRuntimeEnv } from "@roja/utils"
import useAuthStore from "@/stores/auth.store"
import { hijackSantriApi } from "./dev-hijack"

const BASE_URL = getRuntimeEnv("VITE_API_URL", "http://localhost:3000/api/v1")

setAuthStoreGetter(() => useAuthStore.getState())

export const apiClient = createApiClient(BASE_URL)
export const sharedApi = createSharedApi(apiClient)
export const santriApi = hijackSantriApi(createSantriApi(apiClient))
export const santriApiClient = santriApi
