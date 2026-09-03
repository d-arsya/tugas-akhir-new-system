import * as crypto from "crypto"
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { StorageService } from "../../core/storage/storage.service"
import { DiseaseHistory } from "../entities/disease-history.entity"
import { Registrant } from "../entities/registrant.entity"
import type { FamilyDto } from "../dto/register/family.dto"
import type { GuardianDto } from "../dto/register/guardian.dto"
import type { IdentityDto } from "../dto/register/identity.dto"
import type { PersonalDto } from "../dto/register/personal.dto"

@Injectable()
export class PsbInvalidService {
	constructor(
		@InjectRepository(Registrant)
		private readonly registrantRepository: Repository<Registrant>,
		@InjectRepository(DiseaseHistory)
		private readonly diseaseHistoryRepository: Repository<DiseaseHistory>,
		private readonly storageService: StorageService,
	) {}

	private async getInvalidRegistrant(userId: number): Promise<Registrant> {
		const registrant = await this.registrantRepository.findOneBy({ id: userId })
		if (!registrant) {
			throw new NotFoundException("Data pendaftar tidak ditemukan.")
		}
		if (registrant.dataValidation !== "invalid") {
			throw new ForbiddenException("Perbaikan data hanya dapat dilakukan jika status data Anda berstatus 'invalid'.")
		}
		return registrant
	}

	async getFormData(userId: number): Promise<{ registrant: Registrant; diseases: DiseaseHistory[] }> {
		const registrant = await this.getInvalidRegistrant(userId)
		const diseases = await this.diseaseHistoryRepository.findBy({
			societyId: registrant.id,
			society: "registrant",
		})
		return { registrant, diseases }
	}

	async updatePersonal(userId: number, dto: PersonalDto): Promise<{ message: string }> {
		const registrant = await this.getInvalidRegistrant(userId)
		Object.assign(registrant, {
			fullname: dto.fullname,
			shortname: dto.shortname ?? registrant.shortname,
			religion: dto.religion ?? registrant.religion,
			gender: dto.gender,
			placeOfBirth: dto.placeOfBirth,
			dateOfBirth: dto.dateOfBirth,
			nationality: dto.nationality ?? registrant.nationality,
			liveWith: dto.liveWith ?? registrant.liveWith,
			siblingOrder: dto.siblingOrder ?? registrant.siblingOrder,
			numberOfSibling: dto.numberOfSibling ?? registrant.numberOfSibling,
			parentStatus: dto.parentStatus ?? registrant.parentStatus,
			childStatus: dto.childStatus ?? registrant.childStatus,
			phone: dto.phone,
			provinceId: dto.provinceId,
			regencyId: dto.regencyId,
			districtId: dto.districtId,
			village: dto.village ?? registrant.village,
			subVillage: dto.subVillage ?? registrant.subVillage,
			rt: dto.rt ?? registrant.rt,
			rw: dto.rw ?? registrant.rw,
			street: dto.street ?? registrant.street,
			schoolName: dto.schoolName,
			schoolPhone: dto.schoolPhone ?? registrant.schoolPhone,
			schoolProvinceId: dto.schoolProvinceId ?? registrant.schoolProvinceId,
			schoolRegencyId: dto.schoolRegencyId ?? registrant.schoolRegencyId,
			schoolDistrictId: dto.schoolDistrictId ?? registrant.schoolDistrictId,
			schoolAddressDetail: dto.schoolAddressDetail ?? registrant.schoolAddressDetail,
			schoolPostalCode: dto.schoolPostalCode ?? registrant.schoolPostalCode,
		})
		await this.registrantRepository.save(registrant)
		return { message: "Data pribadi berhasil diperbarui." }
	}

