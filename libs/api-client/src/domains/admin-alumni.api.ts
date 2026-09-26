import type { AxiosInstance } from "axios"

import type { AdminAlumniDetail, AdminAlumniList, AdminAlumniMessage, AdminAlumniYearRow } from "@roja/types"

/**
 * Endpoints behind the admin Akademik → Alumni pages (`/admin/alumni/*`), ported 1:1 from legacy.
 * Owned by workstream AK-A. Gated Superadmin | Admin (legacy `asAdmin`).
 *
 * Name every method with `Alumni` in it (e.g. `getAlumni…`) so it cannot collide with another
 * domain spread into `AdminApi`. Unwrap the `{ data }` envelope the same way
 * `admin-ewallet.api.ts` does; downloads return `{ blob, fileName }`.
 */
export type AdminAlumniApi = {
	/** `list()` — the "Alumni" tab: one row per graduation year. */
	getAlumniYears(): Promise<AdminAlumniYearRow[]>
	/** `listArchive()` — the "Archive" tab. */
	getAlumniArchive(): Promise<AdminAlumniList>
	/** `listByYear()` — `/alumni/graduation-year/$year`. */
	getAlumniByYear(year: number): Promise<AdminAlumniList>
	/** `download()` — "Hasil export data alumni.xlsx". */
	downloadAlumniExport(year: number): Promise<{ blob: Blob; fileName: string | null }>
	/** `destroyByGraduationYear()` — every alumnus of the year, archive rows included (legacy quirk). */
	deleteAlumniYear(year: number): Promise<AdminAlumniMessage>
	/** `edit()` */
	getAlumniDetail(alumniId: number): Promise<AdminAlumniDetail>
	/** `update()` — multipart: society values by name, `diseases` as JSON, `attach_*` files. */
	updateAlumni(alumniId: number, form: FormData): Promise<AdminAlumniMessage>
	/** `destroy()` — restores the santri's grade row and unblocks the account. */
	deleteAlumni(alumniId: number): Promise<AdminAlumniMessage>
	/** `print()` — opened in a new tab; the `access_token` cookie authenticates it. */
	alumniPrintUrl(alumniId: number): string
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

const BASE = "/admin/alumni"

// The client's default `Content-Type: application/json` makes axios turn a FormData body into JSON (files
// dropped), so every multipart call sets the header explicitly, as `admin-student.api.ts` does.
const MULTIPART = { headers: { "Content-Type": "multipart/form-data" } }

export const createAdminAlumniApi = (client: AxiosInstance): AdminAlumniApi => ({
	getAlumniYears: () => unwrap(client.get(`${BASE}/years`)),
	getAlumniArchive: () => unwrap(client.get(`${BASE}/archive`)),
	getAlumniByYear: (year) => unwrap(client.get(`${BASE}/graduation-years/${year}`)),
	downloadAlumniExport: (year) =>
		client.get<Blob>(`${BASE}/graduation-years/${year}/export`, { responseType: "blob" }).then((response) => ({
			blob: response.data,
			fileName: fileNameFromDisposition(response.headers["content-disposition"] as string | undefined),
		})),
	deleteAlumniYear: (year) => unwrap(client.delete(`${BASE}/graduation-years/${year}`)),
	getAlumniDetail: (alumniId) => unwrap(client.get(`${BASE}/${alumniId}`)),
	updateAlumni: (alumniId, form) => unwrap(client.patch(`${BASE}/${alumniId}`, form, MULTIPART)),
	deleteAlumni: (alumniId) => unwrap(client.delete(`${BASE}/${alumniId}`)),
	alumniPrintUrl: (alumniId) => `${client.defaults.baseURL ?? ""}${BASE}/${alumniId}/print`,
})
