import { BadRequestException, Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { InjectRepository } from "@nestjs/typeorm"
import * as bcrypt from "bcrypt"
import * as crypto from "crypto"
import { DataSource, Like, Repository } from "typeorm"
import { RegistrantPasswordEvent } from "@core/mailer/events/email.events"
import { RedisService } from "@core/redis/redis.service"
import { StorageService } from "@core/storage/storage.service"
import { PsbAuthService } from "@psb/auth/psb-auth.service"
import { AcademicYear } from "@shared/master/entities/academic-year.entity"
import { DiseaseHistory } from "@psb/entities/disease-history.entity"
import { Level } from "@shared/master/entities/level.entity"
import { Registrant } from "@psb/entities/registrant.entity"
import { SettingAnnc } from "@shared/school/entities/setting-annc.entity"
import { SettingForm } from "@shared/school/entities/setting-form.entity"
import { SettingSchool } from "@shared/school/entities/setting-school.entity"
import type { Env } from "@core/config/env.validation"
import type { CheckEmailDto } from "@psb/dto/register/check-email.dto"
import type { FamilyDto } from "@psb/dto/register/family.dto"
import type { GuardianDto } from "@psb/dto/register/guardian.dto"
import type { IdentityDto } from "@psb/dto/register/identity.dto"
import type { PersonalDto } from "@psb/dto/register/personal.dto"
import { generateRegistrantId } from "@psb/register/helpers/registrant-id.generator"
import { uploadRegistrantAttachments, type RegistrationFiles } from "@psb/register/helpers/attachment-uploader.helper"
import { mapWizardDataToRegistrant } from "@psb/register/helpers/registrant-mapper.helper"

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
		private readonly eventEmitter: EventEmitter2,
		private readonly configService: ConfigService<Env, true>,
		private readonly psbAuthService: PsbAuthService,
		private readonly dataSource: DataSource,
	) { }

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
		const school = await this.settingSchoolRepository.findOne({ where: { id: 1 }, order: { id: "DESC" } })
		const announcement = await this.settingAnncRepository.findOne({ where: { id: 1 }, order: { id: "DESC" } })
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
		files: RegistrationFiles,
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

		// Fetch academic year & generate Registrant ID
		const academicYear = await this.academicYearRepository.findOne({
			where: [{ isCurrent: true, status: true }, { status: true }],
			order: { id: "DESC" },
		})
		const currentYearStr = academicYear?.year ? academicYear.year.substring(0, 4) : new Date().getFullYear().toString()
		const latestRegistrant = await this.registrantRepository.findOne({
			where: { registrantId: Like(`PR${currentYearStr}%`) },
			order: { id: "DESC" },
		})

		const registrantId = generateRegistrantId(academicYear, latestRegistrant)
		const generatedPassword = crypto.randomBytes(4).toString("hex").toUpperCase()
		const hashedPassword = await bcrypt.hash(generatedPassword, 10)

		const attachments = await uploadRegistrantAttachments(this.storageService, registrantId, files)

		const queryRunner = this.dataSource.createQueryRunner()
		await queryRunner.connect()
		await queryRunner.startTransaction()

		try {
			const registrantPayload = mapWizardDataToRegistrant({
				academicYear,
				levelId: emailData.levelId,
				registrantId,
				email: emailData.email,
				hashedPassword,
				personalData,
				identityData,
				familyData,
				guardianData,
				attachments,
			})

			const registrant = queryRunner.manager.create(Registrant, registrantPayload)
			const savedRegistrant = await queryRunner.manager.save(registrant)

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

			try {
				const appUrl = this.configService.get("APP_URL", { infer: true })
				this.eventEmitter.emit(
					"registrant.password.created",
					new RegistrantPasswordEvent(savedRegistrant.email!, {
						fullName: savedRegistrant.fullname ?? "Calon Santri",
						registrantId,
						password: generatedPassword,
						loginUrl: `${appUrl}/login`,
					}),
				)
			} catch (mailError) {
				console.error("Failed to emit registrant password event:", mailError)
			}

			await Promise.all([
				this.redisService.del(`psb-wizard:${sessionId}:email`),
				this.redisService.del(`psb-wizard:${sessionId}:personal`),
				this.redisService.del(`psb-wizard:${sessionId}:identity`),
				this.redisService.del(`psb-wizard:${sessionId}:family`),
				this.redisService.del(`psb-wizard:${sessionId}:guardian`),
			])

			const authResult = await this.psbAuthService.generateTokens(savedRegistrant)

			return {
				success: true,
				registrantId,
				password: generatedPassword,
				registrant: savedRegistrant,
				auth: authResult,
			}
		} catch (error) {
			if (queryRunner.isTransactionActive) {
				await queryRunner.rollbackTransaction()
			}
			throw error
		} finally {
			await queryRunner.release()
		}
	}
}
