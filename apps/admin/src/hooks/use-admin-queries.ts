import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/lib/api"
import useAuthStore from "@/stores/auth.store"
import type { LoginSubmitValues, ResetPasswordSubmitValues } from "@roja/ui"

export const adminKeys = {
	all: ["admin"] as const,
	auth: () => [...adminKeys.all, "auth"] as const,
	profile: () => [...adminKeys.all, "profile"] as const,
	dashboard: () => [...adminKeys.all, "dashboard"] as const,
}

export function useAdminLoginMutation() {
	const auth = useAuthStore()
	return useMutation({
		mutationFn: (values: LoginSubmitValues) =>
			adminApi.login({ email: values.identifier, password: values.password }),
		onSuccess: (res) => {
			if (res.accessToken && res.refreshToken && res.user) {
				auth.login(res.accessToken, res.refreshToken, res.user)
			}
		},
	})
}

export function useAdminVerify2faMutation() {
	const auth = useAuthStore()
	return useMutation({
		mutationFn: ({ code, adminId }: { code: string; adminId: number }) =>
			adminApi.verify2fa(code, adminId),
		onSuccess: (res) => {
			if (res.accessToken && res.refreshToken && res.user) {
				auth.login(res.accessToken, res.refreshToken, res.user)
			}
		},
	})
}

export function useAdminResend2faMutation() {
	return useMutation({
		mutationFn: (adminId: number) => adminApi.resend2fa(adminId),
	})
}

export function useAdminForgotPasswordMutation() {
	return useMutation({
		mutationFn: (email: string) => adminApi.forgotPassword(email),
	})
}

export function useAdminResetPasswordMutation(token: string) {
	return useMutation({
		mutationFn: (values: ResetPasswordSubmitValues) =>
			adminApi.resetPassword(token, values.password),
	})
}

export function useAdminLogoutMutation() {
	const auth = useAuthStore()
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: () => adminApi.logout(),
		onSettled: () => {
			auth.logout()
			queryClient.clear()
		},
	})
}

export function useAdminDashboardStats() {
	return useQuery({
		queryKey: adminKeys.dashboard(),
		queryFn: () => adminApi.getDashboardStats(),
		staleTime: 1000 * 60 * 5,
	})
}

export function useAdminProfile() {
	return useQuery({
		queryKey: adminKeys.profile(),
		queryFn: () => adminApi.getMyProfile(),
		staleTime: 1000 * 60 * 10,
	})
}
