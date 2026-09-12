import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { santriApi } from "@/lib/api"
import type {
	SantriChangePasswordDto,
	SantriToggle2faDto,
	SantriUpdatePinDto,
	SantriResetPinDto,
	SantriCreateEwalletDto,
	SantriTopUpBankTransferDto,
} from "@roja/api-client"

export const santriKeys = {
	all: ["santri"] as const,
	profile: () => [...santriKeys.all, "profile"] as const,
	setting: () => [...santriKeys.all, "setting"] as const,
	ewalletStatus: () => [...santriKeys.all, "ewallet", "status"] as const,
	ewalletDashboard: (filters?: Record<string, any>) => [...santriKeys.all, "ewallet", "dashboard", filters] as const,
	transactions: (filters?: Record<string, any>) => [...santriKeys.all, "ewallet", "transactions", filters] as const,
	transactionDetail: (id: number) => [...santriKeys.all, "ewallet", "transactions", id] as const,
	topUpBankInfo: () => [...santriKeys.all, "ewallet", "top-up", "bank-transfer"] as const,
	topUpConfirmForm: (id: number) => [...santriKeys.all, "ewallet", "top-up", "confirm", id] as const,
	paymentSummary: (filters?: Record<string, any>) => [...santriKeys.all, "payment", "summary", filters] as const,
	invoiceList: (studentId: number, page?: number, limit?: number) => [...santriKeys.all, "payment", "list", studentId, page, limit] as const,
	invoiceDetail: (invoiceId: number, page?: number, limit?: number) => [...santriKeys.all, "payment", "detail", invoiceId, page, limit] as const,
}

export function useSantriProfile() {
	return useQuery({
		queryKey: santriKeys.profile(),
		queryFn: () => santriApi.getProfile(),
		staleTime: 1000 * 60 * 5,
	})
}

export function useSantriSetting() {
	return useQuery({
		queryKey: santriKeys.setting(),
		queryFn: () => santriApi.getSettingPage(),
		staleTime: 1000 * 60 * 5,
	})
}

export function useChangePasswordMutation() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (data: SantriChangePasswordDto) => santriApi.changePassword(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: santriKeys.setting() })
		},
	})
}

export function useToggle2faMutation() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (data: SantriToggle2faDto) => santriApi.toggle2fa(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: santriKeys.setting() })
		},
	})
}

export function useResendSettingEmailVerificationMutation() {
	return useMutation({
		mutationFn: () => santriApi.resendSettingEmailVerification(),
	})
}

// ---------------- Payment History Hooks ----------------
export function useSantriPaymentSummary(filters?: { page?: number; limit?: number; status?: string; search?: string }) {
	return useQuery({
		queryKey: santriKeys.paymentSummary(filters),
		queryFn: () => santriApi.getPaymentSummary(filters),
		placeholderData: keepPreviousData,
		staleTime: 1000 * 60 * 5,
	})
}

export function useSantriInvoiceList(studentId: number, page = 1, limit = 10) {
	return useQuery({
		queryKey: santriKeys.invoiceList(studentId, page, limit),
		queryFn: () => santriApi.getInvoiceList(studentId, { page, limit }),
		enabled: !!studentId,
		staleTime: 1000 * 60 * 5,
	})
}

export function useSantriInvoiceDetail(invoiceId: number, page = 1, limit = 10) {
	return useQuery({
		queryKey: santriKeys.invoiceDetail(invoiceId, page, limit),
		queryFn: () => santriApi.getInvoiceDetail(invoiceId, { page, limit }),
		enabled: !!invoiceId,
		staleTime: 1000 * 60 * 5,
	})
}

// ---------------- E-Wallet Hooks ----------------
export function useSantriEwalletStatus() {
	return useQuery({
		queryKey: santriKeys.ewalletStatus(),
		queryFn: () => santriApi.getEwalletStatus(),
		staleTime: 1000 * 60 * 5,
	})
}

export function useSantriEwalletDashboard(
	filters?: { page?: number; limit?: number; status?: string; search?: string; dateStart?: string; dateEnd?: string },
	enabled = true,
) {
	return useQuery({
		queryKey: santriKeys.ewalletDashboard(filters),
		queryFn: () => santriApi.getEwalletDashboard(filters),
		enabled,
		staleTime: 0,
	})
}

export function useSantriTransactions(filters?: Record<string, any>, enabled = true) {
	return useQuery({
		queryKey: santriKeys.transactions(filters),
		queryFn: () => santriApi.getTransactions(filters),
		enabled,
		staleTime: 0,
	})
}

export function useSantriTransactionDetail(id: number, enabled = true) {
	return useQuery({
		queryKey: santriKeys.transactionDetail(id),
		queryFn: () => santriApi.getTransactionDetail(id),
		enabled: enabled && !!id,
		staleTime: 1000 * 60 * 2,
	})
}

export function useSantriTopUpBankInfo(enabled = true) {
	return useQuery({
		queryKey: santriKeys.topUpBankInfo(),
		queryFn: () => santriApi.getTopUpBankInfo(),
		enabled,
		staleTime: 1000 * 60 * 10,
	})
}

export function useSantriConfirmForm(id: number, enabled = true) {
	return useQuery({
		queryKey: santriKeys.topUpConfirmForm(id),
		queryFn: () => santriApi.getConfirmForm(id),
		enabled: enabled && !!id,
		staleTime: 1000 * 60 * 5,
	})
}

export function useLoginEwalletPinMutation() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (pin: string) => santriApi.loginEwalletPin(pin),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: santriKeys.all })
		},
	})
}

export function useCreateEwalletMutation() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (data: SantriCreateEwalletDto) => santriApi.createEwallet(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: santriKeys.all })
		},
	})
}

export function useUpdatePinMutation() {
	return useMutation({
		mutationFn: (data: SantriUpdatePinDto) => santriApi.updatePin(data),
	})
}

export function useStoreTopUpBankTransferMutation() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (data: SantriTopUpBankTransferDto) => santriApi.storeTopUpBankTransfer(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: santriKeys.all })
		},
	})
}

export function useConfirmTopUpMutation() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({ id, formData }: { id: number; formData: FormData }) => santriApi.confirmTopUp(id, formData),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: santriKeys.all })
		},
	})
}

