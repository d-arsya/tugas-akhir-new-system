import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import { Roles } from "../../../core/auth/decorators/roles.decorator"
import { JwtAuthGuard } from "../../../core/auth/guards/jwt-auth.guard"
import { RolesGuard } from "../../../core/auth/guards/roles.guard"
import { ApiResponseWrapped } from "../../../core/decorators/api-response-wrapped.decorator"
import { EwalletAdminService } from "../services/ewallet-admin.service"
import {
	TopUpEwalletDto,
	WithdrawEwalletDto,
	ResetPinDto,
	UpdateEwalletSettingDto,
	UpdateEwalletTxStatusDto,
	EwalletResponseDto,
} from "../dto/ewallet-admin.dto"
import { AdminMessageResponseDto } from "../dto/admin-response.dto"

@ApiTags("Admin — E-Wallet Admin")
@Controller("admin/ewallet")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin", "Kasir E-Wallet")
@ApiBearerAuth("JWT-Auth")
export class EwalletAdminController {
	constructor(private readonly ewalletAdminService: EwalletAdminService) {}

	@Get()
	@ApiOperation({ summary: "Daftar e-wallet santri" })
	@ApiResponseWrapped({ status: 200, description: "List e-wallet", type: EwalletResponseDto, isArray: true })
	async findAll(@Query("search") search?: string) {
		return this.ewalletAdminService.findAll(search)
	}

	@Get("widget")
	@ApiOperation({ summary: "Widget statistik total saldo dan status wallet" })
	@ApiResponseWrapped({ status: 200, description: "Statistik e-wallet" })
	async getWidgetStats() {
		return this.ewalletAdminService.getWidgetStats()
	}

	@Get("transactions")
	@ApiOperation({ summary: "Daftar semua transaksi e-wallet global" })
	@ApiResponseWrapped({ status: 200, description: "List transaksi e-wallet global", isArray: true })
	async getGlobalTransactions() {
		return this.ewalletAdminService.getGlobalTransactions()
	}

	@Get(":ewalletId")
	@ApiOperation({ summary: "Detail e-wallet" })
	@ApiResponseWrapped({ status: 200, description: "Detail e-wallet", type: EwalletResponseDto })
	async findOne(@Param("ewalletId", ParseIntPipe) ewalletId: number) {
		return this.ewalletAdminService.findOne(ewalletId)
	}

	@Get(":ewalletId/transactions")
	@ApiOperation({ summary: "Riwayat transaksi e-wallet santri" })
	@ApiResponseWrapped({ status: 200, description: "List transaksi santri", isArray: true })
	async getTransactions(@Param("ewalletId", ParseIntPipe) ewalletId: number) {
		return this.ewalletAdminService.getTransactions(ewalletId)
	}

	@Post(":ewalletId/top-up")
	@ApiOperation({ summary: "Top-up saldo e-wallet santri" })
	@ApiResponseWrapped({ status: 201, description: "Top-up berhasil" })
	async topUp(@Param("ewalletId", ParseIntPipe) ewalletId: number, @Body() dto: TopUpEwalletDto) {
		return this.ewalletAdminService.topUp(ewalletId, dto)
	}

	@Post(":ewalletId/withdraw")
	@ApiOperation({ summary: "Tarik saldo e-wallet santri" })
	@ApiResponseWrapped({ status: 201, description: "Withdraw berhasil" })
	async withdraw(@Param("ewalletId", ParseIntPipe) ewalletId: number, @Body() dto: WithdrawEwalletDto) {
		return this.ewalletAdminService.withdraw(ewalletId, dto)
	}

	@Post(":ewalletId/reset-pin")
	@ApiOperation({ summary: "Reset PIN e-wallet santri secara langsung" })
	@ApiResponseWrapped({ status: 200, description: "PIN direset", type: AdminMessageResponseDto })
	async resetPin(@Param("ewalletId", ParseIntPipe) ewalletId: number, @Body() dto: ResetPinDto) {
		return this.ewalletAdminService.resetPin(ewalletId, dto)
	}

	@Patch(":ewalletId/settings")
	@ApiOperation({ summary: "Update pengaturan e-wallet santri" })
	@ApiResponseWrapped({ status: 200, description: "Pengaturan diupdate", type: EwalletResponseDto })
	async updateSettings(@Param("ewalletId", ParseIntPipe) ewalletId: number, @Body() dto: UpdateEwalletSettingDto) {
		return this.ewalletAdminService.updateSettings(ewalletId, dto)
	}

	@Patch("transactions/:id")
	@ApiOperation({ summary: "Update status transaksi e-wallet (validasi / tolak)" })
	@ApiResponseWrapped({ status: 200, description: "Status transaksi diupdate" })
	async updateTransactionStatus(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateEwalletTxStatusDto) {
		return this.ewalletAdminService.updateTransactionStatus(id, dto)
	}
}
