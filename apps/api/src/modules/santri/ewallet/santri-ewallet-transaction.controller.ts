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
	UploadedFiles,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common"
import { FileFieldsInterceptor, FileInterceptor } from "@nestjs/platform-express"
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { CurrentUser } from "@core/auth/decorators/current-user.decorator"
import type { JwtPayload } from "@core/auth/strategies/jwt.strategy"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import {
	ConfirmTopUpDto,
	TopUpBankInfoResponseDto,
	TopUpBankTransferDto,
	TopUpCreatedResponseDto,
	TransactionDetailResponseDto,
	TransactionFilterDto,
} from "@modules/ewallet/dto"
import { SantriMessageResponseDto } from "@santri/dto/auth/auth-response.dto"
import { EwalletPinGuard } from "@santri/guards/ewallet-pin.guard"
import { SantriJwtAuthGuard } from "@santri/guards/santri-jwt-auth.guard"
import { SantriEwalletTransactionService } from "@santri/ewallet/santri-ewallet-transaction.service"

@ApiTags("Santri — E-Wallet Transactions & Top-Up")
@ApiBearerAuth()
@UseGuards(SantriJwtAuthGuard, EwalletPinGuard)
@Controller("santri/ewallet")
export class SantriEwalletTransactionController {
	constructor(
		private readonly transactionService: SantriEwalletTransactionService,
	) {}

	@Get("transactions")
	@ApiOperation({ summary: "Daftar riwayat transaksi E-Wallet santri terpaginasi & terfilter" })
	@ApiResponseWrapped({
		status: 200,
		description: "Daftar transaksi E-Wallet berhasil dimuat",
		type: TransactionDetailResponseDto,
		isArray: true,
	})
	async getTransactionList(
		@CurrentUser() user: JwtPayload,
		@Query() filters: TransactionFilterDto,
	) {
		return this.transactionService.getTransactionList(user.sub, filters)
	}

	@Get("transactions/:id")
	@ApiOperation({ summary: "Detail lengkap transaksi E-Wallet" })
	@ApiResponseWrapped({
		status: 200,
		description: "Detail transaksi berhasil dimuat",
		type: TransactionDetailResponseDto,
	})
	@ApiResponse({ status: 404, description: "Transaksi tidak ditemukan" })
	async getTransactionDetail(
		@CurrentUser() user: JwtPayload,
		@Param("id", ParseIntPipe) id: number,
	) {
		return this.transactionService.getTransactionDetail(id, user.sub)
	}

	@Get("top-up/bank-transfer")
	@ApiOperation({ summary: "Informasi rekening bank untuk top-up manual" })
	@ApiResponseWrapped({
		status: 200,
		description: "Informasi rekening bank top-up berhasil dimuat",
		type: TopUpBankInfoResponseDto,
	})
	async getTopUpBankInfo() {
		return this.transactionService.getTopUpBankInfo()
	}

	@Post("top-up/bank-transfer")
	@ApiOperation({ summary: "Buat transaksi isi saldo via Bank Transfer" })
	@ApiResponseWrapped({
		status: 200,
		description: "Transaksi isi saldo berhasil dibuat",
		type: TopUpCreatedResponseDto,
	})
	async storeTopUpBankTransfer(
		@CurrentUser() user: JwtPayload,
		@Body() dto: TopUpBankTransferDto,
	) {
		return this.transactionService.storeTopUpBankTransfer(user.sub, dto)
	}

	@Get("top-up/confirm/:id")
	@ApiOperation({ summary: "Halaman konfirmasi pembayaran top-up" })
	@ApiResponseWrapped({
		status: 200,
		description: "Ringkasan pembayaran top-up berhasil dimuat",
		type: TransactionDetailResponseDto,
	})
	async getConfirmForm(
		@CurrentUser() user: JwtPayload,
		@Param("id", ParseIntPipe) id: number,
	) {
		return this.transactionService.getConfirmForm(id, user.sub)
	}

	@Patch("top-up/confirm/:id")
	@UseInterceptors(
		FileFieldsInterceptor([
			{ name: "file", maxCount: 1 },
			{ name: "payment_attachment", maxCount: 1 },
			{ name: "paymentAttachment", maxCount: 1 },
		]),
	)
	@ApiConsumes("multipart/form-data")
	@ApiOperation({ summary: "Unggah bukti transfer & konfirmasi pembayaran top-up" })
	@ApiBody({
		schema: {
			type: "object",
			properties: {
				paymentDate: {
					type: "string",
					example: "2026-09-05",
					description: "Tanggal transfer (format YYYY-MM-DD atau DD/MM/YYYY)",
				},
				paymentNote: {
					type: "string",
					example: "Transfer via BSI Mobile",
					description: "Catatan/keterangan transfer (opsional)",
				},
				file: {
					type: "string",
					format: "binary",
					description: "Foto/Gambar bukti transfer (bisa pakai field 'file' atau 'payment_attachment')",
				},
			},
			required: ["paymentDate"],
		},
	})
	@ApiResponseWrapped({
		status: 200,
		description: "Bukti transfer berhasil diunggah dan dikonfirmasi",
		type: SantriMessageResponseDto,
	})
	async confirmTopUp(
		@CurrentUser() user: JwtPayload,
		@Param("id", ParseIntPipe) id: number,
		@Body() dto: ConfirmTopUpDto,
		@UploadedFiles()
		files: {
			file?: Express.Multer.File[]
			payment_attachment?: Express.Multer.File[]
			paymentAttachment?: Express.Multer.File[]
		},
	) {
		const uploadedFile =
			files?.file?.[0] || files?.payment_attachment?.[0] || files?.paymentAttachment?.[0]
		return this.transactionService.confirmTopUp(id, user.sub, dto, uploadedFile)
	}

	@Get("top-up/cash")
	@ApiOperation({ summary: "Informasi pengisian saldo secara tunai" })
	@ApiResponseWrapped({
		status: 200,
		description: "Informasi top-up tunai berhasil dimuat",
		type: SantriMessageResponseDto,
	})
	async getCashInfo() {
		return this.transactionService.getCashInfo()
	}

	@Get("withdraw")
	@ApiOperation({ summary: "Informasi penarikan saldo E-Wallet" })
	@ApiResponseWrapped({
		status: 200,
		description: "Informasi penarikan saldo berhasil dimuat",
		type: SantriMessageResponseDto,
	})
	async getWithdrawInfo() {
		return this.transactionService.getWithdrawInfo()
	}

	@Get("purchase-history")
	@ApiOperation({ summary: "Daftar riwayat pembelian santri di merchant terpaginasi" })
	@ApiResponseWrapped({
		status: 200,
		description: "Daftar riwayat pembelian berhasil dimuat",
		type: TransactionDetailResponseDto,
		isArray: true,
	})
	async getPurchaseHistory(
		@CurrentUser() user: JwtPayload,
		@Query() filters: TransactionFilterDto,
	) {
		return this.transactionService.getPurchaseHistory(user.sub, filters)
	}

	@Get("purchase-history/:id")
	@ApiOperation({ summary: "Detail riwayat pembelian santri di merchant" })
	@ApiResponseWrapped({
		status: 200,
		description: "Detail riwayat pembelian berhasil dimuat",
		type: TransactionDetailResponseDto,
	})
	async getPurchaseDetail(
		@CurrentUser() user: JwtPayload,
		@Param("id", ParseIntPipe) id: number,
	) {
		return this.transactionService.getPurchaseDetail(id, user.sub)
	}
}
