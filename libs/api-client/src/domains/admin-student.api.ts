import type { AxiosInstance } from "axios"

import type {
	AdminStudentAcademicYear,
	AdminStudentCreated,
	AdminStudentDetail,
	AdminStudentDropoutDto,
	AdminStudentGradeRow,
	AdminStudentIdsDto,
	AdminStudentMajorDto,
	AdminStudentMessage,
	AdminStudentOptions,
	AdminStudentRosterPage,
	AdminStudentRosterRow,
	AdminStudentStatusDto,
	AdminStudentSubGradeDto,
	AdminStudentYearRow,
	SocietyDraftStepKey,
	SocietyStepCheckDto,
} from "@roja/types"

/**
 * Endpoints behind the admin Akademik → Santri pages (`/admin/students/*`), ported 1:1 from legacy
 * `StudentController` and the `Student\*` wizard controllers. Owned by workstream AK-S. Gated
 * Superadmin | Admin (legacy `asAdmin`).
 *
 * Every list answers the whole set (legacy client-side DataTables). The multipart saves take a
 * ready `FormData` built with the society multipart convention (`toSocietyFormData` in the admin).
 */
export type AdminStudentApi = {
	getStudentAcademicYears(): Promise<AdminStudentYearRow[]>
	getStudentAcademicYear(academicYearId: number): Promise<AdminStudentAcademicYear>
	getStudentGrades(academicYearId: number): Promise<AdminStudentGradeRow[]>
	deleteStudentsByGrade(academicYearId: number, grade: number): Promise<AdminStudentMessage>
	getStudentRosterPage(academicYearId: number, grade: number, levelId: number): Promise<AdminStudentRosterPage>
	getStudentRoster(academicYearId: number, grade: number, levelId: number): Promise<AdminStudentRosterRow[]>
	downloadStudentRoster(academicYearId: number, grade: number, levelId: number): Promise<{ blob: Blob; fileName: string | null }>
	getStudentOptions(): Promise<AdminStudentOptions>

	nextStudentGrades(data: AdminStudentIdsDto): Promise<AdminStudentMessage>
	stayStudentGrades(data: AdminStudentIdsDto): Promise<AdminStudentMessage>
	graduateStudents(data: AdminStudentIdsDto): Promise<AdminStudentMessage>
	dropoutStudents(data: AdminStudentDropoutDto): Promise<AdminStudentMessage>
	updateStudentMajor(data: AdminStudentMajorDto): Promise<AdminStudentMessage>
	updateStudentStatus(data: AdminStudentStatusDto): Promise<AdminStudentMessage>
	updateStudentSubGrade(data: AdminStudentSubGradeDto): Promise<AdminStudentMessage>

	getStudentDetail(studentGradeId: number): Promise<AdminStudentDetail>
	updateStudent(studentGradeId: number, form: FormData): Promise<AdminStudentMessage>
	deleteStudent(studentGradeId: number): Promise<AdminStudentMessage>
	/** Opened with `target="_blank"`; the API reads the `access_token` cookie. */
	studentPrintUrl(studentGradeId: number): string

	validateStudentStep(step: SocietyDraftStepKey, data: SocietyStepCheckDto): Promise<AdminStudentMessage>
	createStudent(form: FormData): Promise<AdminStudentCreated>
}

const BASE = "/admin/students"
// As `admin-lainnya.api.ts` sends the school form: the client default is JSON
const MULTIPART = { headers: { "Content-Type": "multipart/form-data" } }

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

const classPath = (academicYearId: number, grade: number, levelId: number): string =>
	`${BASE}/academic-years/${academicYearId}/grades/${grade}/levels/${levelId}`

export const createAdminStudentApi = (client: AxiosInstance): AdminStudentApi => ({
	getStudentAcademicYears: () => unwrap(client.get(`${BASE}/academic-years`)),
	getStudentAcademicYear: (academicYearId) => unwrap(client.get(`${BASE}/academic-years/${academicYearId}`)),
	getStudentGrades: (academicYearId) => unwrap(client.get(`${BASE}/academic-years/${academicYearId}/grades`)),
	deleteStudentsByGrade: (academicYearId, grade) => unwrap(client.delete(`${BASE}/academic-years/${academicYearId}/grades/${grade}`)),
	getStudentRosterPage: (academicYearId, grade, levelId) => unwrap(client.get(classPath(academicYearId, grade, levelId))),
	getStudentRoster: (academicYearId, grade, levelId) => unwrap(client.get(`${classPath(academicYearId, grade, levelId)}/students`)),
	downloadStudentRoster: (academicYearId, grade, levelId) =>
		client.get<Blob>(`${classPath(academicYearId, grade, levelId)}/export`, { responseType: "blob" }).then((response) => ({
			blob: response.data,
			fileName: fileNameFromDisposition(response.headers["content-disposition"] as string | undefined),
		})),
	getStudentOptions: () => unwrap(client.get(`${BASE}/options`)),

	nextStudentGrades: (data) => unwrap(client.post(`${BASE}/next-grades`, data)),
	stayStudentGrades: (data) => unwrap(client.post(`${BASE}/stay-grades`, data)),
	graduateStudents: (data) => unwrap(client.post(`${BASE}/graduate`, data)),
	dropoutStudents: (data) => unwrap(client.post(`${BASE}/dropout`, data)),
	updateStudentMajor: (data) => unwrap(client.post(`${BASE}/update-major`, data)),
	updateStudentStatus: (data) => unwrap(client.post(`${BASE}/update-status`, data)),
	updateStudentSubGrade: (data) => unwrap(client.post(`${BASE}/update-sub-grade`, data)),

	getStudentDetail: (studentGradeId) => unwrap(client.get(`${BASE}/${studentGradeId}`)),
	updateStudent: (studentGradeId, form) => unwrap(client.patch(`${BASE}/${studentGradeId}`, form, MULTIPART)),
	deleteStudent: (studentGradeId) => unwrap(client.delete(`${BASE}/${studentGradeId}`)),
	studentPrintUrl: (studentGradeId) => `${client.defaults.baseURL ?? ""}${BASE}/${studentGradeId}/print`,

	validateStudentStep: (step, data) => unwrap(client.post(`${BASE}/create/validate/${step}`, data)),
	createStudent: (form) => unwrap(client.post(`${BASE}/create`, form, MULTIPART)),
})
