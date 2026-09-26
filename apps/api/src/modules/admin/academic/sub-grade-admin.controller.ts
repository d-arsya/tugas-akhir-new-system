import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"

import { Roles } from "@core/auth/decorators/roles.decorator"
import { RolesGuard } from "@core/auth/guards/roles.guard"
import { JwtAuthGuard } from "@core/auth/guards/jwt-auth.guard"
import { DestructiveGuard } from "@core/auth/guards/destructive.guard"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import { AdminMessageResponseDto } from "@admin/common/admin-response.dto"
import { SubGradeDetailDto, SubGradeRowDto, SubGradeWriteDto } from "@admin/academic/dto/sub-grade-admin.dto"
import {
	SubGradeAdminService,
	type SubGradeDetail,
	type SubGradeRow,
} from "@admin/academic/sub-grade-admin.service"

// Legacy `SubGradeController` (Subkelas). Legacy registers no index and no show.
@ApiTags("Admin — Subkelas")
@ApiBearerAuth("JWT-Auth")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin", "Admin")
@Controller("admin/sub-grades")
export class SubGradeAdminController {
	constructor(private readonly subGradeAdminService: SubGradeAdminService) {}

	@Get()
	@ApiOperation({ summary: "Daftar subkelas" })
	@ApiResponseWrapped({ status: 200, description: "Daftar subkelas", type: SubGradeRowDto, isArray: true })
	async findAll(): Promise<SubGradeRow[]> {
		return this.subGradeAdminService.findAll()
	}

	@Get(":id")
	@ApiOperation({ summary: "Detail subkelas" })
	@ApiResponseWrapped({ status: 200, description: "Detail subkelas", type: SubGradeDetailDto })
	@ApiResponse({ status: 404, description: "Subkelas tidak ditemukan" })
	async findOne(@Param("id", ParseIntPipe) id: number): Promise<SubGradeDetail> {
		return this.subGradeAdminService.findOne(id)
	}

	@Post()
	// Legacy answers 200, not 201
	@HttpCode(200)
	@ApiOperation({ summary: "Tambah subkelas" })
	@ApiResponseWrapped({ status: 200, description: "Subkelas berhasil disimpan", type: AdminMessageResponseDto })
	async create(@Body() dto: SubGradeWriteDto): Promise<{ message: string }> {
		return this.subGradeAdminService.create(dto)
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update subkelas" })
	@ApiResponseWrapped({ status: 200, description: "Subkelas berhasil diupdate", type: AdminMessageResponseDto })
	async update(@Param("id", ParseIntPipe) id: number, @Body() dto: SubGradeWriteDto): Promise<{ message: string }> {
		return this.subGradeAdminService.update(id, dto)
	}

	@Delete(":id")
	@UseGuards(DestructiveGuard)
	@ApiOperation({ summary: "Hapus subkelas" })
	@ApiResponseWrapped({ status: 200, description: "Subkelas berhasil dihapus", type: AdminMessageResponseDto })
	async remove(@Param("id", ParseIntPipe) id: number): Promise<{ message: string }> {
		return this.subGradeAdminService.remove(id)
	}
}
