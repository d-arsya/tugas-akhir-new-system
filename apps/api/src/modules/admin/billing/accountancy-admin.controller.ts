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
import { AdminMessageResponseDto } from "@admin/dto/admin-response.dto"
import { AdminRedirectResultDto } from "@admin/dto/academic-year-admin.dto"
import {
	AccountancyDeleteStepDto,
	AccountancyDelegateDto,
	AccountancyDetailDto,
	AccountancyOptionDto,
	AccountancyRowDto,
	AccountancyWriteDto,
} from "@admin/dto/accountancy-admin.dto"
import {
	AccountancyAdminService,
	type AccountancyDeleteStep,
	type AccountancyDeleteTarget,
	type AccountancyDetail,
	type AccountancyOption,
	type AccountancyRow,
	type AdminRedirectResult,
} from "@admin/billing/accountancy-admin.service"

// Legacy `AccountancyController` (Data Master ▸ Keuangan ▸ Akun). Legacy has no route gate at
// all; the port gates it to the roles the sidebar shows the Keuangan group to.
@ApiTags("Admin — Akun")
@ApiBearerAuth("JWT-Auth")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin", "Bendahara")
@Controller("admin/accountancies")
export class AccountancyAdminController {
	constructor(private readonly accountancyAdminService: AccountancyAdminService) {}

	@Get()
	@ApiOperation({ summary: "Pohon akun, dirata-kan secara depth-first" })
	@ApiResponseWrapped({ status: 200, description: "Daftar akun", type: AccountancyRowDto, isArray: true })
	async findAll(): Promise<AccountancyRow[]> {
		return this.accountancyAdminService.findAll()
	}

	// Must be declared before ":id"
	@Get("options")
	@ApiOperation({ summary: "Pilihan induk akun" })
	@ApiResponseWrapped({ status: 200, description: "Pilihan akun", type: AccountancyOptionDto, isArray: true })
	async findOptions(): Promise<AccountancyOption[]> {
		return this.accountancyAdminService.findOptions()
	}

	@Get(":id")
	@ApiOperation({ summary: "Detail akun" })
	@ApiResponseWrapped({ status: 200, description: "Detail akun", type: AccountancyDetailDto })
	@ApiResponse({ status: 404, description: "Akun tidak ditemukan" })
	async findOne(@Param("id", ParseIntPipe) id: number): Promise<AccountancyDetail> {
		return this.accountancyAdminService.findOne(id)
	}

	@Get(":id/delete-step")
	@ApiOperation({ summary: "Data untuk halaman hapus / delegasi akun" })
	@ApiQuery({ name: "step", enum: ["delete", "delegate-child"] })
	@ApiResponseWrapped({ status: 200, description: "Langkah hapus", type: AccountancyDeleteStepDto })
	async findStep(
		@Param("id", ParseIntPipe) id: number,
		@Query("step") step: AccountancyDeleteTarget,
	): Promise<AccountancyDeleteStep> {
		return this.accountancyAdminService.findStep(id, step)
	}

	@Post()
	// Legacy answers 200, not 201
	@HttpCode(200)
	@ApiOperation({ summary: "Tambah akun" })
	@ApiResponseWrapped({ status: 200, description: "Akun berhasil disimpan", type: AdminMessageResponseDto })
	async create(@Body() dto: AccountancyWriteDto): Promise<{ message: string }> {
		return this.accountancyAdminService.create(dto)
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update akun" })
	@ApiResponseWrapped({ status: 200, description: "Akun berhasil diupdate", type: AdminMessageResponseDto })
	async update(@Param("id", ParseIntPipe) id: number, @Body() dto: AccountancyWriteDto): Promise<{ message: string }> {
		return this.accountancyAdminService.update(id, dto)
	}

	@Delete(":id")
	@UseGuards(DestructiveGuard)
	@ApiOperation({ summary: "Hapus akun tanpa anak" })
	@ApiResponseWrapped({ status: 200, description: "Akun berhasil dihapus", type: AdminRedirectResultDto })
	async remove(@Param("id", ParseIntPipe) id: number): Promise<AdminRedirectResult> {
		return this.accountancyAdminService.remove(id)
	}

	@Patch(":id/delegate-child")
	@UseGuards(DestructiveGuard)
	@ApiOperation({ summary: "Pindahkan anak akun ke induk lain, lalu hapus akun" })
	@ApiResponseWrapped({ status: 200, description: "Anak akun didistribusikan", type: AdminRedirectResultDto })
	async delegateChild(
		@Param("id", ParseIntPipe) id: number,
		@Body() dto: AccountancyDelegateDto,
	): Promise<AdminRedirectResult> {
		return this.accountancyAdminService.delegateChild(id, dto)
	}
}
