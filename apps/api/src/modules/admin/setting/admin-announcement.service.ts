import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"

import { SettingAnnc } from "@shared/school/entities/setting-annc.entity"
import { isEmptyRichText, type SettingAnnouncementUpdateDto } from "@admin/setting/dto/admin-announcement.dto"

export type SettingAnnouncement = {
	id: number
	successDesc: string | null
	failedDesc: string | null
	failedIndentTestDesc: string | null
	/** dd/mm/yyyy, like the legacy accessor. */
	dateStart: string | null
	dateEnd: string | null
	information: string | null
	additionalInformation: string | null
}

// `resources/lang/id/admin.php`
const UPDATE_SUCCESS = "Data berhasil diupdate."
const UPDATE_FAILED = "Data gagal diupdate."

/** `getDateStartAttribute`: `Carbon::parse($value)->format("d/m/Y")`. */
const toDmy = (value: string | null): string | null => {
	if (!value) return null
	const [year, month, day] = value.slice(0, 10).split("-")
	return year && month && day ? `${day}/${month}/${year}` : null
}

/**
 * `setDateStartAttribute`: `/` becomes `-` and Carbon reads `dd-mm-yyyy`, so out-of-range parts
 * roll over the same way (31/02/2026 → 2026-03-03).
 */
const fromDmy = (value: string): string => {
	const [day, month, year] = value.split("/")
	const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
	return date.toISOString().slice(0, 10)
}

// WS-B: legacy SettingAnncsController::update
@Injectable()
export class AdminAnnouncementService {
	constructor(
		@InjectRepository(SettingAnnc)
		private readonly announcementRepository: Repository<SettingAnnc>,
	) {}

	/** `index()` — `SettingAnncs::first()`, the one row the PSB portal reads. */
	async getAnnouncement(): Promise<SettingAnnouncement> {
		const annc = await this.findAnnouncement()

		return {
			id: Number(annc.id),
			successDesc: annc.successDesc,
			failedDesc: annc.failedDesc,
			failedIndentTestDesc: annc.failedIndentTestDesc,
			dateStart: toDmy(annc.dateStart),
			dateEnd: toDmy(annc.dateEnd),
			information: annc.information,
			additionalInformation: annc.additionalInformation,
		}
	}

	/** `update()` — the HTML is stored exactly as the editor produced it. */
	async updateAnnouncement(dto: SettingAnnouncementUpdateDto): Promise<{ message: string }> {
		const annc = await this.findAnnouncement()

		annc.successDesc = dto.successDesc
		annc.failedDesc = dto.failedDesc
		annc.failedIndentTestDesc = dto.failedIndentTestDesc
		annc.dateStart = fromDmy(dto.dateStart)
		annc.dateEnd = fromDmy(dto.dateEnd)
		annc.information = dto.information
		// `annc-ajax.js` empties an editor that only holds `<p><br></p>`, and
		// `ConvertEmptyStringsToNull` turns that into a null column
		annc.additionalInformation = isEmptyRichText(dto.additionalInformation)
			? null
			: dto.additionalInformation

		try {
			await this.announcementRepository.save(annc)
		} catch {
			// Legacy returned `$th->getMessage()` here, which leaked the SQL statement
			throw new InternalServerErrorException(UPDATE_FAILED)
		}

		return { message: UPDATE_SUCCESS }
	}

	private async findAnnouncement(): Promise<SettingAnnc> {
		const annc = await this.announcementRepository.findOne({ where: {}, order: { id: "ASC" } })
		if (!annc) throw new NotFoundException("Pengumuman PSB belum diatur.")
		return annc
	}
}
