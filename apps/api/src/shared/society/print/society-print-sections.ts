import type { PrintData } from "./society-print-data"
import {
	FORMATTED,
	dayMonthYear,
	esc,
	fullAddress,
	groupAllDisabled,
	inputLabel,
	inputStatus,
	lineVisible,
	orDash,
	phoneNumber,
	schoolFullAddress,
	tr,
	ucwords,
	ucwordsOrDash,
	upperOrDash,
} from "./society-print-format"

// OWNER: AK-A. Sections B–E of `resources/views/print/{registrant,student,alumni}.blade.php` (identical in the
// three blades apart from the record variable and "Data Diri Santri" / "Data Diri Alumni"). `{{ }}` values are
// escaped, `{!! !!}` rich-text values (learning_achievment, gift) are printed raw, as the blades do.

type Row = (id: number, value: string) => string

const rowsFor = (data: PrintData): Row => (id, value) => (inputStatus(data, id) ? tr(inputLabel(data, id), value) : "")

const label = (letter: string, text: string, first = false): string => `
                        <div class="tbr_label${first ? " mt-0" : ""}">
                            <div class="tbr_label_bullet">${esc(letter)}</div>
                            <div class="tbr_label_block">${text}</div>
                        </div>`

const desc = (title: string, body: string, extraClass = ""): string => `
                                <div class="tbr_data_desc${extraClass}">
                                    <div class="text-weight-600 text-default mb-5">${esc(title)}</div>
                                    ${body}
                                </div>`

const table = (rows: string): string => `
                                <table class="mt-0 mb-25">${rows}
                                </table>`

/** Data Diri (personal data, except 12, 13, 15, 16, 17 — phone, address, NIK, KSP and KIP are never printed). */
export const personalSection = (data: PrintData, letter: string, title: string): string => {
	if (groupAllDisabled(data, "personal data", [12, 13, 15, 16, 17])) return ""
	const r = data.row
	const row = rowsFor(data)
	const rows = [
		row(1, esc(orDash(r["fullname"]))),
		row(2, esc(orDash(r["shortname"]))),
		row(3, esc(ucwordsOrDash(r["religion"]))),
		row(5, esc(orDash(r["place_of_birth"]))),
		row(6, esc(dayMonthYear(r["date_of_birth"]))),
		row(7, esc(upperOrDash(r["nationality"]))),
		row(8, esc(FORMATTED.liveWith(r["live_with"]))),
		row(9, `${esc(r["sibling_order"])} dari ${esc(r["number_of_sibling"])} bersaudara`),
		row(10, esc(FORMATTED.parentStatus(r["parent_status"]))),
		row(11, esc(FORMATTED.childStatus(r["child_status"]))),
		row(14, esc(orDash(r["nisn"]))),
		row(18, esc(orDash(r["certificate_number"]))),
		row(19, esc(orDash(r["school_name"]))),
		row(20, esc(phoneNumber(r["school_phone"]))),
		row(21, esc(schoolFullAddress(data))),
	].join("")
	return `${label(letter, title, true)}
                        <div class="tbr_data">
                            <table class="mt-0 mb-25">${rows}
                            </table>
                        </div>`
}

/** Identitas (identity data, except the accordion labels 22, 29, 31, 34). */
export const identitySection = (data: PrintData, letter: string): string => {
	if (groupAllDisabled(data, "identity data", [22, 29, 31, 34])) return ""
	const r = data.row
	const row = rowsFor(data)
	const parts: string[] = []

	if (lineVisible(data, 23, 27)) {
		parts.push(
			table(
				[
					row(23, `${esc(r["weight"])} Kg, ${esc(r["height"])} Cm`),
					row(24, esc(upperOrDash(r["blood_type"]))),
					row(25, esc(FORMATTED.visual(r["visual_condition"]))),
					row(26, esc(FORMATTED.hearing(r["hearing_condition"]))),
					row(27, esc(FORMATTED.immunization(r["immunization_given"]))),
				].join(""),
			),
		)
	}
	if (inputStatus(data, 28)) {
		const items =
			data.diseases.length > 0
				? data.diseases.map((d) => `<li>${esc(d.name)} (${esc(d.status)})</li>`).join("\n                                    ")
				: "<li>Tidak ada</li>"
		parts.push(desc("Riwayat Penyakit yang Pernah Diderita", `<ol>\n                                    ${items}\n                                    </ol>`))
	}
	if (inputStatus(data, 30)) parts.push(desc(inputLabel(data, 29), r["learning_achievment"] ?? ""))
	if (inputStatus(data, 32) || inputStatus(data, 33)) parts.push(desc("Prestasi Dinniyah", "", " pb-0"))
	if (lineVisible(data, 32, 33)) {
		const reading =
			r["reading"] === "jilid" ? `${ucwords(r["reading"])} ${r["jilid_chapter"] ?? ""}` : ucwordsOrDash(r["reading"])
		parts.push(table([row(32, esc(reading)), row(33, esc(orDash(r["quran_memorizing"])))].join("")))
	}
	if (inputStatus(data, 35)) parts.push(desc(inputLabel(data, 34), r["gift"] ?? ""))

	return `${label(letter, "Identitas")}
                        <div class="tbr_data">${parts.join("\n")}
                        </div>`
}

