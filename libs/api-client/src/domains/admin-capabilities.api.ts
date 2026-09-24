import type { AxiosInstance } from "axios"

import type {
	AdminMessageResult,
	CapabilityAcademicYearRow,
	CapabilityGradeRow,
	CapabilityHistoryRow,
	CapabilityItemPage,
	CapabilityItemRow,
	CapabilityMassPage,
	CapabilityMassResult,
	CapabilityMassWriteDto,
	CapabilityPublishResult,
	CapabilitySelectionDto,
	CapabilitySelectionResult,
	CapabilityStudentPage,
	CapabilityStudentRow,
	CapabilityWriteDto,
} from "@roja/types"

/**
 * Endpoints behind the admin "Pembayaran Santri ▸ Kesanggupan" pages, ported 1:1 from the
 * legacy Laravel `StudentCapabilityController`. Every route is gated Superadmin | Bendahara,
 * the same gate as phase 1.
 *
 * None of the list endpoints is paged: legacy returns every row in one response and the
 * browser pages it, so these answer plain arrays rather than `ServerTableResult`.
 *
 * Two of the legacy URLs pass a grade **label** where the route binding expects a grade
 * **id** (`mass-create.blade.php:121`, `mass-edit.blade.php:140`). That only works because
 * the seeder happened to make `id == label` for all seven grades. Every route here takes
 * the id.
 */
export interface AdminCapabilitiesApi {
	// Level 1 → 3: the drill-down
	getCapabilityAcademicYears(): Promise<CapabilityAcademicYearRow[]>
	getCapabilityGrades(academicYearId: number): Promise<CapabilityGradeRow[]>
	getCapabilityStudents(academicYearId: number, gradeId: number): Promise<CapabilityStudentRow[]>

	/** Legacy @storeToSession — parks the tick list, then answers where to go next. */
	storeCapabilitySelection(
		academicYearId: number,
		gradeId: number,
		data: CapabilitySelectionDto,
	): Promise<CapabilitySelectionResult>

	// Mass create
	getCapabilityMassCreate(academicYearId: number, gradeId: number, studentGradeIds: number[]): Promise<CapabilityMassPage>
	getCapabilityMassCreateAccounts(academicYearId: number, gradeId: number): Promise<CapabilityItemRow[]>
	massCreateCapability(academicYearId: number, gradeId: number, data: CapabilityMassWriteDto): Promise<CapabilityMassResult>

	// Mass edit
	getCapabilityMassEdit(academicYearId: number, gradeId: number, studentGradeIds: number[]): Promise<CapabilityMassPage>
	getCapabilityMassEditAccounts(
		academicYearId: number,
		gradeId: number,
		studentGradeIds: number[],
	): Promise<CapabilityItemRow[]>
	massUpdateCapability(academicYearId: number, gradeId: number, data: CapabilityMassWriteDto): Promise<CapabilityMassResult>

	// Level 4: one santri's history
	getCapabilityStudentPage(studentGradeId: number): Promise<CapabilityStudentPage>
	getCapabilityHistory(studentGradeId: number): Promise<CapabilityHistoryRow[]>
	createCapability(studentGradeId: number, data: CapabilityWriteDto): Promise<CapabilityPublishResult>
	/** Legacy @change — supersedes the agreed capability with a fresh unagreed copy. */
	changeCapability(studentGradeId: number): Promise<CapabilityPublishResult>

	// Level 5: the line items
	getCapabilityItemPage(capabilityId: number, studentGradeId: number): Promise<CapabilityItemPage>
	getCapabilityItems(capabilityId: number, studentGradeId: number): Promise<CapabilityItemRow[]>
	updateCapabilityItems(
		capabilityId: number,
		studentGradeId: number,
		data: CapabilityWriteDto,
	): Promise<AdminMessageResult>
	/** Legacy @publishInvoice — agrees the capability and generates the santri's invoices. */
	publishCapability(capabilityId: number, studentGradeId: number): Promise<CapabilityPublishResult>

