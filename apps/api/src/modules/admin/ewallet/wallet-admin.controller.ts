import { Body, Controller, Get, Param, Patch, Query, Res, UseGuards } from "@nestjs/common"
import { EwalletIdPipe } from "@shared/ewallet/ewallet-id.pipe"
import { ApiBearerAuth, ApiOperation, ApiProduces, ApiTags } from "@nestjs/swagger"
import type { Response } from "express"
import type {
	AdminMessageResult,
	EwalletBadge,
	EwalletDetail,
	EwalletListRow,
	EwalletQrPrint,
	EwalletQrPrintAllRow,
	EwalletSettingPage,
	EwalletWalletTransactionRow,
	EwalletWidget,
	ServerTableResult,
} from "@roja/types"

import { Roles } from "@core/auth/decorators/roles.decorator"
import { JwtAuthGuard } from "@core/auth/guards/jwt-auth.guard"
import { RolesGuard } from "@core/auth/guards/roles.guard"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import { EwalletFilterQueryDto, EwalletListQueryDto, EwalletSettingDto } from "@admin/ewallet/dto/ewallet-wallet.dto"
import { EwalletWalletService } from "@admin/ewallet/wallet-admin.service"
import { sendXlsx, XLSX_TYPE } from "@admin/common/xlsx"

// Legacy `EwalletController`: Akun Dompet, detail, setting, QR and balance export (workstream D-A).
// Legacy gated every route with `can:do-as-cashier` — Superadmin or Kasir E-Wallet; Admin and
// Bendahara get 403.
//
// **Route order matters.** Every wallet route lives under `accounts/:id` and every transaction
// route under `transactions/:id`, so the literal routes (`summary`, `badge`, `export`, `qr-all`,
// `history`, `history-export`) cannot be read as an id. Keep it that way when adding a route.
@ApiTags("Admin — Dompet (Akun)")
@ApiBearerAuth("JWT-Auth")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin", "Kasir E-Wallet")
@Controller("admin/ewallet")
export class EwalletWalletController {
	constructor(private readonly ewalletWalletService: EwalletWalletService) {}

	@Get("accounts")
	@ApiOperation({ summary: "Daftar akun dompet (server-side)" })
	@ApiResponseWrapped({ status: 200, description: "Daftar akun dompet", isPaginated: true })
	async findAll(@Query() query: EwalletListQueryDto): Promise<ServerTableResult<EwalletListRow>> {
		return this.ewalletWalletService.findAll(query)
	}

	@Get("summary")
	@ApiOperation({ summary: "Tiga widget saldo, mengikuti filter status dan pengguna" })
	@ApiResponseWrapped({ status: 200, description: "Total saldo" })
	async widget(@Query() query: EwalletFilterQueryDto): Promise<EwalletWidget> {
		return this.ewalletWalletService.widget(query)
	}

	@Get("badge")
	@ApiOperation({ summary: "Badge merah sidebar: transaksi berstatus process" })
	@ApiResponseWrapped({ status: 200, description: "Jumlah transaksi diproses" })
	async badge(): Promise<EwalletBadge> {
		return this.ewalletWalletService.badge()
	}

	@Get("export")
	@ApiOperation({ summary: "Export laporan saldo akhir (xlsx)" })
	@ApiProduces(XLSX_TYPE)
	async exportBalances(@Query() query: EwalletFilterQueryDto, @Res() res: Response): Promise<void> {
		const file = await this.ewalletWalletService.exportBalances(query)
		sendXlsx(res, file)
	}

	@Get("qr-all")
	@ApiOperation({ summary: "Data cetak QR semua santri (NIS)" })
	@ApiResponseWrapped({ status: 200, description: "Data cetak QR", isArray: true })
	async qrPrintAll(): Promise<EwalletQrPrintAllRow[]> {
		return this.ewalletWalletService.qrPrintAll()
	}

	@Get("accounts/:id")
	@ApiOperation({ summary: "Detail dompet" })
	@ApiResponseWrapped({ status: 200, description: "Detail dompet" })
	async findOne(@Param("id", EwalletIdPipe) id: number): Promise<EwalletDetail> {
		return this.ewalletWalletService.findOne(id)
	}

	@Get("accounts/:id/transactions")
	@ApiOperation({ summary: "Transaksi satu dompet (client-side di legacy)" })
	@ApiResponseWrapped({ status: 200, description: "Transaksi dompet", isArray: true })
	async findTransactions(@Param("id", EwalletIdPipe) id: number): Promise<EwalletWalletTransactionRow[]> {
		return this.ewalletWalletService.findTransactions(id)
	}

	@Get("accounts/:id/setting")
	@ApiOperation({ summary: "Halaman pengaturan dompet" })
	@ApiResponseWrapped({ status: 200, description: "Pengaturan dompet" })
	async getSetting(@Param("id", EwalletIdPipe) id: number): Promise<EwalletSettingPage> {
		return this.ewalletWalletService.getSetting(id)
	}

	@Patch("accounts/:id/setting")
	@ApiOperation({ summary: "Ubah status aktif dompet" })
	@ApiResponseWrapped({ status: 200, description: "Data berhasil diupdate." })
	async updateSetting(@Param("id", EwalletIdPipe) id: number, @Body() body: EwalletSettingDto): Promise<AdminMessageResult> {
		return this.ewalletWalletService.updateSetting(id, body.isActive)
	}

	@Get("accounts/:id/qr")
	@ApiOperation({ summary: "Data cetak QR satu dompet (unique_id)" })
	@ApiResponseWrapped({ status: 200, description: "Data cetak QR" })
	async qrPrint(@Param("id", EwalletIdPipe) id: number): Promise<EwalletQrPrint> {
		return this.ewalletWalletService.qrPrint(id)
	}
}
