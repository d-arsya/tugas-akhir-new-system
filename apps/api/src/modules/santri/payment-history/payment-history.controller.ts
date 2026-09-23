import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import { CurrentUser } from "@core/auth/decorators/current-user.decorator"
import type { JwtPayload } from "@core/auth/strategies/jwt.strategy"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import { PaginationQueryDto } from "@core/dto/pagination-query.dto"
import {
	PaymentHistoryInvoiceDetailDto,
	PaymentHistoryInvoiceDto,
	PaymentHistorySummaryDto,
} from "@santri/dto/payment-history/payment-history-response.dto"
import { PaymentHistoryFilterDto } from "@santri/payment-history/dto/payment-history-filter.dto"
import { ActiveStudentGuard } from "@santri/guards/active-student.guard"
import { SantriJwtAuthGuard } from "@santri/guards/santri-jwt-auth.guard"
import { PaymentHistoryService } from "@santri/payment-history/payment-history.service"

@ApiTags("Santri — Payment History (SPP)")
@ApiBearerAuth()
@UseGuards(SantriJwtAuthGuard, ActiveStudentGuard)
@Controller("santri/payment-history")
export class PaymentHistoryController {
	constructor(private readonly paymentHistoryService: PaymentHistoryService) { }

	@Get()
	@ApiOperation({ summary: "Ringkasan tagihan & pembayaran SPP santri" })
	@ApiResponseWrapped({
		status: 200,
		description: "Ringkasan tagihan & riwayat pembayaran SPP berhasil dimuat",
		type: PaymentHistorySummaryDto,
	})
	async getSummary(
		@CurrentUser() user: JwtPayload,
		@Query() query: PaymentHistoryFilterDto,
	) {
		return this.paymentHistoryService.getSummary(user.sub, query.page, query.limit, query.status, query.search)
	}

	@Get(":studentId/list")
	@ApiOperation({ summary: "Daftar tagihan SPP santri" })
	@ApiResponseWrapped({
		status: 200,
		description: "Daftar tagihan SPP santri berhasil dimuat",
		type: PaymentHistoryInvoiceDto,
		isArray: true,
	})
	async getInvoiceList(
		@CurrentUser() user: JwtPayload,
		@Param("studentId", ParseIntPipe) _studentId: number,
		@Query() query: PaginationQueryDto,
	) {
		// The path id is ignored on purpose: it used to be passed straight through, so any
		// authenticated santri could read another's invoices by editing the URL. The sibling
		// `getInvoiceDetail` already scopes to `user.sub`; this now matches it.
		return this.paymentHistoryService.getInvoiceList(user.sub, query.page, query.limit)
	}

	@Get("invoice/:invoiceId")
	@ApiOperation({ summary: "Rincian tagihan & riwayat transaksi pembayaran SPP" })
	@ApiResponseWrapped({
		status: 200,
		description: "Rincian tagihan & riwayat transaksi pembayaran SPP berhasil dimuat",
		type: PaymentHistoryInvoiceDetailDto,
	})
	async getInvoiceDetail(
		@CurrentUser() user: JwtPayload,
		@Param("invoiceId", ParseIntPipe) invoiceId: number,
		@Query() query: PaginationQueryDto,
	) {
		return this.paymentHistoryService.getInvoiceDetail(invoiceId, user.sub, query.page, query.limit)
	}
}

