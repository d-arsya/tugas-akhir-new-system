import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"

import { Roles } from "@core/auth/decorators/roles.decorator"
import { RolesGuard } from "@core/auth/guards/roles.guard"
import { JwtAuthGuard } from "@core/auth/guards/jwt-auth.guard"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import { AdminRedirectResultDto, type AdminRedirectResult } from "@admin/common/admin-response.dto"
import {
	MerchantDetailDto,
	MerchantNextNumberDto,
	MerchantRowDto,
	MerchantWriteDto,
} from "@admin/merchant/dto/merchant-admin.dto"
import {
	MerchantAdminService,
	type MerchantDetail,
	type MerchantRow,
} from "@admin/merchant/merchant-admin.service"

// Legacy `MerchantController`. The sidebar shows this group to Superadmin, Admin and the
// cashier role, so the port gates it to those three — the previous placeholder controller was
// Superadmin-only, which was stricter than legacy intended.
@ApiTags("Admin — Merchant")
@ApiBearerAuth("JWT-Auth")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin", "Admin", "Kasir E-Wallet")
@Controller("admin/merchants")
export class MerchantAdminController {
	constructor(private readonly merchantAdminService: MerchantAdminService) {}

	@Get()
	@ApiOperation({ summary: "Daftar merchant" })
	@ApiResponseWrapped({ status: 200, description: "Daftar merchant", type: MerchantRowDto, isArray: true })
	async findAll(): Promise<MerchantRow[]> {
		return this.merchantAdminService.findAll()
	}

	// Must be declared before ":id"
	@Get("next-number")
	@ApiOperation({ summary: "Nomor merchant berikutnya untuk form tambah" })
	@ApiResponseWrapped({ status: 200, description: "Nomor merchant", type: MerchantNextNumberDto })
	async nextUniqueNumber(): Promise<{ uniqueNumber: string }> {
		return this.merchantAdminService.nextUniqueNumber()
	}

	@Get(":id")
	@ApiOperation({ summary: "Detail merchant" })
	@ApiResponseWrapped({ status: 200, description: "Detail merchant", type: MerchantDetailDto })
	@ApiResponse({ status: 404, description: "Merchant tidak ditemukan" })
	async findOne(@Param("id", ParseIntPipe) id: number): Promise<MerchantDetail> {
		return this.merchantAdminService.findOne(id)
	}

	@Post()
	// Legacy answers 200 with `{message, redirect}`
	@HttpCode(200)
	@ApiOperation({ summary: "Tambah merchant dan kirim email kredensial" })
	@ApiResponseWrapped({ status: 200, description: "Berhasil disimpan", type: AdminRedirectResultDto })
	@ApiResponse({ status: 500, description: "Gagal disimpan" })
	async create(@Body() dto: MerchantWriteDto): Promise<AdminRedirectResult> {
		return this.merchantAdminService.create(dto)
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update merchant dan sinkronkan status e-wallet" })
	@ApiResponseWrapped({ status: 200, description: "Berhasil disimpan", type: AdminRedirectResultDto })
	async update(@Param("id", ParseIntPipe) id: number, @Body() dto: MerchantWriteDto): Promise<AdminRedirectResult> {
		return this.merchantAdminService.update(id, dto)
	}
}
