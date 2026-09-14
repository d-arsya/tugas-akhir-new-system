import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { SettingSchool } from "../../../shared/school/entities/setting-school.entity"
import { SettingAnnc } from "../../psb/entities/setting-annc.entity"
import { SettingForm } from "../../psb/entities/setting-form.entity"
import type { UpdateAnnouncementDto, UpdateSchoolSettingDto } from "../dto/admin-setting.dto"

@Injectable()
export class AdminSettingsService {
	constructor(
		@InjectRepository(SettingSchool)
		private readonly schoolRepository: Repository<SettingSchool>,
		@InjectRepository(SettingAnnc)
		private readonly anncRepository: Repository<SettingAnnc>,
		@InjectRepository(SettingForm)
		private readonly formRepository: Repository<SettingForm>,
	) {}

	async getAllSettings() {
		const school = await this.getSchoolSetting()
		const announcements = await this.anncRepository.find()
		const forms = await this.getFormSettings()
		return { school, announcements, forms }
	}

	// --- School Settings ---
	async getSchoolSetting(): Promise<SettingSchool> {
		const school = await this.schoolRepository.findOne({ where: {} })
		if (!school) {
			const newSchool = this.schoolRepository.create({
				name: "Pondok Roja",
			})
			return this.schoolRepository.save(newSchool)
		}
		return school
	}

	async updateSchoolSetting(dto: UpdateSchoolSettingDto): Promise<SettingSchool> {
		const school = await this.getSchoolSetting()
		Object.assign(school, dto)
		return this.schoolRepository.save(school)
	}

	// --- Announcement Settings ---
	async getAnnouncement(): Promise<SettingAnnc> {
		const annc = await this.anncRepository.findOne({ where: {} })
		if (!annc) {
			const newAnnc = this.anncRepository.create({
				information: "Pengumuman Pondok Roja",
			})
			return this.anncRepository.save(newAnnc)
		}
		return annc
	}

	async updateAnnouncement(dto: UpdateAnnouncementDto): Promise<SettingAnnc> {
		const annc = await this.getAnnouncement()
		Object.assign(annc, dto)
		return this.anncRepository.save(annc)
	}

	// --- Form Settings ---
	async getFormSettings(): Promise<SettingForm[]> {
		return this.formRepository.find()
	}

	async updateFormSetting(id: number, status: boolean): Promise<SettingForm> {
		const form = await this.formRepository.findOneBy({ id })
		if (!form) throw new NotFoundException(`Form setting #${id} tidak ditemukan.`)
		form.status = status
		return this.formRepository.save(form)
	}
}
