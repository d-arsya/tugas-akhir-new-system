import type { AxiosInstance } from "axios"

import type {
	AcademicYearDeleteStep,
	AcademicYearDeleteTarget,
	AcademicYearDetail,
	AcademicYearPayload,
	AcademicYearQuotaRow,
	AcademicYearRow,
	AdminMessageResult,
	AdminRedirectResult,
	GradeDetail,
	GradePayload,
	GradeRow,
	LevelDelegatePayload,
	LevelDeleteStep,
	LevelDeleteTarget,
	LevelDetail,
	LevelOption,
	LevelPayload,
	LevelRow,
	MajorDetail,
	MajorPayload,
	MajorRow,
	SubGradeDetail,
	SubGradePayload,
	SubGradeRow,
} from "@roja/types"

/**
 * Endpoints behind the admin "Data Master" menu, phase 1 (Tahun Ajaran, Akademik).
 *
 * List getters are named `get*Rows` rather than `get*s` on purpose: the previous
 * client had `getAcademicYears`/`getGrades`/`getMajors` returning invented shapes,
 * and renaming makes every stale call site fail to compile instead of silently
 * type-checking against the new one.
 */
export interface AdminMasterApi {
	// Tahun Ajaran
	getAcademicYearRows(): Promise<AcademicYearRow[]>
	getAcademicYear(id: number): Promise<AcademicYearDetail>
	/** Quota table on the create page — every shown level, no year context. */
	getAcademicYearQuotaRows(): Promise<AcademicYearQuotaRow[]>
	/** Quota table on the edit page — quota, PSB and TMQ counts for one year. */
	getAcademicYearQuotaRowsFor(id: number): Promise<AcademicYearQuotaRow[]>
	createAcademicYear(data: AcademicYearPayload): Promise<AdminMessageResult>
	updateAcademicYear(id: number, data: AcademicYearPayload): Promise<AdminMessageResult>

	// Tahun Ajaran — delete and the delegation chain
	getAcademicYearDeleteStep(
		id: number,
		step: AcademicYearDeleteTarget,
	): Promise<AcademicYearDeleteStep>
	deleteAcademicYear(id: number): Promise<AdminRedirectResult>
	delegateAcademicYearRegistrant(id: number): Promise<AdminRedirectResult>
	delegateAcademicYearStudent(id: number): Promise<AdminRedirectResult>
	delegateAcademicYearAlumni(id: number): Promise<AdminRedirectResult>

	// Jenjang
	getLevelRows(): Promise<LevelRow[]>
	getLevelOptions(exclude?: number): Promise<LevelOption[]>
	getLevel(id: number): Promise<LevelDetail>
	createLevel(data: LevelPayload): Promise<AdminMessageResult>
	updateLevel(id: number, data: LevelPayload): Promise<AdminMessageResult>

	// Jenjang — delete and the delegation chain
	getLevelDeleteStep(id: number, step: LevelDeleteTarget): Promise<LevelDeleteStep>
	deleteLevel(id: number): Promise<AdminRedirectResult>
	delegateLevelMajor(id: number, data: LevelDelegatePayload): Promise<AdminRedirectResult>
	delegateLevelGrade(id: number, data: LevelDelegatePayload): Promise<AdminRedirectResult>
	delegateLevelRegistrant(id: number, data: LevelDelegatePayload): Promise<AdminRedirectResult>
	delegateLevelStudent(id: number, data: LevelDelegatePayload): Promise<AdminRedirectResult>

	// Jurusan
	getMajorRows(): Promise<MajorRow[]>
	getMajor(id: number): Promise<MajorDetail>
	createMajor(data: MajorPayload): Promise<AdminMessageResult>
	updateMajor(id: number, data: MajorPayload): Promise<AdminMessageResult>
	deleteMajor(id: number): Promise<AdminMessageResult>

	// Kelas
	getGradeRows(): Promise<GradeRow[]>
	getGrade(id: number): Promise<GradeDetail>
	createGrade(data: GradePayload): Promise<AdminMessageResult>
	updateGrade(id: number, data: GradePayload): Promise<AdminMessageResult>
	deleteGrade(id: number): Promise<AdminMessageResult>

	// Subkelas
	getSubGradeRows(): Promise<SubGradeRow[]>
	getSubGrade(id: number): Promise<SubGradeDetail>
	createSubGrade(data: SubGradePayload): Promise<AdminMessageResult>
	updateSubGrade(id: number, data: SubGradePayload): Promise<AdminMessageResult>
	deleteSubGrade(id: number): Promise<AdminMessageResult>
}

