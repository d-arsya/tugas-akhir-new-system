import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Res, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import type { Response } from "express"
import type { CreateTransactionResult, InvoiceSelectionResult } from "@roja/types"

import { Roles } from "@core/auth/decorators/roles.decorator"
import { JwtAuthGuard } from "@core/auth/guards/jwt-auth.guard"
import { RolesGuard } from "@core/auth/guards/roles.guard"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import { AdminMessageResponseDto } from "@admin/common/admin-response.dto"
import {
	CancelTransactionDto,
	CreateTransactionDto,
	CreateTransactionResultDto,
	InvoiceSelectionDto,
	InvoiceSelectionResultDto,
	UpdateTransactionNoteDto,
} from "@admin/payments/dto/payment-admin.dto"
import { PaymentAdminService } from "@admin/payments/payment-admin.service"

// Legacy `StudentInvoiceController` (write half). Shares the `admin/student-invoices`
// base path with InvoiceAdminController so the two workstreams never open one file;
// every route here is either a different verb or a longer path, so nothing shadows.
//
// `routes/web.php:353-355` wraps the whole menu in `asBendahara`, which aborts 403 for anyone
// who is neither Superadmin nor Bendahara — narrower than the Data Master menu next door.
@ApiTags("Admin — Pembayaran")
@ApiBearerAuth("JWT-Auth")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin", "Bendahara")
@Controller("admin/student-invoices")
export class PaymentAdminController {
	constructor(private readonly paymentAdminService: PaymentAdminService) {}

	/**
	 * `@getDataInvoice` + `@createTransaction`. A POST because the selection is the body: legacy
	 * kept it in a session key shared across every open tab, which is fix F-5.
	 */
	@Post("prepare-transaction")
	@HttpCode(200)
	@ApiOperation({ summary: "Validasi pilihan tagihan sebelum membuat pembayaran" })
	@ApiResponseWrapped({ status: 200, description: "Tagihan terpilih", type: InvoiceSelectionResultDto })
	async prepare(@Body() dto: InvoiceSelectionDto): Promise<InvoiceSelectionResult> {
		return this.paymentAdminService.prepare(dto)
	}

	@Post("transactions")
	@HttpCode(200)
	@ApiOperation({ summary: "Catat pembayaran" })
	@ApiResponseWrapped({ status: 200, description: "Pembayaran tercatat", type: CreateTransactionResultDto })
	async create(@Body() dto: CreateTransactionDto): Promise<CreateTransactionResult> {
		return this.paymentAdminService.create(dto)
	}

	@Patch("transactions/:transactionId/cancel")
	@ApiOperation({ summary: "Batalkan pembayaran" })
	@ApiResponseWrapped({ status: 200, description: "Pembayaran dibatalkan", type: AdminMessageResponseDto })
	async cancel(
		@Param("transactionId", ParseIntPipe) transactionId: number,
		@Body() dto: CancelTransactionDto,
	): Promise<{ message: string }> {
		return this.paymentAdminService.cancel(transactionId, dto.cancelNote)
	}

	@Patch("transactions/:transactionId/note")
	@ApiOperation({ summary: "Simpan catatan pembayaran" })
	@ApiResponseWrapped({ status: 200, description: "Catatan tersimpan", type: AdminMessageResponseDto })
	async updateNote(
		@Param("transactionId", ParseIntPipe) transactionId: number,
		@Body() dto: UpdateTransactionNoteDto,
	): Promise<{ message: string }> {
		return this.paymentAdminService.updateNote(transactionId, dto)
	}

	/**
	 * `@downloadTransaction`. Served with `@Res()`, so the wrapping response interceptor is
	 * bypassed and the PDF reaches the browser as a file.
	 *
	 * The filename is legacy's `"Kuitansi - {$studentGrade->fullname}.pdf"`, already stripped of the
	 * characters that would break this header (`payment-receipt-pdf.ts`). What is left can still
	 * hold non-ASCII, which RFC 6266's quoted form cannot carry, so that form is reduced to a
	 * fallback for old clients and `filename*` carries the real name.
	 */
	@Get("transactions/:transactionId/receipt")
	@ApiOperation({ summary: "Unduh kuitansi pembayaran" })
	async receipt(
		@Param("transactionId", ParseIntPipe) transactionId: number,
		@Res() res: Response,
	): Promise<void> {
		const { body, fileName, contentType } = await this.paymentAdminService.receipt(transactionId)
		res.setHeader("Content-Type", contentType)
		res.setHeader("Content-Length", body.length)
		res.setHeader(
			"Content-Disposition",
			`attachment; filename="${fileName.replace(/[^ -~]/g, "_")}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
		)
		res.end(body)
	}

	/**
	 * `@printTransaction` (750-770) — `resources/views/print/transaction.blade.php`, opened with
	 * `target="_blank"` and printing itself on load.
	 *
	 * Rendered inline rather than as an attachment, which is what makes the new tab show the page
	 * instead of saving it. The link carries no Authorization header, so this route is reached with
	 * the `access_token` cookie the JWT strategy also accepts.
	 */
	@Get("transactions/:transactionId/print")
	@ApiOperation({ summary: "Cetak kuitansi pembayaran" })
	async print(
		@Param("transactionId", ParseIntPipe) transactionId: number,
		@Res() res: Response,
	): Promise<void> {
		const { body, contentType } = await this.paymentAdminService.print(transactionId)
		res.setHeader("Content-Type", contentType)
		res.send(body)
	}
}
