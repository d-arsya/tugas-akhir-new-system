import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"

import { Roles } from "@core/auth/decorators/roles.decorator"
import { RolesGuard } from "@core/auth/guards/roles.guard"
import { JwtAuthGuard } from "@core/auth/guards/jwt-auth.guard"
import { DestructiveGuard } from "@core/auth/guards/destructive.guard"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import { AdminMessageResponseDto } from "@admin/dto/admin-response.dto"
import { MajorDetailDto, MajorRowDto, MajorWriteDto } from "@admin/dto/major-admin.dto"
import { MajorAdminService, type MajorDetail, type MajorRow } from "@admin/academic/major-admin.service"

// Legacy `MajorController` (Jurusan).
@ApiTags("Admin — Jurusan")
@ApiBearerAuth("JWT-Auth")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin", "Admin")
@Controller("admin/majors")
export class MajorAdminController {
	constructor(private readonly majorAdminService: MajorAdminService) {}

	@Get()
	@ApiOperation({ summary: "Daftar jurusan" })
	@ApiResponseWrapped({ status: 200, description: "Daftar jurusan", type: MajorRowDto, isArray: true })
	async findAll(): Promise<MajorRow[]> {
		return this.majorAdminService.findAll()
	}

	@Get(":id")
	@ApiOperation({ summary: "Detail jurusan" })
	@ApiResponseWrapped({ status: 200, description: "Detail jurusan", type: MajorDetailDto })
	@ApiResponse({ status: 404, description: "Jurusan tidak ditemukan" })
	async findOne(@Param("id", ParseIntPipe) id: number): Promise<MajorDetail> {
		return this.majorAdminService.findOne(id)
	}

	@Post()
	// Legacy answers 200, not 201
	@HttpCode(200)
	@ApiOperation({ summary: "Tambah jurusan" })
	@ApiResponseWrapped({ status: 200, description: "Jurusan berhasil disimpan", type: AdminMessageResponseDto })
	async create(@Body() dto: MajorWriteDto): Promise<{ message: string }> {
		return this.majorAdminService.create(dto)
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update jurusan" })
	// Legacy's update reuses the create wording
	@ApiResponseWrapped({ status: 200, description: "Jurusan berhasil disimpan", type: AdminMessageResponseDto })
	async update(@Param("id", ParseIntPipe) id: number, @Body() dto: MajorWriteDto): Promise<{ message: string }> {
		return this.majorAdminService.update(id, dto)
	}

	@Delete(":id")
	@UseGuards(DestructiveGuard)
	@ApiOperation({ summary: "Hapus jurusan" })
	@ApiResponseWrapped({ status: 200, description: "Jurusan berhasil dihapus", type: AdminMessageResponseDto })
	async remove(@Param("id", ParseIntPipe) id: number): Promise<{ message: string }> {
		return this.majorAdminService.remove(id)
	}
}
