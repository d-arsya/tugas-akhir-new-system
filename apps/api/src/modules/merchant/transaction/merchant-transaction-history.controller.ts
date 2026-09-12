import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import { CurrentUser } from "@core/auth/decorators/current-user.decorator"
import type { JwtPayload } from "@core/auth/strategies/jwt.strategy"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import { TransactionDetailResponseDto, TransactionFilterDto } from "@modules/ewallet/dto"
import { MerchantTransactionListItemDto } from "@merchant/dto/transaction"
import { ActiveMerchantGuard } from "@merchant/guards/active-merchant.guard"
import { EwalletPinGuard } from "@merchant/guards/ewallet-pin.guard"
import { MerchantJwtAuthGuard } from "@merchant/guards/merchant-jwt-auth.guard"
import { MerchantTransactionHistoryService } from "@merchant/transaction/merchant-transaction-history.service"

@ApiTags("Merchant — Transaction History")
@ApiBearerAuth()
@UseGuards(MerchantJwtAuthGuard, ActiveMerchantGuard, EwalletPinGuard)
@Controller()
export class MerchantTransactionHistoryController {
	constructor(
		private readonly merchantTransactionHistoryService: MerchantTransactionHistoryService,
	) {}

	@Get("merchant/transactions")
	@ApiOperation({ summary: "Riwayat semua transaksi merchant (Menunggu, Berhasil, Dibatalkan)" })
	@ApiResponseWrapped({
		status: 200,
		description: "Daftar transaksi merchant berhasil dimuat",
		type: MerchantTransactionListItemDto,
		isArray: true,
	})
	async getTransactionList(
		@CurrentUser() user: JwtPayload,
		@Query() filters: TransactionFilterDto,
	) {
		return this.merchantTransactionHistoryService.getTransactionList(user.sub, filters)
	}

	@Get("merchant/transactions/:id")
	@ApiOperation({ summary: "Detail transaksi merchant" })
	@ApiResponseWrapped({
		status: 200,
		description: "Detail transaksi merchant berhasil dimuat",
		type: TransactionDetailResponseDto,
	})
	async getTransactionDetail(
		@CurrentUser() user: JwtPayload,
		@Param("id", ParseIntPipe) id: number,
	) {
		return this.merchantTransactionHistoryService.getTransactionDetail(id, user.sub)
	}

	@Get("merchant/transaction-history")
	@ApiOperation({ summary: "Riwayat penjualan merchant (hanya status valid/berhasil)" })
	@ApiResponseWrapped({
		status: 200,
		description: "Daftar riwayat penjualan merchant berhasil dimuat",
		type: MerchantTransactionListItemDto,
		isArray: true,
	})
	async getPurchaseHistory(
		@CurrentUser() user: JwtPayload,
		@Query() filters: TransactionFilterDto,
	) {
		return this.merchantTransactionHistoryService.getPurchaseHistory(user.sub, filters)
	}

	@Get("merchant/transaction-history/:id")
	@ApiOperation({ summary: "Detail riwayat penjualan merchant" })
	@ApiResponseWrapped({
		status: 200,
		description: "Detail riwayat penjualan merchant berhasil dimuat",
		type: TransactionDetailResponseDto,
	})
	async getPurchaseHistoryDetail(
		@CurrentUser() user: JwtPayload,
		@Param("id", ParseIntPipe) id: number,
	) {
		return this.merchantTransactionHistoryService.getPurchaseHistoryDetail(id, user.sub)
	}
}