	async updateIdentity(userId: number, dto: IdentityDto): Promise<{ message: string }> {
		const registrant = await this.getInvalidRegistrant(userId)
		Object.assign(registrant, {
			nik: dto.nik,
			nisn: dto.nisn ?? registrant.nisn,
			kip: dto.kip ?? registrant.kip,
			ksp: dto.ksp ?? registrant.ksp,
			certificateNumber: dto.certificateNumber ?? registrant.certificateNumber,
			weight: dto.weight ?? registrant.weight,
			height: dto.height ?? registrant.height,
			bloodType: dto.bloodType ?? registrant.bloodType,
			visualCondition: dto.visualCondition ?? registrant.visualCondition,
			hearingCondition: dto.hearingCondition ?? registrant.hearingCondition,
			immunizationGiven: dto.immunizationGiven ?? registrant.immunizationGiven,
			reading: dto.reading ?? registrant.reading,
			jilidChapter: dto.jilidChapter ?? registrant.jilidChapter,
			quranMemorizing: dto.quranMemorizing ?? registrant.quranMemorizing,
			learningAchievement: dto.learningAchievement ?? registrant.learningAchievement,
			gift: dto.gift ?? registrant.gift,
		})
		await this.registrantRepository.save(registrant)

		// Replace diseases if provided
		if (dto.diseases) {
			await this.diseaseHistoryRepository.delete({ societyId: registrant.id, society: "registrant" })
			if (dto.diseases.length > 0) {
				const diseaseEntities = dto.diseases.map((d) =>
					this.diseaseHistoryRepository.create({
						societyId: registrant.id,
						society: "registrant",
						diseaseName: d.diseaseName,
						diseaseStatus: d.diseaseStatus,
					}),
				)
				await this.diseaseHistoryRepository.save(diseaseEntities)
			}
		}

		return { message: "Data identitas & kesehatan berhasil diperbarui." }
	}

	async updateFamily(userId: number, dto: FamilyDto): Promise<{ message: string }> {
		const registrant = await this.getInvalidRegistrant(userId)
		Object.assign(registrant, {
			fatherFullname: dto.fatherFullname,
			fatherReligion: dto.fatherReligion ?? registrant.fatherReligion,
			fatherNationality: dto.fatherNationality ?? registrant.fatherNationality,
			fatherLastEducation: dto.fatherLastEducation ?? registrant.fatherLastEducation,
			fatherPhone: dto.fatherPhone ?? registrant.fatherPhone,
			fatherWhatsapp: dto.fatherWhatsapp ?? registrant.fatherWhatsapp,
			fatherJob: dto.fatherJob ?? registrant.fatherJob,
			motherFullname: dto.motherFullname,
			motherReligion: dto.motherReligion ?? registrant.motherReligion,
			motherNationality: dto.motherNationality ?? registrant.motherNationality,
			motherLastEducation: dto.motherLastEducation ?? registrant.motherLastEducation,
			motherPhone: dto.motherPhone ?? registrant.motherPhone,
			motherWhatsapp: dto.motherWhatsapp ?? registrant.motherWhatsapp,
			motherJob: dto.motherJob ?? registrant.motherJob,
			familyProvinceId: dto.familyProvinceId ?? registrant.familyProvinceId,
			familyRegencyId: dto.familyRegencyId ?? registrant.familyRegencyId,
			familyDistrictId: dto.familyDistrictId ?? registrant.familyDistrictId,
			familyVillage: dto.familyVillage ?? registrant.familyVillage,
			familySubVillage: dto.familySubVillage ?? registrant.familySubVillage,
			familyRt: dto.familyRt ?? registrant.familyRt,
			familyRw: dto.familyRw ?? registrant.familyRw,
			familyStreet: dto.familyStreet ?? registrant.familyStreet,
		})
		await this.registrantRepository.save(registrant)
		return { message: "Data keluarga berhasil diperbarui." }
	}

