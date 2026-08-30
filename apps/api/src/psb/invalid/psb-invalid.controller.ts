import {
	Body,
	Controller,
	Get,
	Patch,
	UploadedFiles,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common"
import { FileFieldsInterceptor } from "@nestjs/platform-express"
import {
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger"
import { CurrentUser } from "../../core/auth/decorators/current-user.decorator"
import { ActiveMemberGuard } from "../guards/active-member.guard"
import { PsbJwtAuthGuard } from "../guards/psb-jwt-auth.guard"
import { FamilyDto } from "../dto/register/family.dto"
import { GuardianDto } from "../dto/register/guardian.dto"
import { IdentityDto } from "../dto/register/identity.dto"
import { PersonalDto } from "../dto/register/personal.dto"
import { MessageResponseDto } from "../dto/auth/auth-response.dto"
import { InvalidFormDataResponseDto } from "../dto/invalid/invalid-response.dto"
import { ApiResponseWrapped } from "../../core/decorators/api-response-wrapped.decorator"
import { PsbInvalidService } from "./psb-invalid.service"
import type { JwtPayload } from "../../core/auth/strategies/jwt.strategy"

@ApiTags("PSB — Invalid Data Correction")
@ApiBearerAuth()
@Controller("psb/invalid/data")
@UseGuards(PsbJwtAuthGuard, ActiveMemberGuard)
export class PsbInvalidController {
	constructor(private readonly psbInvalidService: PsbInvalidService) {}

	@Get()
	@ApiOperation({ summary: "Ambil seluruh formulir data pendaftar yang berstatus invalid untuk diedit" })
	@ApiResponseWrapped({ status: 200, description: "Data perbaikan berhasil dimuat", type: InvalidFormDataResponseDto })
	@ApiResponse({ status: 403, description: "Status bukan invalid" })
	async getFormData(@CurrentUser() user: JwtPayload): Promise<InvalidFormDataResponseDto> {
		const res = await this.psbInvalidService.getFormData(user.sub)
		return {
			registrant: res.registrant as any,
			diseases: res.diseases as any[],
		}
	}

	@Patch("personal")
	@ApiOperation({ summary: "Perbarui data pribadi santri (Status: Invalid)" })
	@ApiResponseWrapped({ status: 200, description: "Data pribadi berhasil diperbarui", type: MessageResponseDto })
	async updatePersonal(
		@CurrentUser() user: JwtPayload,
		@Body() dto: PersonalDto,
	): Promise<MessageResponseDto> {
		const res = await this.psbInvalidService.updatePersonal(user.sub, dto)
		return { message: res.message as string }
	}

	@Patch("identity")
	@ApiOperation({ summary: "Perbarui data identitas & kesehatan (Status: Invalid)" })
	@ApiResponseWrapped({ status: 200, description: "Data identitas berhasil diperbarui", type: MessageResponseDto })
	async updateIdentity(
		@CurrentUser() user: JwtPayload,
		@Body() dto: IdentityDto,
	): Promise<MessageResponseDto> {
		const res = await this.psbInvalidService.updateIdentity(user.sub, dto)
		return { message: res.message as string }
	}

	@Patch("family")
	@ApiOperation({ summary: "Perbarui data keluarga & orang tua (Status: Invalid)" })
	@ApiResponseWrapped({ status: 200, description: "Data keluarga berhasil diperbarui", type: MessageResponseDto })
	async updateFamily(
		@CurrentUser() user: JwtPayload,
		@Body() dto: FamilyDto,
	): Promise<MessageResponseDto> {
		const res = await this.psbInvalidService.updateFamily(user.sub, dto)
		return { message: res.message as string }
	}

	@Patch("guardian")
	@ApiOperation({ summary: "Perbarui data wali santri (Status: Invalid)" })
	@ApiResponseWrapped({ status: 200, description: "Data wali berhasil diperbarui", type: MessageResponseDto })
	async updateGuardian(
		@CurrentUser() user: JwtPayload,
		@Body() dto: GuardianDto,
	): Promise<MessageResponseDto> {
		const res = await this.psbInvalidService.updateGuardian(user.sub, dto)
		return { message: res.message as string }
	}

	@Patch("attachment")
	@ApiOperation({ summary: "Upload perbaikan berkas lampiran dan tandai data sebagai fixed/sudah diperbaiki" })
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		schema: {
			type: "object",
			properties: {
				attachCertificate: { type: "string", format: "binary" },
				attachPhoto: { type: "string", format: "binary" },
				attachFamilyCard: { type: "string", format: "binary" },
				attachKsp: { type: "string", format: "binary" },
				attachKip: { type: "string", format: "binary" },
				attachReportCard: { type: "string", format: "binary" },
				attachBirthCertificate: { type: "string", format: "binary" },
			},
		},
	})
	@ApiResponseWrapped({ status: 200, description: "Berkas berhasil diupload dan status berubah menjadi fixed", type: MessageResponseDto })
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
	async updateAttachment(
		@CurrentUser() user: JwtPayload,
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
	): Promise<MessageResponseDto> {
		const res = await this.psbInvalidService.updateAttachment(user.sub, files)
		return { message: res.message as string }
	}
}
