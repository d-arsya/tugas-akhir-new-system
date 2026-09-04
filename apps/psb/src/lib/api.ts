import { createApiClient, createSharedApi, createPsbApi, setAuthStoreGetter } from "@roja/api-client"
import useAuthStore from "@/stores/auth.store"
import { hijackPsbApi } from "./dev-hijack"

const BASE_URL = import.meta.env["VITE_API_URL"] as string

setAuthStoreGetter(() => useAuthStore.getState())

export const apiClient = createApiClient(BASE_URL)
export const sharedApi = createSharedApi(apiClient)
export const psbApi = hijackPsbApi(createPsbApi(apiClient))


