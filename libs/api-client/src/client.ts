import axios from "axios"
import type { AxiosInstance } from "axios"

type AuthStoreGetter = () => {
	user?: { domain?: string } | null
	logout: () => void
}

let authStoreGetter: AuthStoreGetter | null = null

export const setAuthStoreGetter = (getter: AuthStoreGetter): void => {
	authStoreGetter = getter
}

let isRefreshing = false
let failedQueue: Array<{
	resolve: (value?: unknown) => void
	reject: (reason?: unknown) => void
}> = []

const processQueue = (error: unknown) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error)
		} else {
			prom.resolve()
		}
	})
	failedQueue = []
}

export const createApiClient = (
	baseURL: string,
	options?: { refreshEndpoint?: string },
): AxiosInstance => {
	const client = axios.create({
		baseURL,
		timeout: 15_000,
		headers: { "Content-Type": "application/json" },
		withCredentials: true,
	})

	client.interceptors.response.use(
		(response) => response,
		async (error: unknown) => {
			if (axios.isAxiosError(error)) {
				const apiMessage = error.response?.data?.message || error.response?.data?.error
				if (apiMessage && typeof apiMessage === "string") {
					error.message = apiMessage
				}

				if (error.response?.status === 401) {
					const originalRequest = error.config

					const requestUrl = originalRequest?.url || ""
					if (
						requestUrl.includes("/auth/login") ||
						requestUrl.includes("/auth/two-factor") ||
						requestUrl.includes("/auth/refresh")
					) {
						authStoreGetter?.().logout()
						return Promise.reject(error)
					}

					// Resolve target refresh endpoint: options -> authStore.user.domain -> requestUrl regex
					let refreshEndpoint = options?.refreshEndpoint
					if (!refreshEndpoint) {
						const userDomain = authStoreGetter?.().user?.domain
						if (userDomain) {
							refreshEndpoint = `/${userDomain.toLowerCase()}/auth/refresh`
						}
					}
					if (!refreshEndpoint) {
						const match = requestUrl.match(/^\/?(psb|admin|merchant|santri)/i)
						if (match) {
							refreshEndpoint = `/${match[1].toLowerCase()}/auth/refresh`
						}
					}

					if (originalRequest && refreshEndpoint && !(originalRequest as any)._retry) {
						if (isRefreshing) {
							return new Promise((resolve, reject) => {
								failedQueue.push({ resolve, reject })
							})
								.then(() => client(originalRequest))
								.catch((err) => Promise.reject(err))
						}

						;(originalRequest as any)._retry = true
						isRefreshing = true

						try {
							await client.post(refreshEndpoint)
							processQueue(null)
							return client(originalRequest)
						} catch (refreshErr) {
							processQueue(refreshErr)
							authStoreGetter?.().logout()
							if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
								window.location.href = "/login"
							}
							return Promise.reject(refreshErr)
						} finally {
							isRefreshing = false
						}
					}

					authStoreGetter?.().logout()
					if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
						window.location.href = "/login"
					}
				}
			}
			return Promise.reject(error)
		},
	)

	return client
}
