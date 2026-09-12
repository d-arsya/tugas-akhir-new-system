import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Query,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger"
import { CurrentUser } from "@core/auth/decorators/current-user.decorator"
import type { JwtPayload } from "@core/auth/strategies/jwt.strategy"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import {
	ConfirmTopUpDto,
	CreateEwalletDto,
	LoginPinDto,
	TopUpBankTransferDto,
	TopUpCreatedResponseDto,
	TransactionDetailResponseDto,
	TransactionFilterDto,
} from "@modules/ewallet/dto"
import { MerchantMessageResponseDto } from "@merchant/dto/auth"
import {
	MerchantBankInfoResponseDto,
	MerchantCashInfoResponseDto,
	MerchantEwalletDashboardDto,
	MerchantEwalletInactiveDto,
	MerchantEwalletStatusDto,
	MerchantWithdrawInfoResponseDto,
} from "@merchant/dto/ewallet"
import { ActiveMerchantGuard } from "@merchant/guards/active-merchant.guard"
import { EwalletPinGuard } from "@merchant/guards/ewallet-pin.guard"
import { MerchantJwtAuthGuard } from "@merchant/guards/merchant-jwt-auth.guard"
import { NoEwalletGuard } from "@merchant/guards/no-ewallet.guard"
import { MerchantEwalletService } from "@merchant/ewallet/merchant-ewallet.service"

@ApiTags("Merchant — E-Wallet Core & Dashboard")
@ApiBearerAuth()
@UseGuards(MerchantJwtAuthGuard, ActiveMerchantGuard)
@Controller("merchant/ewallet")
export class MerchantEwalletController {
	constructor(private readonly merchantEwalletService: MerchantEwalletService) {}

	@Get("status")
	@ApiOperation({ summary: "Cek status ketersediaan dan keaktifan E-Wallet merchant" })
	@ApiResponseWrapped({
		status: 200,
		description: "Status E-Wallet berhasil dimuat",
		type: MerchantEwalletStatusDto,
	})
	async getEwalletStatus(@CurrentUser() user: JwtPayload) {
		return this.merchantEwalletService.getEwalletStatus(user.sub)
	}

	@Post("pin/login")
	@ApiOperation({ summary: "Verifikasi PIN E-Wallet untuk membuka sesi E-Wallet" })
	@ApiResponseWrapped({
		status: 200,
		description: "PIN E-Wallet benar dan sesi E-Wallet diaktifkan",
		type: MerchantMessageResponseDto,
	})
	async loginPin(
		@CurrentUser() user: JwtPayload,
		@Body() dto: LoginPinDto,
	) {
		return this.merchantEwalletService.loginPin(user.sub, dto)
	}

	@UseGuards(NoEwalletGuard)
	@Get("pin/create")
	@ApiOperation({ summary: "Tampilkan halaman registrasi PIN E-Wallet merchant" })
	@ApiResponseWrapped({
		status: 200,
		description: "Instruksi pendaftaran PIN E-Wallet",
		type: MerchantMessageResponseDto,
	})
	async showCreatePage() {
		return { message: "Silakan masukkan 6-digit PIN E-Wallet baru." }
	}

	@UseGuards(NoEwalletGuard)
	@Post("pin/create")
	@ApiOperation({ summary: "Buat E-Wallet merchant baru" })
	@ApiResponseWrapped({
		status: 200,
		description: "E-Wallet merchant berhasil dibuat",
		type: MerchantMessageResponseDto,
	})
	async createEwallet(
		@CurrentUser() user: JwtPayload,
		@Body() dto: CreateEwalletDto,
	) {
		return this.merchantEwalletService.createEwallet(user.sub, dto)
	}

	@Get("inactive")
	@ApiOperation({ summary: "Informasi status E-Wallet tidak aktif" })
	@ApiResponseWrapped({
		status: 200,
		description: "Status E-Wallet tidak aktif",
		type: MerchantEwalletInactiveDto,
	})
	async showInactivePage(@CurrentUser() user: JwtPayload) {
		return this.merchantEwalletService.showInactivePage(user.sub)
	}

