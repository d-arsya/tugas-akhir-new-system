import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Registrant } from "../entities/registrant.entity"
import { SettingAnnc } from "../entities/setting-annc.entity"
import { SettingSchool } from "../entities/setting-school.entity"

@Injectable()
export class PsbDashboardService {
	constructor(
		@InjectRepository(Registrant)
		private readonly registrantRepository: Repository<Registrant>,
		@InjectRepository(SettingAnnc)
		private readonly settingAnncRepository: Repository<SettingAnnc>,
		@InjectRepository(SettingSchool)
		private readonly settingSchoolRepository: Repository<SettingSchool>,
	) {}

	async getDashboard(userId: number): Promise<{
		registrant: Registrant
		school: SettingSchool | null
		announcement: SettingAnnc | null
		statusInfo: {
			status: string
			label: string
			description: string | null
		}
	}> {
		const registrant = await this.registrantRepository.findOneBy({ id: userId })
		if (!registrant) {
			throw new NotFoundException("Data pendaftar tidak ditemukan.")
		}

		const school = await this.settingSchoolRepository.findOne({ order: { id: "DESC" } })
		const announcement = await this.settingAnncRepository.findOne({ order: { id: "DESC" } })

		let status: string = registrant.approvalStatus ?? "wait"
		let label: string = "Menunggu Verifikasi"
		let description: string | null =
			announcement?.information ?? "Data pendaftaran Anda sedang dalam antrean verifikasi oleh panitia PSB."

		if (registrant.dataValidation === "invalid") {
			status = "invalid"
			label = "Data Tidak Valid"
			description =
				registrant.dataValidationNote ??
				"Terdapat data yang perlu diperbaiki. Silakan klik tombol perbaiki data di bawah."
		} else if (registrant.dataValidation === "fixed") {
			status = "fixed"
			label = "Sudah Diperbaiki"
			description = "Perbaikan data Anda telah kami terima dan sedang menunggu verifikasi ulang."
		} else if (registrant.approvalStatus === "approve") {
			status = "approve"
			label = "Diterima"
			description = announcement?.successDesc ?? "Selamat! Anda dinyatakan DITERIMA sebagai santri baru Pondok Roja."
		} else if (registrant.approvalStatus === "reject") {
			status = "reject"
			label = "Tidak Diterima"
			description = announcement?.failedDesc ?? "Mohon maaf, Anda belum berhasil pada periode seleksi ini."
		} else if (registrant.indentTest === "failed" && !registrant.regularTest) {
			status = "indent_failed"
			label = "Gagal Tes Indent"
			description = announcement?.failedIndentTestDesc ?? "Anda dinyatakan belum lulus tes jalur indent."
		}

		return {
			registrant,
			school,
			announcement,
			statusInfo: {
				status,
				label,
				description,
			},
		}
	}
}
