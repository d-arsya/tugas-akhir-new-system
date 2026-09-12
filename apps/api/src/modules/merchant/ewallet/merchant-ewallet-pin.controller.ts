import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import { CurrentUser } from "@core/auth/decorators/current-user.decorator"
import type { JwtPayload } from "@core/auth/strategies/jwt.strategy"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import { ResetPinDto, UpdatePinDto, ValidateCurrentPinDto } from "@modules/ewallet/dto"
import { MerchantMessageResponseDto } from "@merchant/dto/auth"
import { ActiveMerchantGuard } from "@merchant/guards/active-merchant.guard"
import { EwalletPinGuard } from "@merchant/guards/ewallet-pin.guard"
import { MerchantJwtAuthGuard } from "@merchant/guards/merchant-jwt-auth.guard"
import { MerchantEwalletService } from "@merchant/ewallet/merchant-ewallet.service"

@ApiTags("Merchant — E-Wallet PIN Management")
@ApiBearerAuth()
@UseGuards(MerchantJwtAuthGuard, ActiveMerchantGuard)
@Controller("merchant/ewallet/pin")
export class MerchantEwalletPinController {
	constructor(private readonly merchantEwalletService: MerchantEwalletService) {}

	@UseGuards(EwalletPinGuard)
	@Get("edit")
	@ApiOperation({ summary: "Tampilkan halaman ubah PIN E-Wallet" })
	@ApiResponseWrapped({
		status: 200,
		description: "Instruksi ubah PIN E-Wallet",
		type: MerchantMessageResponseDto,
	})
	async showEditPage() {
		return { message: "Silakan masukkan PIN saat ini dan PIN baru." }
	}

	@UseGuards(EwalletPinGuard)
	@Post("validate-current")
	@ApiOperation({ summary: "Verifikasi PIN lama saat ubah PIN" })
	@ApiResponseWrapped({
		status: 200,
		description: "PIN saat ini valid",
		type: MerchantMessageResponseDto,
	})
	async validateCurrentPin(
		@CurrentUser() user: JwtPayload,
		@Body() dto: ValidateCurrentPinDto,
	) {
		return this.merchantEwalletService.validateCurrentPin(user.sub, dto)
	}

	@UseGuards(EwalletPinGuard)
	@Patch()
	@ApiOperation({ summary: "Perbarui PIN E-Wallet merchant" })
	@ApiResponseWrapped({
		status: 200,
		description: "PIN E-Wallet berhasil diperbarui",
		type: MerchantMessageResponseDto,
	})
	async updatePin(
		@CurrentUser() user: JwtPayload,
		@Body() dto: UpdatePinDto,
	) {
		return this.merchantEwalletService.updatePin(user.sub, dto)
	}

	@Post("reset-email")
	@ApiOperation({ summary: "Kirim email instruksi reset PIN E-Wallet" })
	@ApiResponseWrapped({
		status: 200,
		description: "Email instruksi reset PIN berhasil dikirim",
		type: MerchantMessageResponseDto,
	})
	async sendPinResetEmail(@CurrentUser() user: JwtPayload) {
		return this.merchantEwalletService.sendPinResetEmail(user.sub)
	}

	@Get("reset/:token")
	@ApiOperation({ summary: "Verifikasi token reset PIN E-Wallet" })
	@ApiResponseWrapped({
		status: 200,
		description: "Token reset PIN valid",
		type: MerchantMessageResponseDto,
	})
	async validatePinResetToken(
		@CurrentUser() user: JwtPayload,
		@Param("token") token: string,
	) {
		return this.merchantEwalletService.validatePinResetToken(user.sub, token)
	}

	@Patch("reset")
	@ApiOperation({ summary: "Reset PIN E-Wallet menggunakan token" })
	@ApiResponseWrapped({
		status: 200,
		description: "PIN E-Wallet berhasil direset",
		type: MerchantMessageResponseDto,
	})
	async resetPin(
		@CurrentUser() user: JwtPayload,
		@Body() dto: ResetPinDto,
	) {
		return this.merchantEwalletService.resetPin(user.sub, dto)
	}
}
