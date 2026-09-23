import type { AxiosInstance } from "axios"

import type {
	AccountancyDeleteStep,
	AccountancyDeleteTarget,
	AccountancyDelegatePayload,
	AccountancyDetail,
	AccountancyOption,
	AccountancyPayload,
	AccountancyRow,
	AdminMessageResult,
	AdminRedirectResult,
	MerchantDetail,
	MerchantPayload,
	MerchantRow,
	StudentCostAccountPage,
	StudentCostAppliedPayload,
	StudentCostGradeRow,
	StudentCostTermDetail,
	StudentCostTermPayload,
	StudentCostYearRow,
} from "@roja/types"

/** Endpoints behind Data Master phase 2: Keuangan (Akun, Biaya Santri) and Merchant. */
export interface AdminMasterFinanceApi {
	// Akun
	getAccountancyRows(): Promise<AccountancyRow[]>
	getAccountancyOptions(): Promise<AccountancyOption[]>
	getAccountancy(id: number): Promise<AccountancyDetail>
	createAccountancy(data: AccountancyPayload): Promise<AdminMessageResult>
	updateAccountancy(id: number, data: AccountancyPayload): Promise<AdminMessageResult>
	getAccountancyDeleteStep(id: number, step: AccountancyDeleteTarget): Promise<AccountancyDeleteStep>
	deleteAccountancy(id: number): Promise<AdminRedirectResult>
	delegateAccountancyChild(id: number, data: AccountancyDelegatePayload): Promise<AdminRedirectResult>

	// Biaya Santri — the four drill-down levels
	getStudentCostYears(): Promise<StudentCostYearRow[]>
	getStudentCostGrades(academicYearId: number): Promise<StudentCostGradeRow[]>
	getStudentCostAccounts(academicYearId: number, gradeId: number): Promise<StudentCostAccountPage>
	applyStudentCostItems(
		academicYearId: number,
		gradeId: number,
		data: StudentCostAppliedPayload,
	): Promise<AdminMessageResult>
	/** Backs both the create and the edit page; `term` is null when nothing is saved yet. */
	getStudentCostTerm(
		academicYearId: number,
		gradeId: number,
		accountancyId: number,
	): Promise<StudentCostTermDetail>
	createStudentCostTerm(
		academicYearId: number,
		gradeId: number,
		accountancyId: number,
		data: StudentCostTermPayload,
	): Promise<AdminMessageResult>
	updateStudentCostTerm(
		academicYearId: number,
		gradeId: number,
		accountancyId: number,
		data: StudentCostTermPayload,
	): Promise<AdminMessageResult>

	// Merchant
	getMerchantRows(): Promise<MerchantRow[]>
	getMerchantNextNumber(): Promise<{ uniqueNumber: string }>
	getMerchant(id: number): Promise<MerchantDetail>
	createMerchant(data: MerchantPayload): Promise<AdminRedirectResult>
	updateMerchant(id: number, data: MerchantPayload): Promise<AdminRedirectResult>
}

const unwrap = <T>(promise: Promise<{ data: unknown }>): Promise<T> =>
	promise.then((response) => {
		const body = response.data
		if (body && typeof body === "object" && "data" in body) {
			return (body as { data: T }).data
		}
		return body as T
	})

const costTermPath = (academicYearId: number, gradeId: number, accountancyId: number): string =>
	`/admin/student-costs/${academicYearId}/grades/${gradeId}/accountancy/${accountancyId}`

export const createAdminMasterFinanceApi = (client: AxiosInstance): AdminMasterFinanceApi => ({
	getAccountancyRows: () => unwrap(client.get("/admin/accountancies")),
	getAccountancyOptions: () => unwrap(client.get("/admin/accountancies/options")),
	getAccountancy: (id) => unwrap(client.get(`/admin/accountancies/${id}`)),
	createAccountancy: (data) => unwrap(client.post("/admin/accountancies", data)),
	updateAccountancy: (id, data) => unwrap(client.patch(`/admin/accountancies/${id}`, data)),
	getAccountancyDeleteStep: (id, step) =>
		unwrap(client.get(`/admin/accountancies/${id}/delete-step`, { params: { step } })),
	deleteAccountancy: (id) => unwrap(client.delete(`/admin/accountancies/${id}`)),
	delegateAccountancyChild: (id, data) =>
		unwrap(client.patch(`/admin/accountancies/${id}/delegate-child`, data)),

	getStudentCostYears: () => unwrap(client.get("/admin/student-costs/academic-years")),
	getStudentCostGrades: (academicYearId) =>
		unwrap(client.get(`/admin/student-costs/${academicYearId}/grades`)),
	getStudentCostAccounts: (academicYearId, gradeId) =>
		unwrap(client.get(`/admin/student-costs/${academicYearId}/grades/${gradeId}/accounts`)),
	applyStudentCostItems: (academicYearId, gradeId, data) =>
		unwrap(client.patch(`/admin/student-costs/${academicYearId}/grades/${gradeId}/applied`, data)),
	getStudentCostTerm: (academicYearId, gradeId, accountancyId) =>
		unwrap(client.get(costTermPath(academicYearId, gradeId, accountancyId))),
	createStudentCostTerm: (academicYearId, gradeId, accountancyId, data) =>
		unwrap(client.post(costTermPath(academicYearId, gradeId, accountancyId), data)),
	updateStudentCostTerm: (academicYearId, gradeId, accountancyId, data) =>
		unwrap(client.patch(costTermPath(academicYearId, gradeId, accountancyId), data)),

	getMerchantRows: () => unwrap(client.get("/admin/merchants")),
	getMerchantNextNumber: () => unwrap(client.get("/admin/merchants/next-number")),
	getMerchant: (id) => unwrap(client.get(`/admin/merchants/${id}`)),
	createMerchant: (data) => unwrap(client.post("/admin/merchants", data)),
	updateMerchant: (id, data) => unwrap(client.patch(`/admin/merchants/${id}`, data)),
})
