import { Body, Controller, Get, Param, Patch, Query, Res, UseGuards } from "@nestjs/common"
import { EwalletIdPipe } from "@shared/ewallet/ewallet-id.pipe"
import { ApiBearerAuth, ApiOperation, ApiProduces, ApiResponse, ApiTags } from "@nestjs/swagger"
import type { Response } from "express"
import type {
	AdminMessageResult,
	EwalletHistoryDetail,
	EwalletHistoryRow,
	EwalletTransactionDetail,
	ServerTableResult,
} from "@roja/types"

import { Roles } from "@core/auth/decorators/roles.decorator"
import { JwtAuthGuard } from "@core/auth/guards/jwt-auth.guard"
import { RolesGuard } from "@core/auth/guards/roles.guard"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import { AdminMessageResponseDto } from "@admin/dto/admin-response.dto"
import {
	EwalletHistoryDetailDto,
	EwalletHistoryExportDto,
	EwalletHistoryQueryDto,
	EwalletHistoryRowDto,
	EwalletTransactionDetailDto,
	EwalletTransactionUpdateDto,
} from "@admin/dto/ewallet-txn.dto"
import { EwalletTxnService } from "@admin/ewallet/txn-admin.service"

const XLSX_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

// Legacy `EwalletController` / `EwalletTransactionHistoryController`: transaction detail, status update and Riwayat Transaksi (workstream D-C).
// Legacy gated every route with `can:do-as-cashier` — Superadmin or Kasir E-Wallet; Admin and
// Bendahara get 403.
//
// **Route order matters.** Every wallet route lives under `accounts/:id` and every transaction
// route under `transactions/:id`, so the literal routes (`summary`, `badge`, `export`, `qr-all`,
// `history`, `history-export`) cannot be read as an id. Keep it that way when adding a route.
@ApiTags("Admin — Dompet (Transaksi)")
@ApiBearerAuth("JWT-Auth")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin", "Kasir E-Wallet")
@Controller("admin/ewallet")
export class EwalletTxnController {
	constructor(private readonly ewalletTxnService: EwalletTxnService) {}

	@Get("transactions/:id")
	@ApiOperation({ summary: "Detail transaksi tunai / transfer bank" })
	@ApiResponseWrapped({ status: 200, description: "Detail transaksi", type: EwalletTransactionDetailDto })
	@ApiResponse({ status: 404, description: "Data transaksi tidak ditemukan." })
	async findOne(@Param("id", EwalletIdPipe) id: number): Promise<EwalletTransactionDetail> {
		return this.ewalletTxnService.findOne(id)
	}

	@Patch("transactions/:id")
	@ApiOperation({ summary: "Ubah status transaksi dan segarkan saldo semua dompet yang terdampak" })
	@ApiResponseWrapped({ status: 200, description: "Status transaksi berhasil diubah", type: AdminMessageResponseDto })
	@ApiResponse({ status: 422, description: "Transaksi tunai yang sudah berhasil tidak dapat diubah" })
	async update(@Param("id", EwalletIdPipe) id: number, @Body() dto: EwalletTransactionUpdateDto): Promise<AdminMessageResult> {
		return this.ewalletTxnService.update(id, dto)
	}

	@Get("history")
	@ApiOperation({ summary: "Riwayat transaksi e-wallet (server-side)" })
	@ApiResponseWrapped({ status: 200, description: "Riwayat transaksi", type: EwalletHistoryRowDto, isPaginated: true })
	async findHistory(@Query() query: EwalletHistoryQueryDto): Promise<ServerTableResult<EwalletHistoryRow>> {
		return this.ewalletTxnService.findHistory(query)
	}

	// Streams the workbook directly, bypassing the JSON TransformInterceptor. Literal route, declared
	// before `history/:id`.
	@Get("history-export")
	@ApiOperation({ summary: "Export riwayat transaksi (xlsx)" })
	@ApiProduces(XLSX_TYPE)
	async exportHistory(@Query() query: EwalletHistoryExportDto, @Res() res: Response): Promise<void> {
		const file = await this.ewalletTxnService.exportHistory(query)
		res.setHeader("Content-Type", XLSX_TYPE)
		res.setHeader(
			"Content-Disposition",
			`attachment; filename="${file.fileName}"; filename*=UTF-8''${encodeURIComponent(file.fileName)}`,
		)
		res.send(file.buffer)
	}

	@Get("history/:id")
	@ApiOperation({ summary: "Detail transaksi jual beli" })
	@ApiResponseWrapped({ status: 200, description: "Detail transaksi", type: EwalletHistoryDetailDto })
	@ApiResponse({ status: 404, description: "Data transaksi tidak ditemukan." })
	async findHistoryDetail(@Param("id", EwalletIdPipe) id: number): Promise<EwalletHistoryDetail> {
		return this.ewalletTxnService.findHistoryDetail(id)
	}
}
