import type { AxiosInstance } from "axios"

import type {
	AdminMessageResult,
	AdminRegistrantAcademicYearPage,
	AdminRegistrantAcademicYearRow,
	AdminRegistrantCreateOptions,
	AdminRegistrantCreateResult,
	AdminRegistrantDetail,
	AdminRegistrantExportStatus,
	AdminRegistrantListTab,
	AdminRegistrantRow,
	AdminRegistrantStatusDto,
	SocietyDraftStepKey,
	SocietyStepCheckDto,
} from "@roja/types"

/**
 * Endpoints behind the admin Akademik → PSB pages (`/admin/registrants/*`), ported 1:1 from legacy.
 * Owned by workstream AK-P. Gated Superadmin | Admin (legacy `asAdmin`).
 *
 * Lists are not paged: legacy's DataTables load every row and page in the browser. The create and
 * edit saves post the society multipart convention (`libs/types/src/admin-society.ts`).
 */
export type AdminRegistrantApi = {
	getRegistrantAcademicYears: () => Promise<AdminRegistrantAcademicYearRow[]>
	getRegistrantAcademicYearPage: (academicYearId: number) => Promise<AdminRegistrantAcademicYearPage>
	getRegistrantRows: (academicYearId: number, tab: AdminRegistrantListTab) => Promise<AdminRegistrantRow[]>
	downloadRegistrants: (academicYearId: number, status: AdminRegistrantExportStatus) => Promise<{ blob: Blob; fileName: string | null }>

	getRegistrantCreateOptions: () => Promise<AdminRegistrantCreateOptions>
	/** Legacy `validate*Data` — resolves on OK, rejects with the 400 field errors. */
	validateRegistrantStep: (step: SocietyDraftStepKey, draft: SocietyStepCheckDto) => Promise<AdminMessageResult>
	createRegistrant: (form: FormData) => Promise<AdminRegistrantCreateResult>

	getRegistrant: (registrantId: number) => Promise<AdminRegistrantDetail>
	updateRegistrant: (registrantId: number, form: FormData) => Promise<AdminMessageResult>
	updateRegistrantStatus: (registrantId: number, data: AdminRegistrantStatusDto) => Promise<AdminMessageResult>
	deleteRegistrant: (registrantId: number) => Promise<AdminMessageResult>
	/** Opened `target="_blank"`; the API reads the `access_token` cookie. */
	registrantPrintUrl: (registrantId: number) => string
}

const BASE = "/admin/registrants"

const unwrap = <T>(promise: Promise<{ data: unknown }>): Promise<T> =>
	promise.then((response) => {
		const body = response.data
		if (body && typeof body === "object" && "data" in body) return (body as { data: T }).data
		return body as T
	})

// RFC 6266: prefer filename* (UTF-8), fall back to the quoted filename
const fileNameFromDisposition = (header: string | undefined): string | null => {
	if (!header) return null
	const encoded = /filename\*=UTF-8''([^;]+)/i.exec(header)?.[1]
	if (encoded) return decodeURIComponent(encoded)
	return /filename="([^"]+)"/i.exec(header)?.[1] ?? null
}

// The client's default `Content-Type: application/json` makes axios turn a FormData body into JSON (files
// dropped), so every multipart call sets the header explicitly, as `admin-student.api.ts` does.
const MULTIPART = { headers: { "Content-Type": "multipart/form-data" } }

export const createAdminRegistrantApi = (client: AxiosInstance): AdminRegistrantApi => ({
	getRegistrantAcademicYears: () => unwrap(client.get(BASE)),
	getRegistrantAcademicYearPage: (academicYearId) => unwrap(client.get(`${BASE}/academic-years/${academicYearId}`)),
	getRegistrantRows: (academicYearId, tab) => unwrap(client.get(`${BASE}/academic-years/${academicYearId}/${tab}`)),
	downloadRegistrants: (academicYearId, status) =>
		client
			.get<Blob>(`${BASE}/academic-years/${academicYearId}/export`, { params: status ? { status } : {}, responseType: "blob" })
			.then((response) => ({
				blob: response.data,
				fileName: fileNameFromDisposition(response.headers["content-disposition"] as string | undefined),
			})),

	getRegistrantCreateOptions: () => unwrap(client.get(`${BASE}/create/options`)),
	validateRegistrantStep: (step, draft) => unwrap(client.post(`${BASE}/create/validate/${step}`, draft)),
	createRegistrant: (form) => unwrap(client.post(`${BASE}/create`, form, MULTIPART)),

	getRegistrant: (registrantId) => unwrap(client.get(`${BASE}/${registrantId}`)),
	updateRegistrant: (registrantId, form) => unwrap(client.patch(`${BASE}/${registrantId}`, form, MULTIPART)),
	updateRegistrantStatus: (registrantId, data) => unwrap(client.patch(`${BASE}/${registrantId}/status-data`, data)),
	deleteRegistrant: (registrantId) => unwrap(client.delete(`${BASE}/${registrantId}`)),
	registrantPrintUrl: (registrantId) => `${client.defaults.baseURL ?? ""}${BASE}/${registrantId}/print`,
})
