import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { merchantApi } from "@/lib/api"
import type {
	MerchantTransactionFilterParams,
	UpdateProfileDto,
	ChangePasswordDto,
	MerchantCreateEwalletDto,
	StoreTransactionDto,
} from "@roja/api-client"

export const merchantKeys = {
	all: ["merchant"] as const,
	profile: () => [...merchantKeys.all, "profile"] as const,
	ewalletStatus: () => [...merchantKeys.all, "ewallet", "status"] as const,
	ewalletDashboard: (filters?: Record<string, any>) => [...merchantKeys.all, "ewallet", "dashboard", filters] as const,
	transactions: (filters?: Record<string, any>) => [...merchantKeys.all, "transactions", filters] as const,
	transactionDetail: (id: number) => [...merchantKeys.all, "transactions", id] as const,
	checkout: (id: number) => [...merchantKeys.all, "transactions", id, "checkout"] as const,
	qrData: (id: number) => [...merchantKeys.all, "transactions", id, "qr"] as const,
}

// ---------------- Profile & Settings ----------------
export function useMerchantProfile() {
	return useQuery({
		queryKey: merchantKeys.profile(),
		queryFn: () => merchantApi.getProfile(),
		staleTime: 1000 * 60 * 5,
	})
}

export function useUpdateProfileMutation() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (data: UpdateProfileDto) => merchantApi.updateProfile(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: merchantKeys.profile() })
		},
	})
}

export function useChangePasswordMutation() {
	return useMutation({
		mutationFn: (data: ChangePasswordDto) => merchantApi.changePassword(data),
	})
}

export function useToggle2faMutation() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (enabled: boolean) => merchantApi.toggle2fa(enabled),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: merchantKeys.profile() })
		},
	})
}

export function useResendVerificationMutation() {
	return useMutation({
		mutationFn: () => merchantApi.resendVerification(),
	})
}

// ---------------- E-Wallet Status & Dashboard ----------------
export function useMerchantEwalletStatus() {
	return useQuery({
		queryKey: merchantKeys.ewalletStatus(),
		queryFn: () => merchantApi.getEwalletStatus(),
		staleTime: 1000 * 60 * 5,
	})
}

export function useMerchantEwalletDashboard(
	filters?: MerchantTransactionFilterParams,
	enabled = true,
) {
	return useQuery({
		queryKey: merchantKeys.ewalletDashboard(filters),
		queryFn: () => merchantApi.getEwalletDashboard(filters),
		enabled,
		placeholderData: keepPreviousData,
		staleTime: 0,
	})
}

export function useMerchantTransactions(
	filters?: MerchantTransactionFilterParams,
	enabled = true,
) {
	return useQuery({
		queryKey: merchantKeys.transactions(filters),
		queryFn: () => merchantApi.getTransactions(filters),
		enabled,
		placeholderData: keepPreviousData,
		staleTime: 0,
	})
}

export function useMerchantTransactionDetail(id: number, enabled = true) {
	return useQuery({
		queryKey: merchantKeys.transactionDetail(id),
		queryFn: () => merchantApi.getTransactionDetail(id),
		enabled: enabled && !!id,
		staleTime: 1000 * 60 * 2,
	})
}

// ---------------- PIN Management Mutations ----------------
export function useLoginEwalletPinMutation() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (pin: string) => merchantApi.loginEwalletPin(pin),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: merchantKeys.all })
		},
	})
}

export function useCreateEwalletMutation() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (data: MerchantCreateEwalletDto) => merchantApi.createEwallet(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: merchantKeys.all })
		},
	})
}

export function useUpdatePinMutation() {
	return useMutation({
		mutationFn: (data: { currentPin: string; pin: string; pinConfirmation: string }) =>
			merchantApi.updatePin(data),
	})
}

export function useResetPinMutation() {
	return useMutation({
		mutationFn: (data: { email: string; token: string; pin: string; pinConfirmation: string }) =>
			merchantApi.resetPin(data),
	})
}

// ---------------- Transaction Mutations ----------------
export function useCreateTransactionMutation() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (data: StoreTransactionDto) => merchantApi.createTransaction(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: merchantKeys.all })
		},
	})
}

export function useValidateScanMutation() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({ transactionId, scannedQrValue }: { transactionId: number; scannedQrValue: string }) =>
			merchantApi.validateScan(transactionId, scannedQrValue),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: merchantKeys.all })
		},
	})
}

export function useUpdateTransactionItemMutation() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({ itemId, data }: { itemId: number; data: { description: string; price: number } }) =>
			merchantApi.updateTransactionItem(itemId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: merchantKeys.all })
		},
	})
}

export function useValidateCheckoutPinMutation() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({ transactionId, pin }: { transactionId: number; pin: string }) =>
			merchantApi.validatePin(transactionId, pin),
		onSuccess: (res) => {
			if (res.success) {
				queryClient.invalidateQueries({ queryKey: merchantKeys.all })
			}
		},
	})
}
