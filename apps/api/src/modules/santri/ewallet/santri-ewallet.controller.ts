import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { CurrentUser } from "@core/auth/decorators/current-user.decorator"
import type { JwtPayload } from "@core/auth/strategies/jwt.strategy"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import {
	ConfirmTopUpDto,
	EwalletDashboardDto,
	EwalletInactiveDto,
	EwalletStatusDto,
	PaginationQueryDto,
	ResetPinDto,
	SantriCreateEwalletDto,
	SantriLoginPinDto,
	TopUpBankInfoResponseDto,
	TopUpBankTransferDto,
	TopUpCreatedResponseDto,
	TransactionDetailResponseDto,
	TransactionFilterDto,
	UpdatePinDto,
	ValidateCurrentPinDto,
} from "@modules/ewallet/dto"
import { SantriMessageResponseDto } from "@santri/dto/auth/auth-response.dto"
import { EwalletPinGuard } from "@santri/guards/ewallet-pin.guard"
import { NoEwalletGuard } from "@santri/guards/no-ewallet.guard"
import { SantriJwtAuthGuard } from "@santri/guards/santri-jwt-auth.guard"
import { SantriEwalletService } from "@santri/ewallet/santri-ewallet.service"

@ApiTags("Santri — E-Wallet Core & PIN Management")
@ApiBearerAuth()
@UseGuards(SantriJwtAuthGuard)
@Controller("santri/ewallet")
export class SantriEwalletController {
	constructor(private readonly santriEwalletService: SantriEwalletService) {}

	@Get("status")
	@ApiOperation({ summary: "Cek status ketersediaan dan keaktifan E-Wallet santri" })
	@ApiResponseWrapped({
		status: 200,
		description: "Status E-Wallet berhasil dimuat",
		type: EwalletStatusDto,
	})
	async getEwalletStatus(@CurrentUser() user: JwtPayload) {
		return this.santriEwalletService.getEwalletStatus(user.sub)
	}

	@Post("pin/login")
	@ApiOperation({ summary: "Verifikasi PIN E-Wallet untuk membuka sesi E-Wallet" })
	@ApiResponseWrapped({
		status: 200,
		description: "PIN E-Wallet benar dan sesi E-Wallet diaktifkan",
		type: SantriMessageResponseDto,
	})
	@ApiResponse({ status: 401, description: "PIN E-Wallet salah" })
	@ApiResponse({ status: 403, description: "E-Wallet tidak aktif" })
	async loginPin(
		@CurrentUser() user: JwtPayload,
		@Body() dto: SantriLoginPinDto,
	) {
		return this.santriEwalletService.loginPin(user.sub, dto)
	}

	@UseGuards(NoEwalletGuard)
	@Get("pin/create")
	@ApiOperation({ summary: "Halaman pendaftaran E-Wallet baru" })
	@ApiResponseWrapped({
		status: 200,
		description: "Santri berhak membuat E-Wallet baru",
		type: SantriMessageResponseDto,
	})
	@ApiResponse({ status: 403, description: "Santri sudah memiliki E-Wallet" })
	async showCreateForm() {
		return { message: "Silakan masukkan PIN 6 digit untuk membuat E-Wallet baru." }
	}

	@UseGuards(NoEwalletGuard)
	@Post("pin/create")
	@ApiOperation({ summary: "Buat E-Wallet baru untuk santri" })
	@ApiResponseWrapped({
		status: 200,
		description: "E-Wallet berhasil dibuat dan PIN diset",
		type: SantriMessageResponseDto,
	})
	@ApiResponse({ status: 403, description: "Santri sudah memiliki E-Wallet" })
	async createEwallet(
		@CurrentUser() user: JwtPayload,
		@Body() dto: SantriCreateEwalletDto,
	) {
		return this.santriEwalletService.createEwallet(user.sub, dto)
	}

