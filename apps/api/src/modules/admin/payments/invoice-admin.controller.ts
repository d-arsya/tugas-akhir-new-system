import { Body, Controller, Get, Param, ParseIntPipe, Patch, Query, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import type {
	InvoiceBillDetail,
	InvoiceBillRow,
	InvoiceDetailPage,
	InvoiceTransactionRow,
	ServerTableResult,
	StudentInvoiceListRow,
} from "@roja/types"

import { Roles } from "@core/auth/decorators/roles.decorator"
import { JwtAuthGuard } from "@core/auth/guards/jwt-auth.guard"
import { RolesGuard } from "@core/auth/guards/roles.guard"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import { AdminMessageResponseDto } from "@admin/dto/admin-response.dto"
import {
	InvoiceBillDetailDto,
	InvoiceBillQueryDto,
	InvoiceBillRowDto,
	InvoiceDetailPageDto,
	InvoiceTransactionRowDto,
	StudentInvoiceListQueryDto,
	StudentInvoiceListRowDto,
	UpdateInvoiceNoteDto,
} from "@admin/dto/invoice-admin.dto"
import { InvoiceAdminService } from "@admin/payments/invoice-admin.service"

// Legacy `StudentInvoiceController` (read half). Legacy gated this whole menu with the
// `asBendahara` middleware — superadmin or bendahara only, narrower than Data Master.
@ApiTags("Admin — Tagihan Santri")
@ApiBearerAuth("JWT-Auth")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin", "Bendahara")
@Controller("admin/student-invoices")
export class InvoiceAdminController {
	constructor(private readonly invoiceAdminService: InvoiceAdminService) {}

	@Get()
	@ApiOperation({ summary: "Daftar santri beserta jumlah tagihan (server-side)" })
	@ApiResponseWrapped({ status: 200, description: "Daftar santri", type: StudentInvoiceListRowDto, isArray: true })
	async findStudents(@Query() query: StudentInvoiceListQueryDto): Promise<ServerTableResult<StudentInvoiceListRow>> {
		return this.invoiceAdminService.findStudents(query)
	}

	// Declared before ":studentGradeId" so the literal segment wins
	@Get("bills/:invoiceId")
	@ApiOperation({ summary: "Detail satu tagihan" })
	@ApiResponseWrapped({ status: 200, description: "Detail tagihan", type: InvoiceBillDetailDto })
	@ApiResponse({ status: 404, description: "Tagihan tidak ditemukan" })
	async findBill(@Param("invoiceId", ParseIntPipe) invoiceId: number): Promise<InvoiceBillDetail> {
		return this.invoiceAdminService.findBill(invoiceId)
	}

	@Patch("bills/:invoiceId/note")
	@ApiOperation({ summary: "Simpan catatan tagihan" })
	@ApiResponseWrapped({ status: 200, description: "Data berhasil diupdate.", type: AdminMessageResponseDto })
	@ApiResponse({ status: 404, description: "Tagihan tidak ditemukan" })
	async updateBillNote(
		@Param("invoiceId", ParseIntPipe) invoiceId: number,
		@Body() body: UpdateInvoiceNoteDto,
	): Promise<{ message: string }> {
		return this.invoiceAdminService.updateBillNote(invoiceId, body)
	}

	@Get(":studentGradeId")
	@ApiOperation({ summary: "Halaman detail pembayaran satu santri" })
	@ApiResponseWrapped({ status: 200, description: "Detail pembayaran santri", type: InvoiceDetailPageDto })
	@ApiResponse({ status: 404, description: "Santri tidak ditemukan" })
	async findStudentDetail(@Param("studentGradeId", ParseIntPipe) studentGradeId: number): Promise<InvoiceDetailPage> {
		return this.invoiceAdminService.findStudentDetail(studentGradeId)
	}

	@Get(":studentGradeId/bills")
	@ApiOperation({ summary: "Tab Tagihan (server-side)" })
	@ApiResponseWrapped({ status: 200, description: "Daftar tagihan", type: InvoiceBillRowDto, isArray: true })
	async findBills(
		@Param("studentGradeId", ParseIntPipe) studentGradeId: number,
		@Query() query: InvoiceBillQueryDto,
	): Promise<ServerTableResult<InvoiceBillRow>> {
		return this.invoiceAdminService.findBills(studentGradeId, query)
	}

	@Get(":studentGradeId/payments")
	@ApiOperation({ summary: "Tab Riwayat Pembayaran" })
	@ApiResponseWrapped({ status: 200, description: "Riwayat pembayaran", type: InvoiceTransactionRowDto, isArray: true })
	async findPayments(@Param("studentGradeId", ParseIntPipe) studentGradeId: number): Promise<InvoiceTransactionRow[]> {
		return this.invoiceAdminService.findPayments(studentGradeId)
	}

	@Get(":studentGradeId/cancelled")
	@ApiOperation({ summary: "Tab Dibatalkan" })
	@ApiResponseWrapped({ status: 200, description: "Transaksi dibatalkan", type: InvoiceTransactionRowDto, isArray: true })
	async findCancelled(@Param("studentGradeId", ParseIntPipe) studentGradeId: number): Promise<InvoiceTransactionRow[]> {
		return this.invoiceAdminService.findCancelled(studentGradeId)
	}
}
