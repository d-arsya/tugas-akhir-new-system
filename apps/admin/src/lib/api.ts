import { createApiClient, createSharedApi, createAdminApi, setAuthStoreGetter } from "@roja/api-client"
import { hijackAdminApi } from "./dev-hijack"
import useAuthStore from "@/stores/auth.store"

const BASE_URL = (import.meta.env["VITE_API_URL"] as string) || "http://localhost:3000/api/v1"

setAuthStoreGetter(() => useAuthStore.getState())

export const apiClient = createApiClient(BASE_URL, { refreshEndpoint: "/admin/auth/refresh" })
export const sharedApi = createSharedApi(apiClient)
export const adminApi = hijackAdminApi(createAdminApi(apiClient))
