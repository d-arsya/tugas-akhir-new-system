import type { AxiosInstance } from "axios"

import type {
	AdminMessageResult,
	EwalletAmountDto,
	EwalletBadge,
	EwalletBalanceExportQuery,
	EwalletDetail,
	EwalletHistoryDetail,
	EwalletHistoryExportQuery,
	EwalletHistoryQuery,
	EwalletHistoryRow,
	EwalletListQuery,
	EwalletListRow,
	EwalletMoneyResult,
	EwalletPendingWithdraw,
	EwalletPinDto,
	EwalletQrPrint,
	EwalletQrPrintAllRow,
	EwalletSettingDto,
	EwalletSettingPage,
	EwalletTransactionDetail,
	EwalletTransactionUpdateDto,
	EwalletWalletTransactionRow,
	EwalletWidget,
	EwalletWidgetQuery,
	ServerTableResult,
} from "@roja/types"

/**
 * Endpoints behind the admin "Dompet" pages, ported 1:1 from the legacy Laravel
 * `EwalletController` and `EwalletTransactionHistoryController`. Every route is gated
 * Superadmin | Kasir E-Wallet (legacy `can:do-as-cashier`); Admin and Bendahara get 403.
 *
 * Wallet-scoped routes live under `/accounts/:id` and transaction-scoped ones under
 * `/transactions/:id`, so the literal routes (`summary`, `badge`, `export`, `qr-all`,
 * `history`) can never be swallowed by a `:id` parameter.
 *
 * The withdraw flow is three calls that share one server-side pending record, exactly as
 * legacy shared a session value: `amount` parks it, `pin` verifies it, `withdraw` spends it.
 * Unlike legacy, `withdraw` refuses to run until the PIN has been verified.
 */
export interface AdminEwalletApi {
	// Akun Dompet
	getEwalletRows(query: EwalletListQuery): Promise<ServerTableResult<EwalletListRow>>
	getEwalletWidget(query: EwalletWidgetQuery): Promise<EwalletWidget>
	getEwalletBadge(): Promise<EwalletBadge>
	downloadEwalletBalanceReport(query: EwalletBalanceExportQuery): Promise<{ blob: Blob; fileName: string | null }>

	// One wallet
	getEwalletDetail(ewalletId: number): Promise<EwalletDetail>
	getEwalletTransactions(ewalletId: number): Promise<EwalletWalletTransactionRow[]>
	getEwalletSetting(ewalletId: number): Promise<EwalletSettingPage>
	updateEwalletSetting(ewalletId: number, data: EwalletSettingDto): Promise<AdminMessageResult>
	sendEwalletResetPinEmail(ewalletId: number): Promise<AdminMessageResult>
	resetEwalletPin(ewalletId: number, data: EwalletPinDto): Promise<AdminMessageResult>
	getEwalletQrPrint(ewalletId: number): Promise<EwalletQrPrint>
	getEwalletQrPrintAll(): Promise<EwalletQrPrintAllRow[]>

	// Cash money
	topUpEwallet(ewalletId: number, data: EwalletAmountDto): Promise<EwalletMoneyResult>
	/** Legacy @validatePinConfirm — parks the amount, then the PIN page opens. */
	parkEwalletWithdraw(ewalletId: number, data: EwalletAmountDto): Promise<EwalletMoneyResult>
	getEwalletPendingWithdraw(ewalletId: number): Promise<EwalletPendingWithdraw | null>
	/** Legacy @validatePin — a wrong PIN answers 422, the third wrong one locks the wallet. */
	verifyEwalletWithdrawPin(ewalletId: number, data: EwalletPinDto): Promise<EwalletMoneyResult>
	withdrawEwallet(ewalletId: number): Promise<EwalletMoneyResult>

	// Transaction detail
	getEwalletTransactionDetail(transactionId: number): Promise<EwalletTransactionDetail>
	updateEwalletTransaction(transactionId: number, data: EwalletTransactionUpdateDto): Promise<AdminMessageResult>

