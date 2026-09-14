import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import { Roles } from "../../../core/auth/decorators/roles.decorator"
import { JwtAuthGuard } from "../../../core/auth/guards/jwt-auth.guard"
import { RolesGuard } from "../../../core/auth/guards/roles.guard"
import { ApiResponseWrapped } from "../../../core/decorators/api-response-wrapped.decorator"
import { UserManagementService } from "../services/user-management.service"
import type { CreateUserDto, UpdateUserDto } from "../dto/user-management.dto"
import type { PaginationQueryDto } from "../../../core/dto/pagination-query.dto"

import { UserResponseDto } from "../dto/user-management.dto"
import { AdminMessageResponseDto } from "../dto/admin-response.dto"

@ApiTags("Admin — User Management")
@Controller("admin/users")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin")
@ApiBearerAuth("JWT-Auth")
export class UserManagementController {
	constructor(private readonly userManagementService: UserManagementService) {}

	@Get()
	@ApiOperation({ summary: "Daftar pengguna admin dengan paginasi dan pencarian" })
	@ApiResponseWrapped({ status: 200, description: "List admin users", type: UserResponseDto, isPaginated: true })
	async findAll(@Query() query: PaginationQueryDto) {
		return this.userManagementService.findAll(query)
	}

	@Get(":id")
	@ApiOperation({ summary: "Detail pengguna admin berdasarkan ID" })
	@ApiResponseWrapped({ status: 200, description: "Detail user", type: UserResponseDto })
	async findOne(@Param("id", ParseIntPipe) id: number) {
		return this.userManagementService.findOne(id)
	}

	@Post()
	@ApiOperation({ summary: "Tambah pengguna admin baru" })
	@ApiResponseWrapped({ status: 201, description: "User berhasil dibuat", type: UserResponseDto })
	async create(@Body() dto: CreateUserDto) {
		return this.userManagementService.create(dto)
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update data pengguna admin" })
	@ApiResponseWrapped({ status: 200, description: "User berhasil diupdate", type: UserResponseDto })
	async update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
		return this.userManagementService.update(id, dto)
	}

	@Patch(":id/toggle-block")
	@ApiOperation({ summary: "Blokir atau buka blokir pengguna admin" })
	@ApiResponseWrapped({ status: 200, description: "Status blokir berhasil diubah", type: UserResponseDto })
	async toggleBlock(@Param("id", ParseIntPipe) id: number) {
		return this.userManagementService.toggleBlock(id)
	}

	@Delete(":id")
	@ApiOperation({ summary: "Hapus pengguna admin" })
	@ApiResponseWrapped({ status: 200, description: "User berhasil dihapus", type: AdminMessageResponseDto })
	async remove(@Param("id", ParseIntPipe) id: number) {
		return this.userManagementService.remove(id)
	}
}

