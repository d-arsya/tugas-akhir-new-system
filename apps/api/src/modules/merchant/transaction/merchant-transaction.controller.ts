import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	UseGuards,
} from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import { CurrentUser } from "@core/auth/decorators/current-user.decorator"
import type { JwtPayload } from "@core/auth/strategies/jwt.strategy"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import { ActiveMerchantGuard } from "@merchant/guards/active-merchant.guard"
import { EwalletPinGuard } from "@merchant/guards/ewallet-pin.guard"
import { MerchantJwtAuthGuard } from "@merchant/guards/merchant-jwt-auth.guard"
import {
	CheckoutDataResponseDto,
	CreateTransactionResponseDto,
	QrPageDataResponseDto,
	StoreTransactionDto,
	UpdateTransactionItemDto,
	UpdateTransactionItemResponseDto,
	ValidateCheckoutPinDto,
	ValidatePinResponseDto,
	ValidateScanResponseDto,
} from "@merchant/dto/transaction"
import { MerchantTransactionService } from "@merchant/transaction/merchant-transaction.service"

@ApiTags("Merchant — Point-of-Sale Transactions")
@ApiBearerAuth()
@UseGuards(MerchantJwtAuthGuard, ActiveMerchantGuard, EwalletPinGuard)
@Controller("merchant/transactions")
export class MerchantTransactionController {
	constructor(private readonly merchantTransactionService: MerchantTransactionService) {}

	@Post()
	@ApiOperation({ summary: "Buat transaksi baru (item & harga)" })
	@ApiResponseWrapped({
		status: 200,
		description: "Transaksi berhasil dibuat",
		type: CreateTransactionResponseDto,
	})
	async createTransaction(
		@CurrentUser() user: JwtPayload,
		@Body() dto: StoreTransactionDto,
	) {
		return this.merchantTransactionService.createTransaction(user.sub, dto)
	}

	@Get(":id/scan-qr")
	@ApiOperation({ summary: "Halaman tampilkan QR Code transaksi merchant" })
	@ApiResponseWrapped({
		status: 200,
		description: "Data QR transaksi berhasil dimuat",
		type: QrPageDataResponseDto,
	})
	async getQrPageData(
		@CurrentUser() user: JwtPayload,
		@Param("id", ParseIntPipe) id: number,
	) {
		return this.merchantTransactionService.getQrPageData(id, user.sub)
	}

	@Post(":id/validate-scan")
	@ApiOperation({ summary: "Verifikasi hasil scan QR Code milik santri" })
	@ApiResponseWrapped({
		status: 200,
		description: "Scan QR berhasil",
		type: ValidateScanResponseDto,
	})
	async validateScan(
		@CurrentUser() user: JwtPayload,
		@Param("id", ParseIntPipe) id: number,
		@Body("scannedQrValue") scannedQrValue: string,
	) {
		return this.merchantTransactionService.validateScan(id, scannedQrValue, user.sub)
	}

	@Get(":id/checkout")
	@ApiOperation({ summary: "Halaman rincian checkout transaksi & konfirmasi" })
	@ApiResponseWrapped({
		status: 200,
		description: "Rincian checkout transaksi berhasil dimuat",
		type: CheckoutDataResponseDto,
	})
	async getCheckoutData(
		@CurrentUser() user: JwtPayload,
		@Param("id", ParseIntPipe) id: number,
	) {
		return this.merchantTransactionService.getCheckoutData(id, user.sub)
	}

	@Patch("items/:itemId")
	@ApiOperation({ summary: "Edit item transaksi saat di halaman checkout" })
	@ApiResponseWrapped({
		status: 200,
		description: "Item transaksi berhasil diperbarui",
		type: UpdateTransactionItemResponseDto,
	})
	async updateTransactionItem(
		@CurrentUser() user: JwtPayload,
		@Param("itemId", ParseIntPipe) itemId: number,
		@Body() dto: UpdateTransactionItemDto,
	) {
		return this.merchantTransactionService.updateTransactionItem(itemId, dto, user.sub)
	}

	@Post(":id/validate-pin")
	@ApiOperation({ summary: "Verifikasi PIN Santri & eksekusi pembayaran transaksi" })
	@ApiResponseWrapped({
		status: 200,
		description: "Hasil verifikasi PIN dan status transaksi",
		type: ValidatePinResponseDto,
	})
	async validatePin(
		@CurrentUser() user: JwtPayload,
		@Param("id", ParseIntPipe) id: number,
		@Body() dto: ValidateCheckoutPinDto,
	) {
		return this.merchantTransactionService.validatePin(id, dto, user.sub)
	}
}
