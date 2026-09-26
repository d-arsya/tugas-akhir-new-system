import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Registrant } from "@psb/entities/registrant.entity"
import { SettingAnnc } from "@shared/school/entities/setting-annc.entity"
import { SettingSchool } from "@shared/school/entities/setting-school.entity"

@Injectable()
export class PsbDashboardService {
	constructor(
		@InjectRepository(Registrant)
		private readonly registrantRepository: Repository<Registrant>,
		@InjectRepository(SettingAnnc)
		private readonly settingAnncRepository: Repository<SettingAnnc>,
		@InjectRepository(SettingSchool)
		private readonly settingSchoolRepository: Repository<SettingSchool>,
	) { }

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

		const school = await this.settingSchoolRepository.findOne({ where: {}, order: { id: "DESC" } })
		const announcement = await this.settingAnncRepository.findOne({ where: {}, order: { id: "DESC" } })

		let status: string = "wait"
		let label: string = "Menunggu Verifikasi"
		let description: string | null =
			announcement?.information ?? "Data pendaftaran Anda sedang dalam antrean verifikasi oleh panitia PSB."

		if (registrant.approvalStatus === "approve") {
			status = "approve"
			label = "Diterima"
			description = announcement?.successDesc ?? "Selamat! Anda dinyatakan DITERIMA sebagai santri baru Pondok Roja."
		} else if (registrant.approvalStatus === "reject") {
			status = "reject"
			label = "Tidak Diterima"
			description = announcement?.failedDesc ?? "Mohon maaf, Anda belum berhasil pada periode seleksi ini."
		} else if (registrant.approvalStatus === "reserve") {
			status = "reserve"
			label = "Cadangan"
			description = "Anda masuk dalam daftar cadangan santri baru. Panitia akan menginformasikan jika terdapat kuota yang tersedia."
		} else if (registrant.dataValidation === "invalid") {
			status = "invalid"
			label = "Data Tidak Valid"
			description =
				registrant.dataValidationNote ??
				"Terdapat data yang perlu diperbaiki. Silakan klik tombol perbaiki data di bawah."
		} else if (registrant.dataValidation === "fixed") {
			status = "fixed"
			label = "Sudah Diperbaiki"
			description = "Perbaikan data Anda telah kami terima dan sedang menunggu verifikasi ulang."
		} else if (registrant.registrationPath === "indent") {
			if (registrant.indentTest === "failed" && !registrant.regularTest) {
				status = "indent_failed"
				label = "Pengalihan ke Tes Reguler"
				description =
					announcement?.failedIndentTestDesc ??
					"Hasil tes jalur indent belum memenuhi kriteria kelulusan langsung. Anda berhak melanjutkan proses seleksi melalui Ujian Seleksi Jalur Reguler."
			} else if (registrant.indentTest === "success") {
				status = "indent_test_passed"
				label = "Lolos Tes Indent"
				description = "Selamat! Anda telah lulus tes seleksi jalur indent. Menunggu penetapan pengumuman kelulusan akhir."
			} else if (registrant.dataValidation === "valid") {
				status = "data_valid"
				label = "Berkas Terverifikasi"
				description = "Data dan berkas Anda telah dinyatakan valid. Silakan menunggu jadwal pelaksanaan tes seleksi jalur indent."
			}
		} else {
			// Jalur Reguler atau Default
			if (registrant.regularTest === "success") {
				status = "regular_test_passed"
				label = "Lolos Tes Seleksi"
				description = "Selamat! Anda dinyatakan lolos tes seleksi reguler. Menunggu penetapan pengumuman kelulusan akhir."
			} else if (registrant.regularTest === "failed") {
				status = "regular_test_failed"
				label = "Hasil Tes Perlu Evaluasi"
				description =
					"Hasil tes seleksi reguler belum mencapai nilai ambang kelulusan langsung dan sedang dalam peninjauan sidang pleno panitia untuk penetapan keputusan akhir."
			} else if (registrant.dataValidation === "valid") {
				status = "data_valid"
				label = "Berkas Terverifikasi"
				description = "Data dan berkas Anda telah terverifikasi (Valid). Silakan persiapkan diri untuk tahapan tes seleksi."
			}
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
