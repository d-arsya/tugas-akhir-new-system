import { BadRequestException, Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { InjectRepository } from "@nestjs/typeorm"
import * as bcrypt from "bcrypt"
import * as crypto from "crypto"
import { DataSource, Repository } from "typeorm"
import { MailerService } from "../../core/mailer/mailer.service"
import { RedisService } from "../../core/redis/redis.service"
import { StorageService } from "../../core/storage/storage.service"
import { PsbAuthService } from "../auth/psb-auth.service"
import { AcademicYear } from "../entities/academic-year.entity"
import { DiseaseHistory } from "../entities/disease-history.entity"
import { Level } from "../entities/level.entity"
import { Registrant } from "../entities/registrant.entity"
import { SettingAnnc } from "../entities/setting-annc.entity"
import { SettingForm } from "../entities/setting-form.entity"
import { SettingSchool } from "../entities/setting-school.entity"
import type { Env } from "../../core/config/env.validation"
import type { CheckEmailDto } from "../dto/register/check-email.dto"
import type { FamilyDto } from "../dto/register/family.dto"
import type { GuardianDto } from "../dto/register/guardian.dto"
import type { IdentityDto } from "../dto/register/identity.dto"
import type { PersonalDto } from "../dto/register/personal.dto"

@Injectable()
export class PsbRegisterService {
	private readonly WIZARD_TTL = 24 * 60 * 60 // 24 hours

	constructor(
		@InjectRepository(Registrant)
		private readonly registrantRepository: Repository<Registrant>,
		@InjectRepository(AcademicYear)
		private readonly academicYearRepository: Repository<AcademicYear>,
		@InjectRepository(Level)
		private readonly levelRepository: Repository<Level>,
		@InjectRepository(SettingSchool)
		private readonly settingSchoolRepository: Repository<SettingSchool>,
		@InjectRepository(SettingAnnc)
		private readonly settingAnncRepository: Repository<SettingAnnc>,
		@InjectRepository(SettingForm)
		private readonly settingFormRepository: Repository<SettingForm>,
		@InjectRepository(DiseaseHistory)
		private readonly diseaseHistoryRepository: Repository<DiseaseHistory>,
		private readonly redisService: RedisService,
		private readonly storageService: StorageService,
		private readonly mailerService: MailerService,
		private readonly configService: ConfigService<Env, true>,
		private readonly psbAuthService: PsbAuthService,
		private readonly dataSource: DataSource,
	) {}

	async getLandingInfo(): Promise<{
		academicYear: AcademicYear | null
		school: SettingSchool | null
		announcement: SettingAnnc | null
		levels: Level[]
		formSettings: SettingForm[]
		isOpen: boolean
	}> {
		const academicYear = await this.academicYearRepository.findOne({
			where: [{ isCurrent: true, status: true }, { status: true }],
			order: { id: "DESC" },
		})
		const school = await this.settingSchoolRepository.findOne({ order: { id: "DESC" } })
		const announcement = await this.settingAnncRepository.findOne({ order: { id: "DESC" } })
		const levels = await this.levelRepository.find({ where: { status: "show" } })
		const formSettings = await this.settingFormRepository.find({
			where: { visibility: true },
			order: { id: "ASC" },
		})

		return {
			academicYear,
			school,
			announcement,
			levels,
			formSettings,
			isOpen: academicYear !== null,
		}
	}

	async getFormSettings(): Promise<SettingForm[]> {
		return this.settingFormRepository.find({
			where: { visibility: true },
			order: { id: "ASC" },
		})
	}

	async checkEmail(dto: CheckEmailDto): Promise<{ sessionId: string; email: string; levelId: number }> {
		const existing = await this.registrantRepository.findOneBy({ email: dto.email })
		if (existing) {
			throw new BadRequestException("Email ini sudah pernah digunakan untuk pendaftaran.")
		}

		const level = await this.levelRepository.findOneBy({ id: dto.levelId, status: "show" })
		if (!level) {
			throw new BadRequestException("Jenjang pendidikan tidak ditemukan atau sedang tidak dibuka.")
		}

		const sessionId = crypto.randomUUID()
		await this.redisService.set(
			`psb-wizard:${sessionId}:email`,
			JSON.stringify({ email: dto.email, levelId: dto.levelId }),
			this.WIZARD_TTL,
		)

		return { sessionId, email: dto.email, levelId: dto.levelId }
	}

	async savePersonal(sessionId: string, dto: PersonalDto): Promise<{ message: string }> {
		await this.redisService.set(`psb-wizard:${sessionId}:personal`, JSON.stringify(dto), this.WIZARD_TTL)
		return { message: "Data pribadi berhasil disimpan." }
	}

	async saveIdentity(sessionId: string, dto: IdentityDto): Promise<{ message: string }> {
		await this.redisService.set(`psb-wizard:${sessionId}:identity`, JSON.stringify(dto), this.WIZARD_TTL)
		return { message: "Data identitas dan kesehatan berhasil disimpan." }
	}

	async saveFamily(sessionId: string, dto: FamilyDto): Promise<{ message: string }> {
		await this.redisService.set(`psb-wizard:${sessionId}:family`, JSON.stringify(dto), this.WIZARD_TTL)
		return { message: "Data keluarga berhasil disimpan." }
	}

	async saveGuardian(sessionId: string, dto: GuardianDto): Promise<{ message: string }> {
		await this.redisService.set(`psb-wizard:${sessionId}:guardian`, JSON.stringify(dto), this.WIZARD_TTL)
		return { message: "Data wali berhasil disimpan." }
	}

	async getWizardState(sessionId: string): Promise<Record<string, unknown>> {
		const emailStr = await this.redisService.get(`psb-wizard:${sessionId}:email`)
		const personalStr = await this.redisService.get(`psb-wizard:${sessionId}:personal`)
		const identityStr = await this.redisService.get(`psb-wizard:${sessionId}:identity`)
		const familyStr = await this.redisService.get(`psb-wizard:${sessionId}:family`)
		const guardianStr = await this.redisService.get(`psb-wizard:${sessionId}:guardian`)

		return {
			email: emailStr ? JSON.parse(emailStr) : null,
			personal: personalStr ? JSON.parse(personalStr) : null,
			identity: identityStr ? JSON.parse(identityStr) : null,
			family: familyStr ? JSON.parse(familyStr) : null,
			guardian: guardianStr ? JSON.parse(guardianStr) : null,
		}
	}

	async submitAttachment(
		sessionId: string,
		files: {
			attachCertificate?: Express.Multer.File[]
			attachPhoto?: Express.Multer.File[]
			attachFamilyCard?: Express.Multer.File[]
			attachKsp?: Express.Multer.File[]
			attachKip?: Express.Multer.File[]
			attachReportCard?: Express.Multer.File[]
			attachBirthCertificate?: Express.Multer.File[]
		},
	): Promise<Record<string, unknown>> {
		const emailRaw = await this.redisService.get(`psb-wizard:${sessionId}:email`)
		const personalRaw = await this.redisService.get(`psb-wizard:${sessionId}:personal`)
		const identityRaw = await this.redisService.get(`psb-wizard:${sessionId}:identity`)
		const familyRaw = await this.redisService.get(`psb-wizard:${sessionId}:family`)
		const guardianRaw = await this.redisService.get(`psb-wizard:${sessionId}:guardian`)

		if (!emailRaw || !personalRaw || !identityRaw || !familyRaw) {
			throw new BadRequestException("Data pendaftaran tidak lengkap. Silakan lengkapi langkah sebelumnya.")
		}

		const emailData = JSON.parse(emailRaw) as { email: string; levelId: number }
		const personalData = JSON.parse(personalRaw) as PersonalDto
		const identityData = JSON.parse(identityRaw) as IdentityDto
		const familyData = JSON.parse(familyRaw) as FamilyDto
		const guardianData = guardianRaw ? (JSON.parse(guardianRaw) as GuardianDto) : {}

		// Upload files
		let attachCertificate: string | null = null
		let attachPhoto: string | null = null
		let attachFamilyCard: string | null = null
		let attachKsp: string | null = null
		let attachKip: string | null = null
		let attachReportCard: string | null = null
		let attachBirthCertificate: string | null = null

		if (files.attachCertificate?.[0]) {
			attachCertificate = await this.storageService.upload(files.attachCertificate[0], "psb/attachments")
		}
		if (files.attachPhoto?.[0]) {
			attachPhoto = await this.storageService.upload(files.attachPhoto[0], "psb/attachments")
		}
		if (files.attachFamilyCard?.[0]) {
			attachFamilyCard = await this.storageService.upload(files.attachFamilyCard[0], "psb/attachments")
		}
		if (files.attachKsp?.[0]) {
			attachKsp = await this.storageService.upload(files.attachKsp[0], "psb/attachments")
		}
		if (files.attachKip?.[0]) {
			attachKip = await this.storageService.upload(files.attachKip[0], "psb/attachments")
		}
		if (files.attachReportCard?.[0]) {
			attachReportCard = await this.storageService.upload(files.attachReportCard[0], "psb/attachments")
		}
		if (files.attachBirthCertificate?.[0]) {
			attachBirthCertificate = await this.storageService.upload(
				files.attachBirthCertificate[0],
				"psb/attachments",
			)
		}

		// Academic year & Registrant ID generation
		const academicYear = await this.academicYearRepository.findOne({
			where: [{ isCurrent: true, status: true }, { status: true }],
			order: { id: "DESC" },
		})

		const currentYear = academicYear?.year ? academicYear.year.substring(0, 4) : new Date().getFullYear().toString()
		const latestRegistrant = await this.registrantRepository.findOne({
			where: {},
			order: { id: "DESC" },
		})
		const nextSeq = ((latestRegistrant?.id ?? 0) + 1).toString().padStart(4, "0")
		const registrantId = `PR${currentYear}${nextSeq}`

		// Generate random 8-character password
		const generatedPassword = crypto.randomBytes(4).toString("hex").toUpperCase()
		const hashedPassword = await bcrypt.hash(generatedPassword, 10)

		const queryRunner = this.dataSource.createQueryRunner()
		await queryRunner.connect()
		await queryRunner.startTransaction()

		try {
			const registrant = queryRunner.manager.create(Registrant, {
				academicYearId: academicYear?.id ?? null,
				levelId: emailData.levelId,
				registrantId,
				email: emailData.email,
				password: hashedPassword,
				approvalStatus: "wait",
				dataValidation: "valid",
				registrationPath: academicYear?.type === "indent" ? "indent" : "reguler",

				// Personal
				fullname: personalData.fullname,
				shortname: personalData.shortname ?? null,
				religion: personalData.religion ?? "islam",
				gender: personalData.gender ?? null,
				placeOfBirth: personalData.placeOfBirth ?? null,
				dateOfBirth: personalData.dateOfBirth ?? null,
				nationality: personalData.nationality ?? "wni",
				liveWith: personalData.liveWith ?? "parent",
				siblingOrder: personalData.siblingOrder ?? null,
				numberOfSibling: personalData.numberOfSibling ?? null,
				parentStatus: personalData.parentStatus ?? null,
				childStatus: personalData.childStatus ?? null,
				phone: personalData.phone ?? null,
				provinceId: personalData.provinceId ?? null,
				regencyId: personalData.regencyId ?? null,
				districtId: personalData.districtId ?? null,
				village: personalData.village ?? null,
				subVillage: personalData.subVillage ?? null,
				rt: personalData.rt ?? null,
				rw: personalData.rw ?? null,
				street: personalData.street ?? null,
				schoolName: personalData.schoolName ?? null,
				schoolPhone: personalData.schoolPhone ?? null,
				schoolProvinceId: personalData.schoolProvinceId ?? null,
				schoolRegencyId: personalData.schoolRegencyId ?? null,
				schoolDistrictId: personalData.schoolDistrictId ?? null,
				schoolAddressDetail: personalData.schoolAddressDetail ?? null,
				schoolPostalCode: personalData.schoolPostalCode ?? null,

				// Identity & Health
				nik: identityData.nik ?? null,
				nisn: identityData.nisn ?? null,
				kip: identityData.kip ?? null,
				ksp: identityData.ksp ?? null,
				certificateNumber: identityData.certificateNumber ?? null,
				weight: identityData.weight ?? null,
				height: identityData.height ?? null,
				bloodType: identityData.bloodType ?? null,
				visualCondition: identityData.visualCondition ?? "normal",
				hearingCondition: identityData.hearingCondition ?? "normal",
				immunizationGiven: identityData.immunizationGiven ?? "complete",
				reading: identityData.reading ?? null,
				jilidChapter: identityData.jilidChapter ?? null,
				quranMemorizing: identityData.quranMemorizing ?? null,
				learningAchievement: identityData.learningAchievement ?? null,
				gift: identityData.gift ?? null,

				// Family
				fatherFullname: familyData.fatherFullname ?? null,
				fatherReligion: familyData.fatherReligion ?? "islam",
				fatherNationality: familyData.fatherNationality ?? "wni",
				fatherLastEducation: familyData.fatherLastEducation ?? null,
				fatherPhone: familyData.fatherPhone ?? null,
				fatherWhatsapp: familyData.fatherWhatsapp ?? null,
				fatherJob: familyData.fatherJob ?? null,
				motherFullname: familyData.motherFullname ?? null,
				motherReligion: familyData.motherReligion ?? "islam",
				motherNationality: familyData.motherNationality ?? "wni",
				motherLastEducation: familyData.motherLastEducation ?? null,
				motherPhone: familyData.motherPhone ?? null,
				motherWhatsapp: familyData.motherWhatsapp ?? null,
				motherJob: familyData.motherJob ?? null,
				familyProvinceId: familyData.familyProvinceId ?? null,
				familyRegencyId: familyData.familyRegencyId ?? null,
				familyDistrictId: familyData.familyDistrictId ?? null,
				familyVillage: familyData.familyVillage ?? null,
				familySubVillage: familyData.familySubVillage ?? null,
				familyRt: familyData.familyRt ?? null,
				familyRw: familyData.familyRw ?? null,
				familyStreet: familyData.familyStreet ?? null,

				// Guardian
				guardianFullname: guardianData.guardianFullname ?? null,
				guardianReligion: guardianData.guardianReligion ?? null,
				guardianNationality: guardianData.guardianNationality ?? null,
				guardianLastEducation: guardianData.guardianLastEducation ?? null,
				guardianPhone: guardianData.guardianPhone ?? null,
				guardianWhatsapp: guardianData.guardianWhatsapp ?? null,
				guardianJob: guardianData.guardianJob ?? null,
				guardianProvinceId: guardianData.guardianProvinceId ?? null,
				guardianRegencyId: guardianData.guardianRegencyId ?? null,
				guardianDistrictId: guardianData.guardianDistrictId ?? null,
				guardianVillage: guardianData.guardianVillage ?? null,
				guardianSubVillage: guardianData.guardianSubVillage ?? null,
				guardianRt: guardianData.guardianRt ?? null,
				guardianRw: guardianData.guardianRw ?? null,
				guardianStreet: guardianData.guardianStreet ?? null,

				// Attachments
				attachCertificate,
				attachPhoto,
				attachFamilyCard,
				attachKsp,
				attachKip,
				attachReportCard,
				attachBirthCertificate,
			})

			const savedRegistrant = await queryRunner.manager.save(registrant)

			// Save disease histories if any
			if (identityData.diseases && identityData.diseases.length > 0) {
				const diseaseEntities = identityData.diseases.map((d) =>
					queryRunner.manager.create(DiseaseHistory, {
						societyId: savedRegistrant.id,
						society: "registrant",
						diseaseName: d.diseaseName,
						diseaseStatus: d.diseaseStatus,
					}),
				)
				await queryRunner.manager.save(diseaseEntities)
			}

			await queryRunner.commitTransaction()

			// Send welcome email with credentials
			const appUrl = this.configService.get("APP_URL", { infer: true })
			await this.mailerService.sendRegistrantPassword(savedRegistrant.email!, {
				fullName: savedRegistrant.fullname ?? "Calon Santri",
				registrantId,
				password: generatedPassword,
				loginUrl: `${appUrl}/login`,
			})

			// Clear Redis wizard keys
			await this.redisService.del(`psb-wizard:${sessionId}:email`)
			await this.redisService.del(`psb-wizard:${sessionId}:personal`)
			await this.redisService.del(`psb-wizard:${sessionId}:identity`)
			await this.redisService.del(`psb-wizard:${sessionId}:family`)
			await this.redisService.del(`psb-wizard:${sessionId}:guardian`)

			// Auto login
			const authResult = await this.psbAuthService.generateTokens(savedRegistrant)

			return {
				success: true,
				registrantId,
				registrant: savedRegistrant,
				auth: authResult,
			}
		} catch (error) {
			await queryRunner.rollbackTransaction()
			throw error
		} finally {
			await queryRunner.release()
		}
	}
}