	@UseGuards(EwalletPinGuard)
	@Get()
	@ApiOperation({ summary: "Dashboard E-Wallet merchant (Saldo & Riwayat Transaksi)" })
	@ApiResponseWrapped({
		status: 200,
		description: "Dashboard E-Wallet berhasil dimuat",
		type: MerchantEwalletDashboardDto,
	})
	async getDashboard(
		@CurrentUser() user: JwtPayload,
		@Query() filters: TransactionFilterDto,
	) {
		return this.merchantEwalletService.getDashboard(user.sub, filters)
	}

	@UseGuards(EwalletPinGuard)
	@Get("top-up/bank-transfer")
	@ApiOperation({ summary: "Informasi rekening bank untuk top-up" })
	@ApiResponseWrapped({
		status: 200,
		description: "Informasi rekening bank transfer",
		type: MerchantBankInfoResponseDto,
	})
	async getTopUpBankInfo() {
		return {
			bankName: "BSI (Bank Syariah Indonesia)",
			accountNumber: "7192852646",
			accountName: "Tabungan Pondok ROJA",
			minAmount: 1000,
		}
	}

	@UseGuards(EwalletPinGuard)
	@Post("top-up/bank-transfer")
	@ApiOperation({ summary: "Buat permintaan top-up bank transfer" })
	@ApiResponseWrapped({
		status: 200,
		description: "Transaksi isi saldo berhasil dibuat",
		type: TopUpCreatedResponseDto,
	})
	async storeTopUpBankTransfer(
		@CurrentUser() user: JwtPayload,
		@Body() dto: TopUpBankTransferDto,
	) {
		return this.merchantEwalletService.storeTopUpBankTransfer(user.sub, dto)
	}

	@UseGuards(EwalletPinGuard)
	@Get("top-up/confirm/:id")
	@ApiOperation({ summary: "Form konfirmasi bukti transfer" })
	@ApiResponseWrapped({
		status: 200,
		description: "Rincian konfirmasi top-up",
		type: TransactionDetailResponseDto,
	})
	async getConfirmForm(
		@CurrentUser() user: JwtPayload,
		@Param("id", ParseIntPipe) id: number,
	) {
		return this.merchantEwalletService.getConfirmForm(user.sub, id)
	}

	@UseGuards(EwalletPinGuard)
	@Patch("top-up/confirm/:id")
	@UseInterceptors(FileInterceptor("paymentAttachment"))
	@ApiConsumes("multipart/form-data")
	@ApiOperation({ summary: "Unggah bukti pembayaran top-up bank transfer" })
	@ApiResponseWrapped({
		status: 200,
		description: "Bukti pembayaran berhasil diunggah",
		type: MerchantMessageResponseDto,
	})
	async confirmTopUpProof(
		@CurrentUser() user: JwtPayload,
		@Param("id", ParseIntPipe) id: number,
		@Body() dto: ConfirmTopUpDto,
		@UploadedFile() file?: Express.Multer.File,
	) {
		return this.merchantEwalletService.confirmTopUpProof(user.sub, id, dto, file)
	}

	@UseGuards(EwalletPinGuard)
	@Get("top-up/cash")
	@ApiOperation({ summary: "Informasi isi saldo tunai" })
	@ApiResponseWrapped({
		status: 200,
		description: "Informasi isi saldo tunai",
		type: MerchantCashInfoResponseDto,
	})
	async getCashInfo() {
		return this.merchantEwalletService.getCashInfo()
	}

	@UseGuards(EwalletPinGuard)
	@Get("withdraw")
	@ApiOperation({ summary: "Informasi penarikan saldo" })
	@ApiResponseWrapped({
		status: 200,
		description: "Informasi penarikan saldo",
		type: MerchantWithdrawInfoResponseDto,
	})
	async getWithdrawInfo() {
		return this.merchantEwalletService.getWithdrawInfo()
	}
}
