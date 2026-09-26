import { Body, Controller, Get, Inject, Param, ParseIntPipe, Patch, Post, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common"
import { FileFieldsInterceptor } from "@nestjs/platform-express"
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger"

import type { AdminMessageResult, AdminRegistrantCreateOptions, AdminRegistrantCreateResult, SocietyStepCheckDto } from "@roja/types"

import { Roles } from "../../../core/auth/decorators/roles.decorator"
import { JwtAuthGuard } from "../../../core/auth/guards/jwt-auth.guard"
import { RolesGuard } from "../../../core/auth/guards/roles.guard"

import { RegistrantAdminService } from "./registrant-admin.service"
import { RegistrantStatusService } from "./registrant-status.service"
import { RegistrantWriteService } from "./registrant-write.service"

// Legacy `Registrant\*Controller` (the create wizard), `RegistrantController::update` and
// `::updateStatusData`. Owned by workstream AK-P. Registered before `RegistrantAdminController`
// so the literal `create/…` paths win over `:registrantId`.

// The seven `attach_*` inputs; no multer `limits`, so the size rule answers with the legacy message
const ATTACHMENTS = [
	"attach_certificate",
	"attach_photo",
	"attach_family_card",
	"attach_ksp",
	"attach_kip",
	"attach_report_card",
	"attach_birth_certificate",
].map((name) => ({ name, maxCount: 1 }))

type Uploads = Record<string, Express.Multer.File[] | undefined>

@ApiTags("Admin — Akademik PSB")
@ApiBearerAuth("JWT-Auth")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin", "Admin")
@Controller("admin/registrants")
export class RegistrantFormController {
	constructor(
		@Inject(RegistrantAdminService) private readonly registrantAdminService: RegistrantAdminService,
		@Inject(RegistrantWriteService) private readonly registrantWriteService: RegistrantWriteService,
		@Inject(RegistrantStatusService) private readonly registrantStatusService: RegistrantStatusService,
	) {}

	@Get("create/options")
	@ApiOperation({ summary: "Tambah PSB — pilihan tahun ajaran dan jenjang" })
	async createOptions(): Promise<AdminRegistrantCreateOptions> {
		return this.registrantAdminService.findCreateOptions()
	}

	@Post("create/validate/:step")
	@ApiOperation({ summary: "Tambah PSB — validasi satu langkah (validate*Data)" })
	async validateStep(@Param("step") step: string, @Body() body: SocietyStepCheckDto): Promise<AdminMessageResult> {
		return this.registrantWriteService.validateStep(step, body)
	}

	@Post("create")
	@ApiOperation({ summary: "Tambah PSB — simpan (validateAttachmentData)" })
	@ApiConsumes("multipart/form-data")
	@UseInterceptors(FileFieldsInterceptor(ATTACHMENTS))
	async create(@Body() body: Record<string, unknown>, @UploadedFiles() files: Uploads): Promise<AdminRegistrantCreateResult> {
		return this.registrantWriteService.create(body, files)
	}

	@Patch(":registrantId/status-data")
	@ApiOperation({ summary: "Validasi data, tes, pengumuman hasil (updateStatusData)" })
	async updateStatus(
		@Param("registrantId", ParseIntPipe) registrantId: number,
		@Body() body: Record<string, unknown>,
	): Promise<AdminMessageResult> {
		return this.registrantStatusService.updateStatus(registrantId, body)
	}

	@Patch(":registrantId")
	@ApiOperation({ summary: "Simpan detail PSB (update)" })
	@ApiConsumes("multipart/form-data")
	@UseInterceptors(FileFieldsInterceptor(ATTACHMENTS))
	async update(
		@Param("registrantId", ParseIntPipe) registrantId: number,
		@Body() body: Record<string, unknown>,
		@UploadedFiles() files: Uploads,
	): Promise<AdminMessageResult> {
		return this.registrantWriteService.update(registrantId, body, files)
	}
}
