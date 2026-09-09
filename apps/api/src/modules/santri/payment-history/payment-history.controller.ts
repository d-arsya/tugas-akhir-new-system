import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import { CurrentUser } from "@core/auth/decorators/current-user.decorator"
import type { JwtPayload } from "@core/auth/strategies/jwt.strategy"
import { PaginationQueryDto } from "@core/dto/pagination-query.dto"
import { ActiveStudentGuard } from "@santri/guards/active-student.guard"
import { SantriJwtAuthGuard } from "@santri/guards/santri-jwt-auth.guard"
import { PaymentHistoryService } from "@santri/payment-history/payment-history.service"
import { PaymentHistoryFilterDto } from "@santri/payment-history/dto/payment-history-filter.dto"

@ApiTags("Santri — Payment History (SPP)")
@ApiBearerAuth()
@UseGuards(SantriJwtAuthGuard, ActiveStudentGuard)
@Controller("santri/payment-history")
export class PaymentHistoryController {
	constructor(private readonly paymentHistoryService: PaymentHistoryService) { }

	@Get()
	@ApiOperation({ summary: "Ringkasan tagihan & pembayaran SPP santri" })
	async getSummary(
		@CurrentUser() user: JwtPayload,
		@Query() query: PaymentHistoryFilterDto,
	) {
		return this.paymentHistoryService.getSummary(user.sub, query.page, query.limit, query.status, query.search)
	}

	@Get(":studentId/list")
	@ApiOperation({ summary: "Daftar tagihan SPP santri" })
	async getInvoiceList(
		@CurrentUser() user: JwtPayload,
		@Param("studentId", ParseIntPipe) studentId: number,
		@Query() query: PaginationQueryDto,
	) {
		return this.paymentHistoryService.getInvoiceList(studentId, query.page, query.limit)
	}

	@Get("invoice/:invoiceId")
	@ApiOperation({ summary: "Rincian tagihan & riwayat transaksi pembayaran SPP" })
	async getInvoiceDetail(
		@CurrentUser() user: JwtPayload,
		@Param("invoiceId", ParseIntPipe) invoiceId: number,
		@Query() query: PaginationQueryDto,
	) {
		return this.paymentHistoryService.getInvoiceDetail(invoiceId, user.sub, query.page, query.limit)
	}
}
