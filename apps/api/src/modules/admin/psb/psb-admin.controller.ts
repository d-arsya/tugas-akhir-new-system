import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger"
import { Roles } from "@core/auth/decorators/roles.decorator"
import { JwtAuthGuard } from "@core/auth/guards/jwt-auth.guard"
import { RolesGuard } from "@core/auth/guards/roles.guard"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import { PsbAdminService } from "@admin/psb/psb-admin.service"
import {
	PsbRegistrantFilterDto,
	UpdateRegistrantDto,
	UpdateRegistrantStatusDto,
	CreateRegistrantManualDto,
	PsbAcademicYearStatsResponseDto,
	PsbRegistrantResponseDto,
} from "@admin/dto/psb-admin.dto"

@ApiTags("Admin — PSB Management")
@Controller("admin/psb")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin", "Admin")
@ApiBearerAuth("JWT-Auth")
export class PsbAdminController {
	constructor(private readonly psbAdminService: PsbAdminService) {}

	@Get("academic-years")
	@ApiOperation({ summary: "Statistik pendaftar per tahun akademik" })
	@ApiResponseWrapped({
		status: 200,
		description: "Statistik tahun akademik PSB",
		type: PsbAcademicYearStatsResponseDto,
		isArray: true,
	})
	async getAcademicYearsStats() {
		return this.psbAdminService.getAcademicYearsStats()
	}

	@Get(":academicYearId/registrants")
	@ApiOperation({ summary: "Daftar pendaftar berdasarkan tahun akademik" })
	@ApiResponseWrapped({
		status: 200,
		description: "Daftar pendaftar PSB",
		type: PsbRegistrantResponseDto,
		isPaginated: true,
	})
	async findAllRegistrants(
		@Param("academicYearId", ParseIntPipe) academicYearId: number,
		@Query() query: PsbRegistrantFilterDto,
	) {
		return this.psbAdminService.findAllRegistrants(academicYearId, query)
	}

	@Get(":academicYearId/download")
	@ApiOperation({ summary: "Export daftar pendaftar PSB" })
	@ApiQuery({ name: "status", required: false, type: String })
	@ApiResponseWrapped({
		status: 200,
		description: "Data export pendaftar PSB",
		type: PsbRegistrantResponseDto,
		isArray: true,
	})
	async exportRegistrants(
		@Param("academicYearId", ParseIntPipe) academicYearId: number,
		@Query("status") status?: string,
	) {
		return this.psbAdminService.exportRegistrants(academicYearId, status)
	}

	@Get("registrants/:id")
	@ApiOperation({ summary: "Detail data pendaftar" })
	@ApiResponseWrapped({
		status: 200,
		description: "Detail data pendaftar PSB",
		type: PsbRegistrantResponseDto,
	})
	async findRegistrantById(@Param("id", ParseIntPipe) id: number) {
		return this.psbAdminService.findRegistrantById(id)
	}

	@Patch("registrants/:id")
	@ApiOperation({ summary: "Update profil pendaftar" })
	@ApiResponseWrapped({
		status: 200,
		description: "Profil pendaftar berhasil diupdate",
		type: PsbRegistrantResponseDto,
	})
	async updateRegistrant(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateRegistrantDto) {
		return this.psbAdminService.updateRegistrant(id, dto)
	}

	@Patch("registrants/:id/status")
	@ApiOperation({ summary: "Update status kelulusan / verifikasi pendaftar" })
	@ApiResponseWrapped({
		status: 200,
		description: "Status pendaftar berhasil diupdate",
		type: PsbRegistrantResponseDto,
	})
	async updateRegistrantStatus(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateRegistrantStatusDto) {
		return this.psbAdminService.updateRegistrantStatus(id, dto)
	}

	@Post("registrants/create")
	@ApiOperation({ summary: "Tambah pendaftar manual oleh admin" })
	@ApiResponseWrapped({
		status: 201,
		description: "Pendaftar manual berhasil dibuat",
		type: PsbRegistrantResponseDto,
	})
	async createRegistrantManual(@Body() dto: CreateRegistrantManualDto) {
		return this.psbAdminService.createRegistrantManual(dto)
	}
}
