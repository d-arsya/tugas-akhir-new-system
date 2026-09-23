import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"

import { Roles } from "@core/auth/decorators/roles.decorator"
import { RolesGuard } from "@core/auth/guards/roles.guard"
import { JwtAuthGuard } from "@core/auth/guards/jwt-auth.guard"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import { AdminMessageResponseDto } from "@admin/dto/admin-response.dto"
import {
	AcademicYearCreateDto,
	AcademicYearDetailDto,
	AcademicYearQuotaRowDto,
	AcademicYearRowDto,
	AcademicYearUpdateDto,
} from "@admin/dto/academic-year-admin.dto"
import {
	AcademicYearAdminService,
	type AcademicYearDetail,
	type AcademicYearQuotaRow,
	type AcademicYearRow,
} from "@admin/academic/academic-year-admin.service"

// Legacy `AcademicYearController` (academic-year.index/create/edit/store/update).
// Legacy has no role gate at all — the `asAdmin` group closes before these routes in
// routes/web.php, so only the sidebar hid them. The port gates them server-side to the
// roles the sidebar shows the menu to (plan decision).
@ApiTags("Admin — Tahun Ajaran")
@ApiBearerAuth("JWT-Auth")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin", "Admin")
@Controller("admin/academic-years")
export class AcademicYearAdminController {
	constructor(private readonly academicYearAdminService: AcademicYearAdminService) {}

	@Get()
	@ApiOperation({ summary: "Daftar tahun ajaran" })
	@ApiResponseWrapped({ status: 200, description: "Daftar tahun ajaran", type: AcademicYearRowDto, isArray: true })
	async findAll(): Promise<AcademicYearRow[]> {
		return this.academicYearAdminService.findAll()
	}

	// Must be declared before ":id", otherwise the param route swallows "levels"
	@Get("levels")
	@ApiOperation({ summary: "Tabel kuota jenjang pada halaman tambah" })
	@ApiResponseWrapped({ status: 200, description: "Kuota jenjang", type: AcademicYearQuotaRowDto, isArray: true })
	async findQuotaRows(): Promise<AcademicYearQuotaRow[]> {
		return this.academicYearAdminService.findQuotaRows()
	}

	@Get(":id")
	@ApiOperation({ summary: "Detail tahun ajaran" })
	@ApiResponseWrapped({ status: 200, description: "Detail tahun ajaran", type: AcademicYearDetailDto })
	@ApiResponse({ status: 404, description: "Tahun ajaran tidak ditemukan" })
	async findOne(@Param("id", ParseIntPipe) id: number): Promise<AcademicYearDetail> {
		return this.academicYearAdminService.findOne(id)
	}

	@Get(":id/levels")
	@ApiOperation({ summary: "Tabel kuota jenjang pada halaman detail" })
	@ApiResponseWrapped({ status: 200, description: "Kuota jenjang", type: AcademicYearQuotaRowDto, isArray: true })
	async findQuotaRowsFor(@Param("id", ParseIntPipe) id: number): Promise<AcademicYearQuotaRow[]> {
		return this.academicYearAdminService.findQuotaRowsFor(id)
	}

	@Post()
	// Legacy answers 200, not 201
	@HttpCode(200)
	@ApiOperation({ summary: "Tambah tahun ajaran" })
	@ApiResponseWrapped({ status: 200, description: "Tahun ajaran berhasil disimpan", type: AdminMessageResponseDto })
	async create(@Body() dto: AcademicYearCreateDto): Promise<{ message: string }> {
		return this.academicYearAdminService.create(dto)
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update tahun ajaran" })
	@ApiResponseWrapped({ status: 200, description: "Tahun ajaran berhasil diupdate", type: AdminMessageResponseDto })
	async update(
		@Param("id", ParseIntPipe) id: number,
		@Body() dto: AcademicYearUpdateDto,
	): Promise<{ message: string }> {
		return this.academicYearAdminService.update(id, dto)
	}
}