	@Get("inactive")
	@ApiOperation({ summary: "Informasi status E-Wallet tidak aktif" })
	@ApiResponseWrapped({
		status: 200,
		description: "Informasi E-Wallet tidak aktif berhasil dimuat",
		type: EwalletInactiveDto,
	})
	async showInactivePage(@CurrentUser() user: JwtPayload) {
		return this.santriEwalletService.showInactivePage(user.sub)
	}

	@UseGuards(EwalletPinGuard)
	@Get()
	@ApiOperation({ summary: "Dashboard E-Wallet santri (Saldo & Riwayat Transaksi Terpaginasi)" })
	@ApiResponseWrapped({
		status: 200,
		description: "Dashboard E-Wallet berhasil dimuat",
		type: EwalletDashboardDto,
	})
	@ApiResponse({ status: 403, description: "Verifikasi PIN E-Wallet diperlukan" })
	async getDashboard(
		@CurrentUser() user: JwtPayload,
		@Query() query: TransactionFilterDto,
	) {
		return this.santriEwalletService.getDashboard(user.sub, query)
	}

	// ---------------- PIN Management Endpoints ----------------

	@UseGuards(EwalletPinGuard)
	@Get("pin/edit")
	@ApiOperation({ summary: "Data halaman ubah PIN E-Wallet" })
	@ApiResponseWrapped({
		status: 200,
		description: "Siap mengubah PIN",
		type: SantriMessageResponseDto,
	})
	async getEditPinPage() {
		return { message: "Masukkan PIN lama dan PIN baru." }
	}

	@UseGuards(EwalletPinGuard)
	@Post("pin/validate-current")
	@ApiOperation({ summary: "Validasi PIN lama via AJAX sebelum memasukkan PIN baru" })
	@ApiResponseWrapped({
		status: 200,
		description: "PIN lama benar",
		type: SantriMessageResponseDto,
	})
	@ApiResponse({ status: 401, description: "PIN lama salah" })
	async validateCurrentPin(
		@CurrentUser() user: JwtPayload,
		@Body() dto: ValidateCurrentPinDto,
	) {
		return this.santriEwalletService.validateCurrentPin(user.sub, dto)
	}

	@UseGuards(EwalletPinGuard)
	@Patch("pin")
	@ApiOperation({ summary: "Simpan PIN E-Wallet baru" })
	@ApiResponseWrapped({
		status: 200,
		description: "PIN E-Wallet berhasil diubah",
		type: SantriMessageResponseDto,
	})
	async updatePin(
		@CurrentUser() user: JwtPayload,
		@Body() dto: UpdatePinDto,
	) {
		return this.santriEwalletService.updatePin(user.sub, dto)
	}

	@Post("pin/reset-email")
	@ApiOperation({ summary: "Kirim email instruksi reset PIN E-Wallet" })
	@ApiResponseWrapped({
		status: 200,
		description: "Email instruksi reset PIN terkirim",
		type: SantriMessageResponseDto,
	})
	async sendPinResetEmail(@CurrentUser() user: JwtPayload) {
		return this.santriEwalletService.sendPinResetEmail(user.sub)
	}

	@Get("pin/reset/:token")
	@ApiOperation({ summary: "Validasi token reset PIN dari email" })
	@ApiResponseWrapped({
		status: 200,
		description: "Token reset PIN valid",
		type: SantriMessageResponseDto,
	})
	@ApiResponse({ status: 400, description: "Token tidak valid atau kadaluarsa" })
	async validatePinResetToken(
		@CurrentUser() user: JwtPayload,
		@Param("token") token: string,
	) {
		return this.santriEwalletService.validatePinResetToken(user.sub, token)
	}

	@Patch("pin/reset")
	@ApiOperation({ summary: "Submit PIN baru menggunakan token reset PIN" })
	@ApiResponseWrapped({
		status: 200,
		description: "PIN E-Wallet berhasil direset",
		type: SantriMessageResponseDto,
	})
	@ApiResponse({ status: 400, description: "Token tidak valid atau konfirmasi PIN tidak cocok" })
	async resetPin(
		@CurrentUser() user: JwtPayload,
		@Body() dto: ResetPinDto,
	) {
		return this.santriEwalletService.resetPin(user.sub, dto)
	}
}