	async updateGuardian(userId: number, dto: GuardianDto): Promise<{ message: string }> {
		const registrant = await this.getInvalidRegistrant(userId)
		Object.assign(registrant, {
			guardianFullname: dto.guardianFullname ?? registrant.guardianFullname,
			guardianReligion: dto.guardianReligion ?? registrant.guardianReligion,
			guardianNationality: dto.guardianNationality ?? registrant.guardianNationality,
			guardianLastEducation: dto.guardianLastEducation ?? registrant.guardianLastEducation,
			guardianPhone: dto.guardianPhone ?? registrant.guardianPhone,
			guardianWhatsapp: dto.guardianWhatsapp ?? registrant.guardianWhatsapp,
			guardianJob: dto.guardianJob ?? registrant.guardianJob,
			guardianProvinceId: dto.guardianProvinceId ?? registrant.guardianProvinceId,
			guardianRegencyId: dto.guardianRegencyId ?? registrant.guardianRegencyId,
			guardianDistrictId: dto.guardianDistrictId ?? registrant.guardianDistrictId,
			guardianVillage: dto.guardianVillage ?? registrant.guardianVillage,
			guardianSubVillage: dto.guardianSubVillage ?? registrant.guardianSubVillage,
			guardianRt: dto.guardianRt ?? registrant.guardianRt,
			guardianRw: dto.guardianRw ?? registrant.guardianRw,
			guardianStreet: dto.guardianStreet ?? registrant.guardianStreet,
		})
		await this.registrantRepository.save(registrant)
		return { message: "Data wali berhasil diperbarui." }
	}

	async updateAttachment(
		userId: number,
		files: {
			attachCertificate?: Express.Multer.File[]
			attachPhoto?: Express.Multer.File[]
			attachFamilyCard?: Express.Multer.File[]
			attachKsp?: Express.Multer.File[]
			attachKip?: Express.Multer.File[]
			attachReportCard?: Express.Multer.File[]
			attachBirthCertificate?: Express.Multer.File[]
		},
	): Promise<{ message: string; registrant: Registrant }> {
		const registrant = await this.getInvalidRegistrant(userId)

		if (files.attachCertificate?.[0]) {
			registrant.attachCertificate = await this.storageService.upload(
				files.attachCertificate[0],
				`psb/attachments/${registrant.registrantId}/${crypto.randomUUID()}-${files.attachCertificate[0].originalname}`
			)
		}
		if (files.attachPhoto?.[0]) {
			registrant.attachPhoto = await this.storageService.upload(
				files.attachPhoto[0], 
				`psb/attachments/${registrant.registrantId}/${crypto.randomUUID()}-${files.attachPhoto[0].originalname}`
			)
		}
		if (files.attachFamilyCard?.[0]) {
			registrant.attachFamilyCard = await this.storageService.upload(
				files.attachFamilyCard[0],
				`psb/attachments/${registrant.registrantId}/${crypto.randomUUID()}-${files.attachFamilyCard[0].originalname}`
			)
		}
		if (files.attachKsp?.[0]) {
			registrant.attachKsp = await this.storageService.upload(
				files.attachKsp[0], 
				`psb/attachments/${registrant.registrantId}/${crypto.randomUUID()}-${files.attachKsp[0].originalname}`
			)
		}
		if (files.attachKip?.[0]) {
			registrant.attachKip = await this.storageService.upload(
				files.attachKip[0], 
				`psb/attachments/${registrant.registrantId}/${crypto.randomUUID()}-${files.attachKip[0].originalname}`
			)
		}
		if (files.attachReportCard?.[0]) {
			registrant.attachReportCard = await this.storageService.upload(
				files.attachReportCard[0],
				`psb/attachments/${registrant.registrantId}/${crypto.randomUUID()}-${files.attachReportCard[0].originalname}`
			)
		}
		if (files.attachBirthCertificate?.[0]) {
			registrant.attachBirthCertificate = await this.storageService.upload(
				files.attachBirthCertificate[0],
				`psb/attachments/${registrant.registrantId}/${crypto.randomUUID()}-${files.attachBirthCertificate[0].originalname}`
			)
		}

		// Mark data validation as fixed
		registrant.dataValidation = "fixed"
		await this.registrantRepository.save(registrant)

		return {
			message: "Semua perbaikan data telah berhasil dikirimkan.",
			registrant,
		}
	}
}