/** Data Keluarga (family data, except the accordion labels 36 and 51). */
export const familySection = (data: PrintData, letter: string): string => {
	if (groupAllDisabled(data, "family data", [36, 51])) return ""
	const r = data.row
	const row = rowsFor(data)
	const parts: string[] = []
	// `*_whatsapp` is bigint only in tbr_registrants
	const whatsappBigint = data.society === "registrant"
	if (lineVisible(data, 37, 50)) {
		const person = (prefix: "father" | "mother", firstId: number): string[] => [
			row(firstId, esc(r[`${prefix}_fullname`])),
			row(firstId + 1, esc(ucwordsOrDash(r[`${prefix}_religion`]))),
			row(firstId + 2, esc(upperOrDash(r[`${prefix}_nationality`]))),
			row(firstId + 3, esc(upperOrDash(r[`${prefix}_last_education`]))),
			row(firstId + 4, esc(phoneNumber(r[`${prefix}_phone`]))),
			row(firstId + 5, esc(phoneNumber(r[`${prefix}_whatsapp`], whatsappBigint))),
			row(firstId + 6, esc(r[`${prefix}_job`])),
		]
		parts.push(table([...person("father", 37), ...person("mother", 44)].join("")))
	}
	if (inputStatus(data, 52)) parts.push(desc(inputLabel(data, 51), esc(fullAddress(data, "family"))))
	return `${label(letter, "Data Keluarga")}
                        <div class="tbr_data">${parts.join("\n")}
                        </div>`
}

/** Data Wali (guardian data, except the accordion labels 53 and 61). */
export const guardianSection = (data: PrintData, letter: string): string => {
	if (groupAllDisabled(data, "guardian data", [53, 61])) return ""
	const r = data.row
	const row = rowsFor(data)
	const parts: string[] = []
	if (lineVisible(data, 54, 60)) {
		parts.push(
			table(
				[
					row(54, esc(orDash(r["guardian_fullname"]))),
					row(55, esc(ucwordsOrDash(r["guardian_religion"]))),
					row(56, esc(upperOrDash(r["guardian_nationality"]))),
					row(57, esc(upperOrDash(r["guardian_last_education"]))),
					row(58, esc(phoneNumber(r["guardian_phone"]))),
					row(59, esc(phoneNumber(r["guardian_whatsapp"], data.society === "registrant"))),
					row(60, esc(orDash(r["guardian_job"]))),
				].join(""),
			),
		)
	}
	if (inputStatus(data, 62)) parts.push(desc(inputLabel(data, 61), esc(fullAddress(data, "guardian"))))
	return `${label(letter, "Data Wali")}
                        <div class="tbr_data">${parts.join("\n")}
                        </div>`
}

/** The alumni-only "A — Overview" block (always lettered "A"). */
export const alumniOverview = (data: PrintData): string => {
	const r = data.row
	const rich = (value: string | null | undefined): string => value ?? "-"
	return `${label("A", "Overview", true)}
                        <div class="tbr_data">${desc("Minat Bakat", rich(r["alumni_talent"]))}
${desc("Studi Lanjutan", rich(r["advanced_study"]))}
${desc("Profesi atau aktivitas kegiatan", rich(r["profession"]))}

                            <div class="tbr_table_below"></div>

                            <table class="mt-25 mb-25">${tr("Status Menikah", esc(FORMATTED.marriage(r["marriage_status"])))}${tr("Nomor Telepon", esc(phoneNumber(r["alumni_phone"])))}${tr("Email", esc(orDash(r["alumni_email"])))}${tr("Alamat", esc(fullAddress(data, "alumni")))}
                            </table>
                        </div>`
}

/** Student "E — Lainnya" (hard-coded "E") and registrant "Lainnya" (`$alphabet[4]`, the attachment group's letter). */
export const otherSection = (data: PrintData, letter: string): string => {
	const r = data.row
	const student = data.society === "student"
	const rows = [
		tr("Tahun Ajaran", esc(orDash(r["academic_year"]))),
		tr("Jenjang", esc(orDash(r["level_name"]))),
		// the registrant blade prints `$registrant->grade()->name`, a stub that always answers "IT"
		tr("Kelas", student ? `Kelas ${esc(r["grade"] ?? "tidak diketahui")}` : "IT"),
		student ? tr("Jurusan", esc(orDash(r["major_name"]))) : "",
		tr("Email", esc(orDash(student ? r["student_email"] : r["email"]))),
	].join("")
	return `${label(letter, "Lainnya")}
                        <div class="tbr_data">
                            <table class="mt-0 mb-25">${rows}
                            </table>
                        </div>`
}
