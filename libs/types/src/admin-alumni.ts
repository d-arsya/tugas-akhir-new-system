// ── Akademik → Alumni (legacy admin.pondokroja.com) ──────────────────────────────────────
//
// Owned by workstream AK-A. Prefix every exported name with `AdminAlumni` so nothing clashes with
// the portal types in `santri.ts` / `psb.ts`. Shared society shapes live in `admin-society.ts`.

import type { SocietyRecord } from "./admin-society"

/** One row of the "Alumni" tab (`AlumniController::list`): a graduation year and its counts. */
export type AdminAlumniYearRow = {
	year: number
	/** Alumni of the year whose academic year exists and is not Archive. */
	total: number
	male: number
	female: number
}

/** One alumnus row (`listArchive` / `listByYear`), as the DataTable cells print it. */
export type AdminAlumniRow = {
	id: number
	/** `storage_url($alumni->attach_photo)`; null → the No-Photo placeholder. */
	photoUrl: string | null
	fullname: string | null
	/** Stored without the 62 prefix (bigint). */
	alumniPhone: string | null
	/** `getProvinceName()` — "Provinsi <name>", "" when unknown. */
	provinceName: string
	/** `getRegencyName()` — the name, "" when unknown. */
	regencyName: string
	/** Summernote HTML, printed raw by the table (DataTables renders cell data as HTML). */
	alumniTalent: string | null
}

export type AdminAlumniList = {
	/** `getInputLabel($setting_forms, 1)` for the name column header. */
	nameLabel: string
	/** `getInputStatus($setting_forms, 1)` — the year page hides the name column when off. */
	nameVisible: boolean
	rows: AdminAlumniRow[]
}

/** The alumni tab inputs (`alumni/partials/edit/data/alumni.blade.php`), as form strings. */
export type AdminAlumniValues = {
	alumni_talent: string
	advanced_study: string
	profession: string
	marriage_status: string
	alumni_phone: string
	alumni_email: string
	alumni_province_id: string
	alumni_regency_id: string
	alumni_district_id: string
	alumni_village: string
	alumni_sub_village: string
	alumni_rt: string
	alumni_rw: string
	alumni_street: string
}

/** `/alumni/detail/$alumniId` — `AlumniController::edit`. */
export type AdminAlumniDetail = {
	id: number
	/** `formatDate($alumni->graduate_year, 'Y')` — the back link, breadcrumb and print year. */
	graduationYear: string
	/** `widget-info.blade.php` */
	widget: {
		photoUrl: string | null
		fullname: string | null
		/** "Tahun ajaran <year>", with "dihapus" for the Archive year. */
		academicYear: string
		/** `formatDate($alumni->graduate_year, 'd F Y \j\a\m H:i')` */
		graduatedAt: string
	}
	alumni: AdminAlumniValues
	/** The five society tabs (`loadSocietyRecord("alumni", id)`). */
	record: SocietyRecord
}

export type AdminAlumniMessage = { message: string }
