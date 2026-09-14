import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import { Roles } from "../../../core/auth/decorators/roles.decorator"
import { JwtAuthGuard } from "../../../core/auth/guards/jwt-auth.guard"
import { RolesGuard } from "../../../core/auth/guards/roles.guard"
import { ApiResponseWrapped } from "../../../core/decorators/api-response-wrapped.decorator"
import { MerchantAdminService } from "../services/merchant-admin.service"
import {
	CreateMerchantDto,
	UpdateMerchantDto,
	ToggleBlockMerchantDto,
	MerchantResponseDto,
} from "../dto/merchant-admin.dto"
import { EwalletTransactionResponseDto } from "../dto/ewallet-admin.dto"
import { AdminMessageResponseDto } from "../dto/admin-response.dto"

@ApiTags("Admin — Merchant Management")
@Controller("admin/merchants")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin")
@ApiBearerAuth("JWT-Auth")
export class MerchantAdminController {
	constructor(private readonly merchantAdminService: MerchantAdminService) {}

	@Get()
	@ApiOperation({ summary: "Daftar merchant" })
	@ApiResponseWrapped({ status: 200, description: "List merchant", type: MerchantResponseDto, isArray: true })
	async findAll(@Query("search") search?: string) {
		return this.merchantAdminService.findAll(search)
	}

	@Get(":id")
	@ApiOperation({ summary: "Detail data merchant dan e-wallet" })
	@ApiResponseWrapped({ status: 200, description: "Detail merchant", type: MerchantResponseDto })
	async findOne(@Param("id", ParseIntPipe) id: number) {
		return this.merchantAdminService.findOne(id)
	}

	@Get(":id/transactions")
	@ApiOperation({ summary: "Riwayat transaksi merchant" })
	@ApiResponseWrapped({ status: 200, description: "List transaksi merchant", type: EwalletTransactionResponseDto, isArray: true })
	async getMerchantTransactions(@Param("id", ParseIntPipe) id: number) {
		return this.merchantAdminService.getMerchantTransactions(id)
	}

	@Post()
	@ApiOperation({ summary: "Tambah merchant baru (auto generate user & e-wallet)" })
	@ApiResponseWrapped({ status: 201, description: "Merchant berhasil dibuat", type: MerchantResponseDto })
	async create(@Body() dto: CreateMerchantDto) {
		return this.merchantAdminService.create(dto)
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update data merchant" })
	@ApiResponseWrapped({ status: 200, description: "Data merchant diupdate", type: MerchantResponseDto })
	async update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateMerchantDto) {
		return this.merchantAdminService.update(id, dto)
	}

	@Patch(":id/toggle-block")
	@ApiOperation({ summary: "Blokir atau aktifkan kembali merchant" })
	@ApiResponseWrapped({ status: 200, description: "Status blokir diupdate", type: AdminMessageResponseDto })
	async toggleBlock(@Param("id", ParseIntPipe) id: number, @Body() dto: ToggleBlockMerchantDto) {
		return this.merchantAdminService.toggleBlock(id, dto)
	}

	@Delete(":id")
	@ApiOperation({ summary: "Hapus merchant" })
	@ApiResponseWrapped({ status: 200, description: "Merchant dihapus", type: AdminMessageResponseDto })
	async remove(@Param("id", ParseIntPipe) id: number) {
		return this.merchantAdminService.remove(id)
	}
}
