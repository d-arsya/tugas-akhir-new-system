import { Body, Controller, Get, HttpCode, Param, Post, Res, UseGuards } from "@nestjs/common"
import { EwalletIdPipe } from "@shared/ewallet/ewallet-id.pipe"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import type { Response } from "express"
import type { EwalletMoneyResult, EwalletPendingWithdraw } from "@roja/types"

import { CurrentUser } from "@core/auth/decorators/current-user.decorator"
import { Roles } from "@core/auth/decorators/roles.decorator"
import { JwtAuthGuard } from "@core/auth/guards/jwt-auth.guard"
import { RolesGuard } from "@core/auth/guards/roles.guard"
import type { JwtPayload } from "@core/auth/strategies/jwt.strategy"
import { EwalletAmountDto, EwalletPinDto } from "@admin/dto/ewallet-money.dto"
import { EwalletMoneyService, type MoneyOutcome } from "@admin/ewallet/money-admin.service"

// Legacy `EwalletController`: cash top-up, the three-step withdraw, PIN reset (workstream D-B).
// Gated Superadmin | Kasir E-Wallet (`can:do-as-cashier`). Every route lives under `accounts/:id`.
//
// The global exception filter keeps only `message` and `errors`, so the answers that must carry a
// `redirect` (lock, insufficient balance, throttled email) are written to the response here, in the
// same `{ success, message }` shape the filter produces for the client.
@ApiTags("Admin — Dompet (Saldo)")
@ApiBearerAuth("JWT-Auth")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin", "Kasir E-Wallet")
@Controller("admin/ewallet")
export class EwalletMoneyController {
	constructor(private readonly ewalletMoneyService: EwalletMoneyService) {}

	private send(res: Response, outcome: MoneyOutcome, status: number): void {
		if (outcome.refused) {
			res.status(422).json({ success: false, message: outcome.message, redirect: outcome.redirect })
			return
		}
		res.status(status).json({ success: true, data: outcome.body, message: outcome.body.message })
	}

	@Post("accounts/:id/top-up")
	@ApiOperation({ summary: "Isi saldo (cash)" })
	topUp(
		@CurrentUser() user: JwtPayload,
		@Param("id", EwalletIdPipe) id: number,
		@Body() dto: EwalletAmountDto,
	): Promise<EwalletMoneyResult> {
		return this.ewalletMoneyService.topUp(user.sub, id, dto.amount)
	}

	@Post("accounts/:id/withdraw/amount")
	@ApiOperation({ summary: "Tarik saldo — simpan nominal, lanjut ke halaman pin" })
	parkWithdraw(
		@CurrentUser() user: JwtPayload,
		@Param("id", EwalletIdPipe) id: number,
		@Body() dto: EwalletAmountDto,
	): Promise<EwalletMoneyResult> {
		return this.ewalletMoneyService.parkWithdraw(user.sub, id, dto.amount)
	}

	@Get("accounts/:id/withdraw/pending")
	@ApiOperation({ summary: "Nominal penarikan yang sedang menunggu pin, atau null" })
	pending(@CurrentUser() user: JwtPayload, @Param("id", EwalletIdPipe) id: number): Promise<EwalletPendingWithdraw | null> {
		return this.ewalletMoneyService.pendingWithdraw(user.sub, id)
	}

	@Post("accounts/:id/withdraw/pin")
	@ApiOperation({ summary: "Tarik saldo — validasi pin (empat kali salah mengunci dompet)" })
	async verifyPin(
		@CurrentUser() user: JwtPayload,
		@Param("id", EwalletIdPipe) id: number,
		@Body() dto: EwalletPinDto,
		@Res() res: Response,
	): Promise<void> {
		this.send(res, await this.ewalletMoneyService.verifyPin(user.sub, id, dto.pin), 201)
	}

	@Post("accounts/:id/withdraw")
	@ApiOperation({ summary: "Tarik saldo (cash) — tanpa body, memakai nominal yang disimpan" })
	async withdraw(@CurrentUser() user: JwtPayload, @Param("id", EwalletIdPipe) id: number, @Res() res: Response): Promise<void> {
		this.send(res, await this.ewalletMoneyService.withdraw(user.sub, id), 201)
	}

	@Post("accounts/:id/reset-pin")
	@HttpCode(200)
	@ApiOperation({ summary: "Reset pin manual" })
	resetPin(@Param("id", EwalletIdPipe) id: number, @Body() dto: EwalletPinDto): Promise<EwalletMoneyResult> {
		return this.ewalletMoneyService.resetPin(id, dto.pin)
	}

	@Post("accounts/:id/reset-pin-email")
	@ApiOperation({ summary: "Kirim email reset pin (6 per menit per pemilik)" })
	async resetPinEmail(@Param("id", EwalletIdPipe) id: number, @Res() res: Response): Promise<void> {
		this.send(res, await this.ewalletMoneyService.sendResetPinEmail(id), 201)
	}
}
