import axios from "axios"
import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios"

type AuthStoreGetter = () => {
	accessToken: string | null
	setAccessToken: (token: string) => void
	logout: () => void
}

let authStoreGetter: AuthStoreGetter | null = null

export const setAuthStoreGetter = (getter: AuthStoreGetter): void => {
	authStoreGetter = getter
}

let isRefreshing = false
let failedRequestQueue: Array<{
	resolve: (token: string) => void
	reject: (error: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null): void => {
	failedRequestQueue.forEach(({ resolve, reject }) => {
		if (error !== null) {
			reject(error)
		} else if (token !== null) {
			resolve(token)
		}
	})
	failedRequestQueue = []
}

export const createApiClient = (baseURL: string): AxiosInstance => {
	const client = axios.create({
		baseURL,
		timeout: 15_000,
		headers: { "Content-Type": "application/json" },
	})

	client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
		const token = authStoreGetter?.().accessToken
		if (token !== null && token !== undefined) {
			config.headers.Authorization = `Bearer ${token}`
		}
		return config
	})

	client.interceptors.response.use(
		(response) => response,
		async (error: unknown) => {
			if (!axios.isAxiosError(error) || !error.config) {
				return Promise.reject(error)
			}

			const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

			if (error.response?.status !== 401 || originalRequest._retry) {
				return Promise.reject(error)
			}

			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					failedRequestQueue.push({
						resolve: (token: string) => {
							if (originalRequest.headers !== undefined) {
								originalRequest.headers["Authorization"] = `Bearer ${token}`
							}
							resolve(client(originalRequest))
						},
						reject,
					})
				})
			}

			originalRequest._retry = true
			isRefreshing = true

			try {
				const refreshToken = localStorage.getItem("roja-refresh-token")
				if (!refreshToken) {
					authStoreGetter?.().logout()
					return Promise.reject(error)
				}

				const { data } = await axios.post<{
					data: { accessToken: string; refreshToken: string }
				}>(`${baseURL}/auth/refresh`, { refreshToken })

				const newAccessToken = data.data.accessToken
				const newRefreshToken = data.data.refreshToken

				authStoreGetter?.().setAccessToken(newAccessToken)
				localStorage.setItem("roja-refresh-token", newRefreshToken)

				if (originalRequest.headers !== undefined) {
					originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`
				}

				processQueue(null, newAccessToken)
				return client(originalRequest)
			} catch (refreshError: unknown) {
				processQueue(refreshError, null)
				authStoreGetter?.().logout()
				localStorage.removeItem("roja-refresh-token")
				window.location.href = "/login"
				return Promise.reject(refreshError)
			} finally {
				isRefreshing = false
			}
		},
	)

	return client
}
