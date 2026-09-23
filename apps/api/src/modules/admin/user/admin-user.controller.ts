import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"

import { Roles } from "@core/auth/decorators/roles.decorator"
import { RolesGuard } from "@core/auth/guards/roles.guard"
import { JwtAuthGuard } from "@core/auth/guards/jwt-auth.guard"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import { AdminUserService, type AdminUserDetail, type AdminUserRow } from "@admin/user/admin-user.service"
import { AdminMessageResponseDto } from "@admin/dto/admin-response.dto"
import {
	AdminUserCreateDto,
	AdminUserDetailDto,
	AdminUserRowDto,
	AdminUserUpdateDto,
} from "@admin/dto/admin-user.dto"

// Legacy `UserController` (user.index/create/edit/store/update/destroy), guarded by `UserPolicy`,
// which grants every ability to Superadmin only
@ApiTags("Admin — Pengelola")
@ApiBearerAuth("JWT-Auth")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin")
@Controller("admin/users")
export class AdminUserController {
	constructor(private readonly adminUserService: AdminUserService) {}

	@Get()
	@ApiOperation({ summary: "Daftar pengelola (semua user selain Superadmin)" })
	@ApiResponseWrapped({ status: 200, description: "Daftar pengelola", type: AdminUserRowDto, isArray: true })
	async findAll(): Promise<AdminUserRow[]> {
		return this.adminUserService.findAll()
	}

	@Get(":id")
	@ApiOperation({ summary: "Detail pengelola" })
	@ApiResponseWrapped({ status: 200, description: "Detail pengelola", type: AdminUserDetailDto })
	@ApiResponse({ status: 404, description: "Pengelola tidak ditemukan" })
	async findOne(@Param("id", ParseIntPipe) id: number): Promise<AdminUserDetail> {
		return this.adminUserService.findOne(id)
	}

	@Post()
	// Legacy answers 200, not 201
	@HttpCode(200)
	@ApiOperation({ summary: "Tambah pengelola dan kirim email buat password" })
	@ApiResponseWrapped({ status: 200, description: "Pengelola berhasil disimpan", type: AdminMessageResponseDto })
	@ApiResponse({ status: 500, description: "Email buat password gagal dikirim" })
	async create(@Body() dto: AdminUserCreateDto): Promise<{ message: string }> {
		return this.adminUserService.create(dto)
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update pengelola" })
	@ApiResponseWrapped({ status: 200, description: "Pengelola berhasil diupdate", type: AdminMessageResponseDto })
	async update(@Param("id", ParseIntPipe) id: number, @Body() dto: AdminUserUpdateDto): Promise<{ message: string }> {
		return this.adminUserService.update(id, dto)
	}

	@Delete(":id")
	@ApiOperation({ summary: "Hapus pengelola" })
	@ApiResponseWrapped({ status: 200, description: "Pengelola berhasil dihapus", type: AdminMessageResponseDto })
	async remove(@Param("id", ParseIntPipe) id: number): Promise<{ message: string }> {
		return this.adminUserService.remove(id)
	}
}
