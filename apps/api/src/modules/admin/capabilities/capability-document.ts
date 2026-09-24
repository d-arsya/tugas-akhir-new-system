// The data both Kesanggupan agreement documents read (`print/capability.blade.php` and
// `download/capability-download.blade.php`), and the formatting helpers they share. Split out of
// `capability-format.ts` so the drill-down's cell renderers and the documents' helpers each stay
// under the 300-line limit.

import type { CapabilityStatus } from "@roja/types"

import { toAmount } from "@shared/billing/invoice-calculator"

export type CapabilityDocumentStudent = {
	studentGradeId: string
	fullname: string | null
	schoolName: string | null
	currentAcademicYear: string | null
	grade: string | null
	fatherFullname: string | null
	fatherJob: string | null
	fatherPhone: string | null
	familyStreet: string | null
	familyRt: string | null
	familyRw: string | null
	familySubVillage: string | null
	familyVillage: string | null
	districtName: string | null
	regencyName: string | null
	provinceName: string | null
	academicYearId: string | null
}

export type CapabilityDocumentItem = {
	id: string
	accountancyId: string | null
	name: string | null
	amount: string | null
	period: "once" | "monthly" | null
}

export type CapabilityDocumentSchool = {
	name: string | null
	phone: string | null
	logo: string | null
	fullAddress: string | null
	districtName: string | null
	regencyName: string | null
	provinceName: string | null
}

export type CapabilityDocumentData = {
	/**
	 * The capability's own status. Only `approve` and `changed` are immutable — a `disapprove`
	 * capability is still being edited — so only those two may be served from the stored copy.
	 */
	status: CapabilityStatus | null
	/** `approve_date` as a Jakarta wall-clock stamp; pins the PDF's creation date. */
	approveDate: string | null
	student: CapabilityDocumentStudent
	items: CapabilityDocumentItem[]
	school: CapabilityDocumentSchool | null
	/**
	 * `storage_url($setting_school->logo)` — what the **print** view puts in an `<img src>`, since
	 * that document is fetched by a browser. Null falls back to the blade's `<h2>` brand heading.
	 */
	logoUrl: string | null
	/**
	 * The same logo's bytes. The **download** blade uses `storage_file_path()`, a local path dompdf
	 * reads off disk; the files live on S3 here, so the PDF renderer is handed the bytes instead of
	 * being given a URL to fetch mid-render. Null falls back to the same brand heading.
	 */
	logo: Buffer | null
}

/** `config('app.name')` — `.env` sets `APP_NAME="ROJA"`. */
export const APP_NAME = "ROJA"

/** Blade `{{ }}` escapes with `htmlspecialchars($value, ENT_QUOTES, 'UTF-8', true)`. */
export const escapeHtml = (value: unknown): string =>
	String(value ?? "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;")

/** `number_format($value, 0, ",", ".")`; the documents write the `Rp` themselves. */
export const numberFormat = (value: number): string => {
	const whole = Math.trunc(Math.abs(value))
		.toString()
		.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
	return value < 0 ? `-${whole}` : whole
}

/** `'Rp ' . number_format($amount, 0, ",", ".")` — what both documents print in the Kesanggupan column. */
export const rupiah = (value: number): string => `Rp ${numberFormat(value)}`

/**
 * `SettingSchool::getSchoolFullAddressAttribute()` (SettingSchool.php:20-31).
 *
 * Unlike the receipt's `school_invoice_address`, this one keeps the default prefixes, so
 * `getDistrictName()` yields `"Kecamatan " . $name` and `getProvinceName()` `"Provinsi " . $name`.
 * Each helper returns `""` when the lookup misses, which the LEFT JOINs give as NULL.
 */
export const schoolFullAddress = (school: CapabilityDocumentSchool | null): string => {
	if (!school) return ""
	const district = school.districtName ? `Kecamatan ${school.districtName}` : ""
	const province = school.provinceName ? `Provinsi ${school.provinceName}` : ""
	return `${school.fullAddress ?? ""}, ${district}, ${school.regencyName ?? ""}, ${province}`
}

/**
 * The family address line, interpolated exactly as both blades write it — including the trailing
 * comma after the village and the plain space that joins the regency to the province, neither of
 * which is a separator the data supplies.
 */
export const familyAddress = (student: CapabilityDocumentStudent): string =>
	`${student.familyStreet ?? ""}, RT ${student.familyRt ?? ""}, RW ${student.familyRw ?? ""}, ` +
	`Dusun ${student.familySubVillage ?? ""}, Kelurahan ${student.familyVillage ?? ""}, ` +
	`${student.districtName ? `Kecamatan ${student.districtName}` : ""}, ${student.regencyName ?? ""} ` +
	`${student.provinceName ? `Provinsi ${student.provinceName}` : ""}`

/** The school name both documents fall back on: `$setting_school->name ? … : config('app.name')`. */
export const schoolName = (school: CapabilityDocumentSchool | null): string =>
	school?.name ? school.name : APP_NAME

export const documentTotal = (items: readonly CapabilityDocumentItem[]): number =>
	items.reduce((sum, item) => sum + toAmount(item.amount), 0)

/**
 * `"Kesanggupan - {$student_grade->fullname}.pdf"`.
 *
 * Legacy interpolates the name straight into `Content-Disposition`, so a santri called `A/B` gives
 * a filename with a path separator in it and a `"` closes the header's quoted string early. Both
 * are stripped; the caller still sends the real name through RFC 6266's `filename*`.
 */
export const capabilityFileName = (fullname: string | null): string => {
	const safe = (fullname ?? "")
		// eslint-disable-next-line no-control-regex
		.replace(/[\u0000-\u001F\u007F"\\/:*?<>|]/g, " ")
		.replace(/\s+/g, " ")
		.trim()
	return safe === "" ? "Kesanggupan.pdf" : `Kesanggupan - ${safe}.pdf`
}
