import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"

import { Roles } from "@core/auth/decorators/roles.decorator"
import { RolesGuard } from "@core/auth/guards/roles.guard"
import { JwtAuthGuard } from "@core/auth/guards/jwt-auth.guard"
import { DestructiveGuard } from "@core/auth/guards/destructive.guard"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import { AdminMessageResponseDto } from "@admin/common/admin-response.dto"
import { GradeDetailDto, GradeRowDto, GradeWriteDto } from "@admin/academic/dto/grade-admin.dto"
import { GradeAdminService, type GradeDetail, type GradeRow } from "@admin/academic/grade-admin.service"

// Legacy `GradeController` (Kelas) — the left card of the Kelas page.
@ApiTags("Admin — Kelas")
@ApiBearerAuth("JWT-Auth")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin", "Admin")
@Controller("admin/grades")
export class GradeAdminController {
	constructor(private readonly gradeAdminService: GradeAdminService) {}

	@Get()
	@ApiOperation({ summary: "Daftar kelas" })
	@ApiResponseWrapped({ status: 200, description: "Daftar kelas", type: GradeRowDto, isArray: true })
	async findAll(): Promise<GradeRow[]> {
		return this.gradeAdminService.findAll()
	}

	@Get(":id")
	@ApiOperation({ summary: "Detail kelas" })
	@ApiResponseWrapped({ status: 200, description: "Detail kelas", type: GradeDetailDto })
	@ApiResponse({ status: 404, description: "Kelas tidak ditemukan" })
	async findOne(@Param("id", ParseIntPipe) id: number): Promise<GradeDetail> {
		return this.gradeAdminService.findOne(id)
	}

	@Post()
	// Legacy answers 200, not 201
	@HttpCode(200)
	@ApiOperation({ summary: "Tambah kelas" })
	@ApiResponseWrapped({ status: 200, description: "Kelas berhasil disimpan", type: AdminMessageResponseDto })
	async create(@Body() dto: GradeWriteDto): Promise<{ message: string }> {
		return this.gradeAdminService.create(dto)
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update kelas" })
	@ApiResponseWrapped({ status: 200, description: "Kelas berhasil diupdate", type: AdminMessageResponseDto })
	async update(@Param("id", ParseIntPipe) id: number, @Body() dto: GradeWriteDto): Promise<{ message: string }> {
		return this.gradeAdminService.update(id, dto)
	}

	@Delete(":id")
	@UseGuards(DestructiveGuard)
	@ApiOperation({ summary: "Hapus kelas" })
	@ApiResponseWrapped({ status: 200, description: "Kelas berhasil dihapus", type: AdminMessageResponseDto })
	async remove(@Param("id", ParseIntPipe) id: number): Promise<{ message: string }> {
		return this.gradeAdminService.remove(id)
	}
}