	// The agreement document
	downloadCapability(capabilityId: number, studentGradeId: number): Promise<{ blob: Blob; fileName: string | null }>
	/** Legacy @print — an HTML page opened with target="_blank". */
	capabilityPrintUrl(capabilityId: number, studentGradeId: number): string
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

const BASE = "/admin/student-capabilities"

/** The selection travels in the query string, as it does on the phase 1 payment page. */
const selection = (studentGradeIds: number[]): { students: string } => ({ students: studentGradeIds.join(",") })

export const createAdminCapabilitiesApi = (client: AxiosInstance): AdminCapabilitiesApi => ({
	getCapabilityAcademicYears: () => unwrap(client.get(BASE)),
	getCapabilityGrades: (academicYearId) => unwrap(client.get(`${BASE}/academic-years/${academicYearId}/grades`)),
	getCapabilityStudents: (academicYearId, gradeId) =>
		unwrap(client.get(`${BASE}/academic-years/${academicYearId}/grades/${gradeId}/students`)),

	storeCapabilitySelection: (academicYearId, gradeId, data) =>
		unwrap(client.post(`${BASE}/academic-years/${academicYearId}/grades/${gradeId}/selection`, data)),

	getCapabilityMassCreate: (academicYearId, gradeId, studentGradeIds) =>
		unwrap(
			client.get(`${BASE}/academic-years/${academicYearId}/grades/${gradeId}/mass-create`, {
				params: selection(studentGradeIds),
			}),
		),
	getCapabilityMassCreateAccounts: (academicYearId, gradeId) =>
		unwrap(client.get(`${BASE}/academic-years/${academicYearId}/grades/${gradeId}/mass-create/accounts`)),
	massCreateCapability: (academicYearId, gradeId, data) =>
		unwrap(client.post(`${BASE}/academic-years/${academicYearId}/grades/${gradeId}/mass-create`, data)),

	getCapabilityMassEdit: (academicYearId, gradeId, studentGradeIds) =>
		unwrap(
			client.get(`${BASE}/academic-years/${academicYearId}/grades/${gradeId}/mass-edit`, {
				params: selection(studentGradeIds),
			}),
		),
	getCapabilityMassEditAccounts: (academicYearId, gradeId, studentGradeIds) =>
		unwrap(
			client.get(`${BASE}/academic-years/${academicYearId}/grades/${gradeId}/mass-edit/accounts`, {
				params: selection(studentGradeIds),
			}),
		),
	massUpdateCapability: (academicYearId, gradeId, data) =>
		unwrap(client.post(`${BASE}/academic-years/${academicYearId}/grades/${gradeId}/mass-edit`, data)),

	getCapabilityStudentPage: (studentGradeId) => unwrap(client.get(`${BASE}/students/${studentGradeId}`)),
	getCapabilityHistory: (studentGradeId) => unwrap(client.get(`${BASE}/students/${studentGradeId}/history`)),
	createCapability: (studentGradeId, data) => unwrap(client.post(`${BASE}/students/${studentGradeId}`, data)),
	changeCapability: (studentGradeId) => unwrap(client.post(`${BASE}/students/${studentGradeId}/change`)),

	getCapabilityItemPage: (capabilityId, studentGradeId) =>
		unwrap(client.get(`${BASE}/${capabilityId}/students/${studentGradeId}`)),
	getCapabilityItems: (capabilityId, studentGradeId) =>
		unwrap(client.get(`${BASE}/${capabilityId}/students/${studentGradeId}/items`)),
	updateCapabilityItems: (capabilityId, studentGradeId, data) =>
		unwrap(client.patch(`${BASE}/${capabilityId}/students/${studentGradeId}`, data)),
	publishCapability: (capabilityId, studentGradeId) =>
		unwrap(client.post(`${BASE}/${capabilityId}/students/${studentGradeId}/publish`)),

	downloadCapability: (capabilityId, studentGradeId) =>
		client
			.get<Blob>(`${BASE}/${capabilityId}/students/${studentGradeId}/download`, { responseType: "blob" })
			.then((response) => ({
				blob: response.data,
				fileName: fileNameFromDisposition(response.headers["content-disposition"] as string | undefined),
			})),

	capabilityPrintUrl: (capabilityId, studentGradeId) =>
		`${client.defaults.baseURL ?? ""}${BASE}/${capabilityId}/students/${studentGradeId}/print`,
})
