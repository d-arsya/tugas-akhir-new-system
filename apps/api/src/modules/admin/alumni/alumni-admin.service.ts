import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
// Nest DI reads constructor parameter types at runtime (emitDecoratorMetadata), so this stays a value import
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { DataSource, Repository } from "typeorm"

import type { AdminAlumniDetail, AdminAlumniList, AdminAlumniRow, AdminAlumniValues, AdminAlumniYearRow } from "@roja/types"

import { societyFileUrl } from "../../../shared/society/files"
import { renderSocietyPrintPage } from "../../../shared/society/print/society-print"
import { loadSocietyRecord } from "../../../shared/society/society-record"
import { MONTHS_ID } from "@admin/common/date-format"
import { SettingForm } from "@shared/school/entities/setting-form.entity"

import { ALUMNI_EXPORT_FILE, buildAlumniWorkbook } from "./alumni-export"
import * as sql from "./alumni-sql"

// OWNER: AK-A. Legacy `AlumniController` reads: `list`, `listArchive`, `listByYear`, `download`, `edit`, `print`.

type Row = Record<string, string | null>

const NOT_FOUND = "Data alumni tidak ditemukan."

const ALUMNI_KEYS: ReadonlyArray<keyof AdminAlumniValues> = [
	"alumni_talent",
	"advanced_study",
	"profession",
	"marriage_status",
	"alumni_phone",
	"alumni_email",
	"alumni_province_id",
	"alumni_regency_id",
	"alumni_district_id",
	"alumni_village",
	"alumni_sub_village",
	"alumni_rt",
	"alumni_rw",
	"alumni_street",
]

/** `formatDate($graduate_year, 'd F Y \j\a\m H:i')` (Carbon `id` locale) from a Jakarta `YYYY-MM-DD HH:MI`. */
const graduatedAt = (local: string | null): string => {
	if (!local) return ""
	const month = MONTHS_ID[Number(local.slice(5, 7)) - 1] ?? ""
	return `${local.slice(8, 10)} ${month} ${local.slice(0, 4)} jam ${local.slice(11, 16)}`
}

/** `StudentService::dbPhoto` / `getProvinceName` / `getRegencyName` cells. */
const toRow = (row: Row): AdminAlumniRow => ({
	id: Number(row["id"]),
	photoUrl: societyFileUrl(row["attach_photo"] ?? null),
	fullname: row["fullname"] ?? null,
	alumniPhone: row["alumni_phone"] ?? null,
	provinceName: row["province_name"] ? `Provinsi ${row["province_name"]}` : "",
	regencyName: row["regency_name"] ?? "",
	alumniTalent: row["alumni_talent"] ?? null,
})

@Injectable()
export class AlumniAdminService {
	constructor(
		private readonly dataSource: DataSource,
		@InjectRepository(SettingForm) private readonly settingForms: Repository<SettingForm>,
	) {}

	/** `getInputLabel` / `getInputStatus` of setting 1 (the name column). */
	private async nameSetting(): Promise<{ label: string; visible: boolean }> {
		const setting = await this.settingForms.findOne({
			select: { status: true, customName: true, default: true },
			where: { id: 1 },
		})
		return { label: setting?.customName ?? setting?.default ?? "", visible: setting?.status === true }
	}

	private async list(query: string, params: unknown[]): Promise<AdminAlumniList> {
		const [name, rows] = await Promise.all([this.nameSetting(), this.dataSource.query(query, params) as Promise<Row[]>])
		return { nameLabel: name.label, nameVisible: name.visible, rows: rows.map(toRow) }
	}

	/** `list()` — the "Alumni" tab. */
	async years(): Promise<AdminAlumniYearRow[]> {
		const rows = (await this.dataSource.query(sql.ALUMNI_YEARS_SQL)) as Row[]
		return rows.map((row) => ({
			year: Number(row["year"]),
			total: Number(row["total"]),
			male: Number(row["male"]),
			female: Number(row["female"]),
		}))
	}

	/** `listArchive()` — the "Archive" tab. */
	async archive(): Promise<AdminAlumniList> {
		return this.list(sql.ALUMNI_ARCHIVE_SQL, [])
	}

	/** `listByYear()` — `/alumni/graduation-year/$year`. */
	async byYear(year: number): Promise<AdminAlumniList> {
		return this.list(sql.ALUMNI_BY_YEAR_SQL, [year])
	}

	/** `download()` — "Hasil export data alumni.xlsx". */
	async export(year: number): Promise<{ buffer: Buffer; fileName: string }> {
		const [name, rows] = await Promise.all([this.nameSetting(), this.dataSource.query(sql.ALUMNI_EXPORT_SQL, [year]) as Promise<Row[]>])
		const buffer = await buildAlumniWorkbook(
			year,
			rows.map((row) => ({
				fullname: row["fullname"] ?? null,
				alumniPhone: row["alumni_phone"] ?? null,
				provinceName: row["province_name"] ?? null,
				regencyName: row["regency_name"] ?? null,
				alumniTalent: row["alumni_talent"] ?? null,
			})),
			name,
		)
		return { buffer, fileName: ALUMNI_EXPORT_FILE }
	}

	/** `edit()` — the widget, the alumni tab and the five society tabs. */
	async detail(id: number): Promise<AdminAlumniDetail> {
		const rows = (await this.dataSource.query(sql.ALUMNI_DETAIL_SQL, [id])) as Row[]
		const row = rows[0]
		const record = row ? await loadSocietyRecord(this.dataSource.manager, "alumni", id) : null
		if (!row || !record) throw new NotFoundException(NOT_FOUND)

		const local = row["graduated_local"] ?? null
		const year = row["academic_year"] ?? null
		const alumni = Object.fromEntries(ALUMNI_KEYS.map((key) => [key, row[key] ?? ""])) as AdminAlumniValues

		return {
			id,
			graduationYear: local ? local.slice(0, 4) : "",
			widget: {
				photoUrl: societyFileUrl(row["attach_photo"] ?? null),
				fullname: row["fullname"] ?? null,
				academicYear: `Tahun ajaran ${year === "Archive" ? "dihapus" : (year ?? "")}`,
				graduatedAt: graduatedAt(local),
			},
			alumni,
			record,
		}
	}

	/** `print()` — `print/alumni.blade.php`. */
	async print(id: number): Promise<string> {
		const html = await renderSocietyPrintPage(this.dataSource.manager, { society: "alumni", id })
		if (html === null) throw new NotFoundException(NOT_FOUND)
		return html
	}
}
