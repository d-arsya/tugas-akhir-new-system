import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import type { AuthUser } from "@roja/types"
import type { LoginSubmitValues, ResetPasswordSubmitValues } from "@roja/ui"
import { adminApi } from "@/lib/api"
import useAuthStore from "@/stores/auth.store"

export function useAdminLoginMutation() {
	const auth = useAuthStore()
	return useMutation({
		mutationFn: (values: LoginSubmitValues) =>
			adminApi.login({ email: values.identifier, password: values.password }),
		onSuccess: (res) => {
			if (res.user) {
				auth.login(res.user as AuthUser)
			}
		},
	})
}

export function useAdminGoogleLoginMutation() {
	const auth = useAuthStore()
	return useMutation({
		mutationFn: (credential: string) => adminApi.loginWithGoogle(credential),
		onSuccess: (res) => {
			if (res.user) {
				auth.login(res.user as AuthUser)
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
			if (res.user) {
				auth.login(res.user as AuthUser)
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

export function useAdminLogout(): () => Promise<void> {
	const auth = useAuthStore()
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	return async () => {
		await adminApi.logout().catch(() => undefined)
		auth.logout()
		await navigate({ to: "/login" })
		queryClient.clear()
	}
}