	// Riwayat Transaksi
	getEwalletHistoryRows(query: EwalletHistoryQuery): Promise<ServerTableResult<EwalletHistoryRow>>
	getEwalletHistoryDetail(transactionId: number): Promise<EwalletHistoryDetail>
	downloadEwalletHistoryReport(query: EwalletHistoryExportQuery): Promise<{ blob: Blob; fileName: string | null }>
}

const unwrap = <T>(promise: Promise<{ data: unknown }>): Promise<T> =>
	promise.then((response) => {
		const body = response.data
		if (body && typeof body === "object" && "data" in body) {
			return (body as { data: T }).data
		}
		return body as T
	})

// RFC 6266: prefer filename* (UTF-8), fall back to the quoted filename
const fileNameFromDisposition = (header: string | undefined): string | null => {
	if (!header) return null
	const encoded = /filename\*=UTF-8''([^;]+)/i.exec(header)?.[1]
	if (encoded) return decodeURIComponent(encoded)
	return /filename="([^"]+)"/i.exec(header)?.[1] ?? null
}

const BASE = "/admin/ewallet"

const download = (client: AxiosInstance, url: string, params: object): Promise<{ blob: Blob; fileName: string | null }> =>
	client.get<Blob>(url, { params, responseType: "blob" }).then((response) => ({
		blob: response.data,
		fileName: fileNameFromDisposition(response.headers["content-disposition"] as string | undefined),
	}))

export const createAdminEwalletApi = (client: AxiosInstance): AdminEwalletApi => ({
	getEwalletRows: (query) => unwrap(client.get(`${BASE}/accounts`, { params: query })),
	getEwalletWidget: (query) => unwrap(client.get(`${BASE}/summary`, { params: query })),
	getEwalletBadge: () => unwrap(client.get(`${BASE}/badge`)),
	downloadEwalletBalanceReport: (query) => download(client, `${BASE}/export`, query),

	getEwalletDetail: (ewalletId) => unwrap(client.get(`${BASE}/accounts/${ewalletId}`)),
	getEwalletTransactions: (ewalletId) => unwrap(client.get(`${BASE}/accounts/${ewalletId}/transactions`)),
	getEwalletSetting: (ewalletId) => unwrap(client.get(`${BASE}/accounts/${ewalletId}/setting`)),
	updateEwalletSetting: (ewalletId, data) => unwrap(client.patch(`${BASE}/accounts/${ewalletId}/setting`, data)),
	sendEwalletResetPinEmail: (ewalletId) => unwrap(client.post(`${BASE}/accounts/${ewalletId}/reset-pin-email`)),
	resetEwalletPin: (ewalletId, data) => unwrap(client.post(`${BASE}/accounts/${ewalletId}/reset-pin`, data)),
	getEwalletQrPrint: (ewalletId) => unwrap(client.get(`${BASE}/accounts/${ewalletId}/qr`)),
	getEwalletQrPrintAll: () => unwrap(client.get(`${BASE}/qr-all`)),

	topUpEwallet: (ewalletId, data) => unwrap(client.post(`${BASE}/accounts/${ewalletId}/top-up`, data)),
	parkEwalletWithdraw: (ewalletId, data) => unwrap(client.post(`${BASE}/accounts/${ewalletId}/withdraw/amount`, data)),
	getEwalletPendingWithdraw: (ewalletId) => unwrap(client.get(`${BASE}/accounts/${ewalletId}/withdraw/pending`)),
	verifyEwalletWithdrawPin: (ewalletId, data) => unwrap(client.post(`${BASE}/accounts/${ewalletId}/withdraw/pin`, data)),
	withdrawEwallet: (ewalletId) => unwrap(client.post(`${BASE}/accounts/${ewalletId}/withdraw`)),

	getEwalletTransactionDetail: (transactionId) => unwrap(client.get(`${BASE}/transactions/${transactionId}`)),
	updateEwalletTransaction: (transactionId, data) => unwrap(client.patch(`${BASE}/transactions/${transactionId}`, data)),

	getEwalletHistoryRows: (query) => unwrap(client.get(`${BASE}/history`, { params: query })),
	getEwalletHistoryDetail: (transactionId) => unwrap(client.get(`${BASE}/history/${transactionId}`)),
	downloadEwalletHistoryReport: (query) => download(client, `${BASE}/history-export`, query),
})
