import type { AxiosInstance } from "axios"

import type {
	AdminMessageResult,
	AdminSchoolPayload,
	AdminSchoolSetting,
	AdminUserDetail,
	AdminUserPayload,
	AdminUserRow,
	AuthLogPage,
	AuthLogParams,
	CreatePasswordCheck,
	CreatePasswordPayload,
	MyProfile,
	MyProfilePayload,
	SettingAnnouncement,
	SettingAnnouncementPayload,
	SettingFormGroups,
	SettingFormPatch,
	SettingFormPatchResult,
	SmtpPayload,
	SystemSetting,
} from "@roja/types"

import type { AdminLoginResponse } from "./admin.api"

/** Endpoints behind the admin "Lainnya" menu, ported 1:1 from the legacy Laravel pages. */
export interface AdminLainnyaApi {
	// Pengelola
	getUsers(): Promise<AdminUserRow[]>
	getUser(id: number): Promise<AdminUserDetail>
	createUser(data: AdminUserPayload): Promise<AdminMessageResult>
	updateUser(id: number, data: AdminUserPayload): Promise<AdminMessageResult>
	deleteUser(id: number): Promise<AdminMessageResult>

	// Buat Password (guest)
	checkCreatePassword(token: string, email: string): Promise<CreatePasswordCheck>
	createPassword(data: CreatePasswordPayload): Promise<AdminLoginResponse>

	// Authentication Log
	getAuthLogs(params: AuthLogParams): Promise<AuthLogPage>

	// Profil Saya
	getMyProfile(): Promise<MyProfile>
	updateMyProfile(data: MyProfilePayload): Promise<AdminMessageResult>

	// Pengumuman PSB
	getAnnouncement(): Promise<SettingAnnouncement>
	updateAnnouncement(data: SettingAnnouncementPayload): Promise<AdminMessageResult>

	// Form Data Santri
	getSettingForms(): Promise<SettingFormGroups>
	updateSettingForm(id: number, data: SettingFormPatch): Promise<SettingFormPatchResult>

	// Profil Pondok
	getSchool(): Promise<AdminSchoolSetting>
	updateSchool(data: AdminSchoolPayload): Promise<AdminMessageResult>

	// Sistem
	getSystemSetting(): Promise<SystemSetting>
	updateBackupFrequency(backupFrequency: number): Promise<AdminMessageResult>
	updateSmtp(data: SmtpPayload): Promise<AdminMessageResult>
	updateTwoFactor(enabled2fa: boolean): Promise<AdminMessageResult>
	downloadDatabase(): Promise<{ blob: Blob; fileName: string | null }>
}

const unwrap = <T>(promise: Promise<{ data: unknown }>): Promise<T> =>
	promise.then((response) => {
		const body = response.data
		if (body && typeof body === "object" && "data" in body) {
			return (body as { data: T }).data
		}
		return body as T
	})

const unwrapPage = <T>(promise: Promise<{ data: unknown }>): Promise<T> =>
	promise.then((response) => {
		const body = (response.data ?? {}) as { data?: unknown; meta?: unknown }
		return { data: body.data ?? [], meta: body.meta } as T
	})

// RFC 6266: prefer filename* (UTF-8), fall back to the quoted filename
const fileNameFromDisposition = (header: string | undefined): string | null => {
	if (!header) return null
	const encoded = /filename\*=UTF-8''([^;]+)/i.exec(header)?.[1]
	if (encoded) return decodeURIComponent(encoded)
	return /filename="([^"]+)"/i.exec(header)?.[1] ?? null
}

// The school form carries the logo and favicon, so it is sent as multipart like the legacy form
const schoolFormData = (data: AdminSchoolPayload): FormData => {
	const form = new FormData()
	form.append("name", data.name)
	form.append("slogan", data.slogan ?? "")
	form.append("phone", data.phone ?? "")
	form.append("provinceId", String(data.provinceId))
	form.append("regencyId", String(data.regencyId))
	form.append("districtId", String(data.districtId))
	form.append("fullAddress", data.fullAddress)
	form.append("emptyLogo", data.emptyLogo ? "1" : "0")
	form.append("emptyFavicon", data.emptyFavicon ? "1" : "0")
	if (data.logo) form.append("logo", data.logo)
	if (data.favicon) form.append("favicon", data.favicon)
	return form
}

export const createAdminLainnyaApi = (client: AxiosInstance): AdminLainnyaApi => ({
	getUsers: () => unwrap(client.get("/admin/users")),
	getUser: (id) => unwrap(client.get(`/admin/users/${id}`)),
	createUser: (data) => unwrap(client.post("/admin/users", data)),
	updateUser: (id, data) => unwrap(client.patch(`/admin/users/${id}`, data)),
	deleteUser: (id) => unwrap(client.delete(`/admin/users/${id}`)),

	checkCreatePassword: (token, email) =>
		unwrap(client.get("/admin/auth/create-password/check", { params: { token, email } })),
	createPassword: (data) => unwrap(client.post("/admin/auth/create-password", data)),

	getAuthLogs: (params) => unwrapPage(client.get("/admin/auth-logs", { params })),

	getMyProfile: () => unwrap(client.get("/admin/auth/profile")),
	updateMyProfile: (data) => unwrap(client.patch("/admin/auth/profile", data)),

	getAnnouncement: () => unwrap(client.get("/admin/settings/announcement")),
	updateAnnouncement: (data) => unwrap(client.patch("/admin/settings/announcement", data)),

	getSettingForms: () => unwrap(client.get("/admin/settings/forms")),
	updateSettingForm: (id, data) => unwrap(client.patch(`/admin/settings/forms/${id}`, data)),

	getSchool: () => unwrap(client.get("/admin/settings/school")),
	updateSchool: (data) =>
		unwrap(
			client.patch("/admin/settings/school", schoolFormData(data), {
				headers: { "Content-Type": "multipart/form-data" },
			}),
		),

	getSystemSetting: () => unwrap(client.get("/admin/settings/system")),
	updateBackupFrequency: (backupFrequency) =>
		unwrap(client.patch("/admin/settings/system/backup-frequency", { backupFrequency })),
	updateSmtp: (data) => unwrap(client.patch("/admin/settings/system/smtp", data)),
	updateTwoFactor: (enabled2fa) =>
		unwrap(client.patch("/admin/settings/system/two-factor", { enabled2fa })),
	downloadDatabase: () =>
		client
			// No timeout: a database dump can take a while to produce
			.get<Blob>("/admin/settings/system/database/download", { responseType: "blob", timeout: 0 })
			.then((response) => ({
				blob: response.data,
				fileName: fileNameFromDisposition(response.headers["content-disposition"] as string | undefined),
			})),
})
