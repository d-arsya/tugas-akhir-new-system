import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { AcademicYear } from "../entities/academic-year.entity"
import { Level } from "../entities/level.entity"
import { Registrant } from "../entities/registrant.entity"
import { SettingAnnc } from "../entities/setting-annc.entity"
import { SettingSchool } from "../entities/setting-school.entity"

@Injectable()
export class PsbPrintService {
	constructor(
		@InjectRepository(Registrant)
		private readonly registrantRepository: Repository<Registrant>,
		@InjectRepository(SettingSchool)
		private readonly settingSchoolRepository: Repository<SettingSchool>,
		@InjectRepository(SettingAnnc)
		private readonly settingAnncRepository: Repository<SettingAnnc>,
		@InjectRepository(AcademicYear)
		private readonly academicYearRepository: Repository<AcademicYear>,
		@InjectRepository(Level)
		private readonly levelRepository: Repository<Level>,
	) {}

	async getRegistrationProof(id: number): Promise<{
		registrant: Registrant
		school: SettingSchool | null
		academicYear: AcademicYear | null
		level: Level | null
	}> {
		const registrant = await this.registrantRepository.findOneBy({ id })
		if (!registrant) {
			throw new NotFoundException("Data pendaftar tidak ditemukan.")
		}

		const school = await this.settingSchoolRepository.findOne({ order: { id: "DESC" } })
		const academicYear = registrant.academicYearId
			? await this.academicYearRepository.findOneBy({ id: registrant.academicYearId })
			: null
		const level = registrant.levelId ? await this.levelRepository.findOneBy({ id: registrant.levelId }) : null

		return { registrant, school, academicYear, level }
	}

	async getApprovalProof(userId: number): Promise<{
		registrant: Registrant
		school: SettingSchool | null
		announcement: SettingAnnc | null
		academicYear: AcademicYear | null
	}> {
		const registrant = await this.registrantRepository.findOneBy({ id: userId })
		if (!registrant) {
			throw new NotFoundException("Data pendaftar tidak ditemukan.")
		}
		if (registrant.approvalStatus !== "approve") {
			throw new ForbiddenException("Bukti penerimaan hanya dapat dicetak jika status pendaftaran Anda 'Diterima'.")
		}

		const school = await this.settingSchoolRepository.findOne({ order: { id: "DESC" } })
		const announcement = await this.settingAnncRepository.findOne({ order: { id: "DESC" } })
		const academicYear = registrant.academicYearId
			? await this.academicYearRepository.findOneBy({ id: registrant.academicYearId })
			: null

		return { registrant, school, announcement, academicYear }
	}

	async getRejectedProof(userId: number): Promise<{
		registrant: Registrant
		school: SettingSchool | null
		announcement: SettingAnnc | null
	}> {
		const registrant = await this.registrantRepository.findOneBy({ id: userId })
		if (!registrant) {
			throw new NotFoundException("Data pendaftar tidak ditemukan.")
		}
		if (registrant.approvalStatus !== "reject") {
			throw new ForbiddenException("Surat keputusan penolakan hanya tersedia untuk status 'Ditolak'.")
		}

		const school = await this.settingSchoolRepository.findOne({ order: { id: "DESC" } })
		const announcement = await this.settingAnncRepository.findOne({ order: { id: "DESC" } })

		return { registrant, school, announcement }
	}

	async getIndentRejectedProof(userId: number): Promise<{
		registrant: Registrant
		school: SettingSchool | null
		announcement: SettingAnnc | null
	}> {
		const registrant = await this.registrantRepository.findOneBy({ id: userId })
		if (!registrant) {
			throw new NotFoundException("Data pendaftar tidak ditemukan.")
		}
		if (registrant.indentTest !== "failed") {
			throw new ForbiddenException("Surat ini hanya dapat dicetak jika Anda tidak lulus seleksi jalur indent.")
		}

		const school = await this.settingSchoolRepository.findOne({ order: { id: "DESC" } })
		const announcement = await this.settingAnncRepository.findOne({ order: { id: "DESC" } })

		return { registrant, school, announcement }
	}
}