const unwrap = <T>(promise: Promise<{ data: unknown }>): Promise<T> =>
	promise.then((response) => {
		const body = response.data
		if (body && typeof body === "object" && "data" in body) {
			return (body as { data: T }).data
		}
		return body as T
	})

export const createAdminMasterApi = (client: AxiosInstance): AdminMasterApi => ({
	getAcademicYearRows: () => unwrap(client.get("/admin/academic-years")),
	getAcademicYear: (id) => unwrap(client.get(`/admin/academic-years/${id}`)),
	getAcademicYearQuotaRows: () => unwrap(client.get("/admin/academic-years/levels")),
	getAcademicYearQuotaRowsFor: (id) => unwrap(client.get(`/admin/academic-years/${id}/levels`)),
	createAcademicYear: (data) => unwrap(client.post("/admin/academic-years", data)),
	updateAcademicYear: (id, data) => unwrap(client.patch(`/admin/academic-years/${id}`, data)),

	getAcademicYearDeleteStep: (id, step) =>
		unwrap(client.get(`/admin/academic-years/${id}/delete-step`, { params: { step } })),
	deleteAcademicYear: (id) => unwrap(client.delete(`/admin/academic-years/${id}`)),
	delegateAcademicYearRegistrant: (id) =>
		unwrap(client.patch(`/admin/academic-years/${id}/delegate-registrant`)),
	delegateAcademicYearStudent: (id) =>
		unwrap(client.patch(`/admin/academic-years/${id}/delegate-student`)),
	delegateAcademicYearAlumni: (id) =>
		unwrap(client.patch(`/admin/academic-years/${id}/delegate-alumni`)),

	getLevelRows: () => unwrap(client.get("/admin/levels")),
	getLevelOptions: (exclude) => unwrap(client.get("/admin/levels/options", { params: { exclude } })),
	getLevel: (id) => unwrap(client.get(`/admin/levels/${id}`)),
	createLevel: (data) => unwrap(client.post("/admin/levels", data)),
	updateLevel: (id, data) => unwrap(client.patch(`/admin/levels/${id}`, data)),

	getLevelDeleteStep: (id, step) =>
		unwrap(client.get(`/admin/levels/${id}/delete-step`, { params: { step } })),
	deleteLevel: (id) => unwrap(client.delete(`/admin/levels/${id}`)),
	delegateLevelMajor: (id, data) => unwrap(client.patch(`/admin/levels/${id}/delegate-major`, data)),
	delegateLevelGrade: (id, data) => unwrap(client.patch(`/admin/levels/${id}/delegate-grade`, data)),
	delegateLevelRegistrant: (id, data) =>
		unwrap(client.patch(`/admin/levels/${id}/delegate-registrant`, data)),
	delegateLevelStudent: (id, data) =>
		unwrap(client.patch(`/admin/levels/${id}/delegate-student`, data)),

	getMajorRows: () => unwrap(client.get("/admin/majors")),
	getMajor: (id) => unwrap(client.get(`/admin/majors/${id}`)),
	createMajor: (data) => unwrap(client.post("/admin/majors", data)),
	updateMajor: (id, data) => unwrap(client.patch(`/admin/majors/${id}`, data)),
	deleteMajor: (id) => unwrap(client.delete(`/admin/majors/${id}`)),

	getGradeRows: () => unwrap(client.get("/admin/grades")),
	getGrade: (id) => unwrap(client.get(`/admin/grades/${id}`)),
	createGrade: (data) => unwrap(client.post("/admin/grades", data)),
	updateGrade: (id, data) => unwrap(client.patch(`/admin/grades/${id}`, data)),
	deleteGrade: (id) => unwrap(client.delete(`/admin/grades/${id}`)),

	getSubGradeRows: () => unwrap(client.get("/admin/sub-grades")),
	getSubGrade: (id) => unwrap(client.get(`/admin/sub-grades/${id}`)),
	createSubGrade: (data) => unwrap(client.post("/admin/sub-grades", data)),
	updateSubGrade: (id, data) => unwrap(client.patch(`/admin/sub-grades/${id}`, data)),
	deleteSubGrade: (id) => unwrap(client.delete(`/admin/sub-grades/${id}`)),
})
