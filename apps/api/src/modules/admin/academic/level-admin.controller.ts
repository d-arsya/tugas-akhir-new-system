import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Query,
	UseGuards,
} from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger"

import { Roles } from "@core/auth/decorators/roles.decorator"
import { RolesGuard } from "@core/auth/guards/roles.guard"
import { JwtAuthGuard } from "@core/auth/guards/jwt-auth.guard"
import { DestructiveGuard } from "@core/auth/guards/destructive.guard"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import { AdminMessageResponseDto } from "@admin/common/admin-response.dto"
import { AdminRedirectResultDto, type AdminRedirectResult } from "@admin/common/admin-response.dto"
import {
	LevelDelegateDto,
	LevelDeleteStepDto,
	LevelDetailDto,
	LevelOptionDto,
	LevelRowDto,
	LevelWriteDto,
} from "@admin/academic/dto/level-admin.dto"
import {
	LevelAdminService,
	type LevelDeleteStep,
	type LevelDeleteTarget,
	type LevelDetail,
	type LevelOption,
	type LevelRow,
} from "@admin/academic/level-admin.service"

// Legacy `LevelController` (Jenjang). Gated server-side to the roles the sidebar shows the
// Akademik group to; legacy had no gate on the route at all.
@ApiTags("Admin — Jenjang")
@ApiBearerAuth("JWT-Auth")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin", "Admin")
@Controller("admin/levels")
export class LevelAdminController {
	constructor(private readonly levelAdminService: LevelAdminService) {}

	@Get()
	@ApiOperation({ summary: "Daftar jenjang" })
	@ApiResponseWrapped({ status: 200, description: "Daftar jenjang", type: LevelRowDto, isArray: true })
	async findAll(): Promise<LevelRow[]> {
		return this.levelAdminService.findAll()
	}

	// Must be declared before ":id"
	@Get("options")
	@ApiOperation({ summary: "Pilihan jenjang untuk select" })
	@ApiQuery({ name: "exclude", required: false, type: Number })
	@ApiResponseWrapped({ status: 200, description: "Pilihan jenjang", type: LevelOptionDto, isArray: true })
	async findOptions(@Query("exclude") exclude?: string): Promise<LevelOption[]> {
		return this.levelAdminService.findOptions(exclude ? Number(exclude) : undefined)
	}

	@Get(":id")
	@ApiOperation({ summary: "Detail jenjang" })
	@ApiResponseWrapped({ status: 200, description: "Detail jenjang", type: LevelDetailDto })
	@ApiResponse({ status: 404, description: "Jenjang tidak ditemukan" })
	async findOne(@Param("id", ParseIntPipe) id: number): Promise<LevelDetail> {
		return this.levelAdminService.findOne(id)
	}

	@Get(":id/delete-step")
	@ApiOperation({ summary: "Data untuk halaman hapus / delegasi jenjang" })
	@ApiQuery({
		name: "step",
		enum: ["delete", "delegate-major", "delegate-grade", "delegate-registrant", "delegate-student"],
	})
	@ApiResponseWrapped({ status: 200, description: "Langkah hapus", type: LevelDeleteStepDto })
	async findStep(
		@Param("id", ParseIntPipe) id: number,
		@Query("step") step: LevelDeleteTarget,
	): Promise<LevelDeleteStep> {
		return this.levelAdminService.findStep(id, step)
	}

	@Post()
	// Legacy answers 200, not 201
	@HttpCode(200)
	@ApiOperation({ summary: "Tambah jenjang" })
	@ApiResponseWrapped({ status: 200, description: "Jenjang berhasil disimpan", type: AdminMessageResponseDto })
	async create(@Body() dto: LevelWriteDto): Promise<{ message: string }> {
		return this.levelAdminService.create(dto)
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update jenjang" })
	// Legacy's update reuses the create wording: "Data berhasil disimpan ke dalam basis data."
	@ApiResponseWrapped({ status: 200, description: "Jenjang berhasil disimpan", type: AdminMessageResponseDto })
	async update(@Param("id", ParseIntPipe) id: number, @Body() dto: LevelWriteDto): Promise<{ message: string }> {
		return this.levelAdminService.update(id, dto)
	}

	@Delete(":id")
	@UseGuards(DestructiveGuard)
	@ApiOperation({ summary: "Hapus jenjang" })
	@ApiResponseWrapped({ status: 200, description: "Jenjang berhasil dihapus", type: AdminRedirectResultDto })
	async remove(@Param("id", ParseIntPipe) id: number): Promise<AdminRedirectResult> {
		return this.levelAdminService.remove(id)
	}

	@Patch(":id/delegate-major")
	@UseGuards(DestructiveGuard)
	@ApiOperation({ summary: "Pindahkan jurusan ke jenjang lain, lalu lanjut ke langkah berikutnya" })
	@ApiResponseWrapped({ status: 200, description: "Data jurusan didistribusikan", type: AdminRedirectResultDto })
	async delegateMajor(
		@Param("id", ParseIntPipe) id: number,
		@Body() dto: LevelDelegateDto,
	): Promise<AdminRedirectResult> {
		return this.levelAdminService.delegateMajor(id, dto)
	}

	@Patch(":id/delegate-grade")
	@UseGuards(DestructiveGuard)
	@ApiOperation({ summary: "Pindahkan kelas ke jenjang lain, lalu lanjut ke langkah berikutnya" })
	@ApiResponseWrapped({ status: 200, description: "Data kelas didistribusikan", type: AdminRedirectResultDto })
	async delegateGrade(
		@Param("id", ParseIntPipe) id: number,
		@Body() dto: LevelDelegateDto,
	): Promise<AdminRedirectResult> {
		return this.levelAdminService.delegateGrade(id, dto)
	}

	@Patch(":id/delegate-registrant")
	@UseGuards(DestructiveGuard)
	@ApiOperation({ summary: "Pindahkan pendaftar ke jenjang lain, lalu lanjut ke langkah berikutnya" })
	@ApiResponseWrapped({ status: 200, description: "Data PSB didistribusikan", type: AdminRedirectResultDto })
	async delegateRegistrant(
		@Param("id", ParseIntPipe) id: number,
		@Body() dto: LevelDelegateDto,
	): Promise<AdminRedirectResult> {
		return this.levelAdminService.delegateRegistrant(id, dto)
	}

	@Patch(":id/delegate-student")
	@UseGuards(DestructiveGuard)
	@ApiOperation({ summary: "Pindahkan santri ke jenjang lain, lalu hapus jenjang" })
	@ApiResponseWrapped({ status: 200, description: "Data santri didistribusikan", type: AdminRedirectResultDto })
	async delegateStudent(
		@Param("id", ParseIntPipe) id: number,
		@Body() dto: LevelDelegateDto,
	): Promise<AdminRedirectResult> {
		return this.levelAdminService.delegateStudent(id, dto)
	}
}
