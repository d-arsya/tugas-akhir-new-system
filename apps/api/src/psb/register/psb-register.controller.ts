import {
	Body,
	Controller,
	Get,
	Headers,
	Post,
	UploadedFiles,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common"
import { FileFieldsInterceptor } from "@nestjs/platform-express"
import {
	ApiBody,
	ApiConsumes,
	ApiHeader,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger"
import { Public } from "../../core/auth/decorators/public.decorator"
import { AcademicDataGuard } from "../guards/academic-data.guard"
import { CheckEmailDto } from "../dto/register/check-email.dto"
import { FamilyDto } from "../dto/register/family.dto"
import { GuardianDto } from "../dto/register/guardian.dto"
import { IdentityDto } from "../dto/register/identity.dto"
import { PersonalDto } from "../dto/register/personal.dto"
import { MessageResponseDto } from "../dto/auth/auth-response.dto"
import { ApiResponseWrapped } from "../../core/decorators/api-response-wrapped.decorator"
import {
	LandingInfoResponseDto,
	FormSettingsResponseDto,
	CheckEmailResponseDto,
	WizardStateResponseDto,
	SubmitAttachmentResponseDto,
} from "../dto/register/register-response.dto"
import { PsbRegisterService } from "./psb-register.service"

@ApiTags("PSB — Registration Wizard")
@Controller("psb/register")
export class PsbRegisterController {
	constructor(private readonly psbRegisterService: PsbRegisterService) {}

	@Public()
	@Get("landing")
	@ApiOperation({ summary: "Ambil informasi beranda pendaftaran, tahun ajaran aktif, dan form settings" })
	@ApiResponseWrapped({ status: 200, description: "Metadata pendaftaran berhasil dimuat", type: LandingInfoResponseDto })
	async getLandingInfo(): Promise<LandingInfoResponseDto> {
		const res = await this.psbRegisterService.getLandingInfo()
		return {
			academicYear: res.academicYear as any,
			school: res.school as any,
			announcement: res.announcement as any,
			levels: res.levels as any[],
			formSettings: res.formSettings as any[],
			isOpen: res.isOpen as boolean,
		}
	}

	@Public()
	@Get("form-settings")
	@ApiOperation({ summary: "Ambil konfigurasi dinamis kolom formulir pendaftaran" })
	@ApiResponseWrapped({ status: 200, description: "Pengaturan form berhasil dimuat", type: FormSettingsResponseDto })
	async getFormSettings(): Promise<FormSettingsResponseDto> {
		const formSettings = await this.psbRegisterService.getFormSettings()
		return {
			formSettings: formSettings as any[],
		}
	}

	@Public()
	@Post("check-email")
	@ApiOperation({ summary: "Validasi email awal & mulai wizard sesi pendaftaran (Step 0)" })
	@ApiResponseWrapped({ status: 201, description: "Sesi wizard berhasil dibuat di Redis", type: CheckEmailResponseDto })
	@ApiResponse({ status: 400, description: "Email sudah terdaftar atau jenjang tidak aktif" })
	async checkEmail(@Body() dto: CheckEmailDto): Promise<CheckEmailResponseDto> {
		const res = await this.psbRegisterService.checkEmail(dto)
		return {
			sessionId: res.sessionId as string,
			email: res.email as string,
			levelId: res.levelId as number,
		}
	}

	@Public()
	@UseGuards(AcademicDataGuard)
	@Get("wizard-state")
	@ApiHeader({ name: "x-session-id", required: true, description: "Session ID pendaftaran dari check-email" })
	@ApiOperation({ summary: "Ambil progres data wizard yang tersimpan di Redis" })
	@ApiResponseWrapped({ status: 200, description: "Data progres form saat ini", type: WizardStateResponseDto })
	async getWizardState(@Headers("x-session-id") sessionId: string): Promise<WizardStateResponseDto> {
		const res = await this.psbRegisterService.getWizardState(sessionId)
		return {
			email: res.email as any,
			personal: res.personal as any,
			identity: res.identity as any,
			family: res.family as any,
			guardian: res.guardian as any,
		}
	}

	@Public()
	@UseGuards(AcademicDataGuard)
	@Post("personal")
	@ApiHeader({ name: "x-session-id", required: true, description: "Session ID pendaftaran dari check-email" })
	@ApiOperation({ summary: "Simpan formulir data pribadi santri ke Redis (Step 1)" })
	@ApiResponseWrapped({ status: 201, description: "Data pribadi berhasil disimpan ke sesi wizard", type: MessageResponseDto })
	async savePersonal(
		@Headers("x-session-id") sessionId: string,
		@Body() dto: PersonalDto,
	): Promise<MessageResponseDto> {
		const res = await this.psbRegisterService.savePersonal(sessionId, dto)
		return { message: res.message as string }
	}

	@Public()
	@UseGuards(AcademicDataGuard)
	@Post("identity")
	@ApiHeader({ name: "x-session-id", required: true, description: "Session ID pendaftaran dari check-email" })
	@ApiOperation({ summary: "Simpan formulir identitas, kesehatan, & riwayat penyakit ke Redis (Step 2)" })
	@ApiResponseWrapped({ status: 201, description: "Data identitas berhasil disimpan ke sesi wizard", type: MessageResponseDto })
	async saveIdentity(
		@Headers("x-session-id") sessionId: string,
		@Body() dto: IdentityDto,
	): Promise<MessageResponseDto> {
		const res = await this.psbRegisterService.saveIdentity(sessionId, dto)
		return { message: res.message as string }
	}

	@Public()
	@UseGuards(AcademicDataGuard)
	@Post("family")
	@ApiHeader({ name: "x-session-id", required: true, description: "Session ID pendaftaran dari check-email" })
	@ApiOperation({ summary: "Simpan formulir data orang tua/keluarga ke Redis (Step 3)" })
	@ApiResponseWrapped({ status: 201, description: "Data keluarga berhasil disimpan ke sesi wizard", type: MessageResponseDto })
	async saveFamily(
		@Headers("x-session-id") sessionId: string,
		@Body() dto: FamilyDto,
	): Promise<MessageResponseDto> {
		const res = await this.psbRegisterService.saveFamily(sessionId, dto)
		return { message: res.message as string }
	}

	@Public()
	@UseGuards(AcademicDataGuard)
	@Post("guardian")
	@ApiHeader({ name: "x-session-id", required: true, description: "Session ID pendaftaran dari check-email" })
	@ApiOperation({ summary: "Simpan formulir data wali ke Redis (Step 4)" })
	@ApiResponseWrapped({ status: 201, description: "Data wali berhasil disimpan ke sesi wizard", type: MessageResponseDto })
	async saveGuardian(
		@Headers("x-session-id") sessionId: string,
		@Body() dto: GuardianDto,
	): Promise<MessageResponseDto> {
		const res = await this.psbRegisterService.saveGuardian(sessionId, dto)
		return { message: res.message as string }
	}

	@Public()
	@UseGuards(AcademicDataGuard)
	@Post("attachment")
	@ApiHeader({ name: "x-session-id", required: true, description: "Session ID pendaftaran dari check-email" })
	@ApiOperation({ summary: "Upload berkas lampiran, simpan final pendaftaran ke database, & kirim password email (Step 5)" })
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		schema: {
			type: "object",
			properties: {
				attachCertificate: { type: "string", format: "binary", description: "Ijazah / SKL" },
				attachPhoto: { type: "string", format: "binary", description: "Pasfoto calon santri" },
				attachFamilyCard: { type: "string", format: "binary", description: "Kartu Keluarga (KK)" },
				attachKsp: { type: "string", format: "binary", description: "Kartu KSP (opsional)" },
				attachKip: { type: "string", format: "binary", description: "Kartu KIP/PIP (opsional)" },
				attachReportCard: { type: "string", format: "binary", description: "Rapor sekolah asal" },
				attachBirthCertificate: { type: "string", format: "binary", description: "Akta Kelahiran" },
			},
		},
	})
	@ApiResponseWrapped({ status: 201, description: "Pendaftaran berhasil, nomor registrant_id dibuat, email password terkirim", type: SubmitAttachmentResponseDto })
	@UseInterceptors(
		FileFieldsInterceptor([
			{ name: "attachCertificate", maxCount: 1 },
			{ name: "attachPhoto", maxCount: 1 },
			{ name: "attachFamilyCard", maxCount: 1 },
			{ name: "attachKsp", maxCount: 1 },
			{ name: "attachKip", maxCount: 1 },
			{ name: "attachReportCard", maxCount: 1 },
			{ name: "attachBirthCertificate", maxCount: 1 },
		]),
	)
	async submitAttachment(
		@Headers("x-session-id") sessionId: string,
		@UploadedFiles()
		files: {
			attachCertificate?: Express.Multer.File[]
			attachPhoto?: Express.Multer.File[]
			attachFamilyCard?: Express.Multer.File[]
			attachKsp?: Express.Multer.File[]
			attachKip?: Express.Multer.File[]
			attachReportCard?: Express.Multer.File[]
			attachBirthCertificate?: Express.Multer.File[]
		},
	): Promise<SubmitAttachmentResponseDto> {
		const res = await this.psbRegisterService.submitAttachment(sessionId, files)
		return {
			success: res.success as boolean,
			registrantId: res.registrantId as string,
			registrant: res.registrant as any,
			auth: res.auth as any,
		}
	}
}
