import { Body, Controller, Ip, Post, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { CurrentUser } from "../../core/auth/decorators/current-user.decorator"
import { Public } from "../../core/auth/decorators/public.decorator"
import { PsbForgotPasswordDto } from "../dto/auth/forgot-password.dto"
import { PsbLoginDto } from "../dto/auth/login.dto"
import { PsbResetPasswordDto } from "../dto/auth/reset-password.dto"
import { PsbResendTwoFactorDto, PsbTwoFactorDto } from "../dto/auth/two-factor.dto"
import { MessageResponseDto, PsbAuthResultDto } from "../dto/auth/auth-response.dto"
import { ApiResponseWrapped } from "../../core/decorators/api-response-wrapped.decorator"
import { PsbJwtAuthGuard } from "../guards/psb-jwt-auth.guard"
import { PsbAuthService } from "./psb-auth.service"
import type { JwtPayload } from "../../core/auth/strategies/jwt.strategy"

@ApiTags("PSB — Authentication")
@Controller("psb/auth")
export class PsbAuthController {
	constructor(private readonly psbAuthService: PsbAuthService) {}

	@Public()
	@Post("login")
	@ApiOperation({ summary: "Login akun pendaftar (email & password + 2FA trigger)" })
	@ApiResponseWrapped({ status: 200, description: "Login berhasil atau membutuhkan verifikasi kode 2FA", type: PsbAuthResultDto })
	@ApiResponse({ status: 401, description: "Email atau password salah" })
	@ApiResponse({ status: 403, description: "Akun diblokir" })
	async login(@Body() dto: PsbLoginDto, @Ip() ip: string): Promise<PsbAuthResultDto> {
		return this.psbAuthService.login(dto, ip)
	}

	@Public()
	@Post("two-factor")
	@ApiOperation({ summary: "Verifikasi 6-digit kode 2FA dari email" })
	@ApiResponseWrapped({ status: 200, description: "Verifikasi sukses dan mengembalikan JWT access & refresh token", type: PsbAuthResultDto })
	@ApiResponse({ status: 400, description: "Kode 2FA salah atau kadaluarsa" })
	async verifyTwoFactor(@Body() dto: PsbTwoFactorDto, @Ip() ip: string): Promise<PsbAuthResultDto> {
		return this.psbAuthService.verifyTwoFactor(dto, ip)
	}

	@Public()
	@Post("two-factor/resend")
	@ApiOperation({ summary: "Kirim ulang kode verifikasi 2FA ke email pendaftar" })
	@ApiResponseWrapped({ status: 200, description: "Kode baru berhasil dikirim", type: MessageResponseDto })
	async resendTwoFactor(@Body() dto: PsbResendTwoFactorDto, @Ip() ip: string): Promise<MessageResponseDto> {
		return this.psbAuthService.resendTwoFactor(dto.email, ip)
	}

	@Public()
	@Post("forgot-password")
	@ApiOperation({ summary: "Permintaan link reset password ke email pendaftar" })
	@ApiResponseWrapped({ status: 200, description: "Instruksi reset password dikirimkan jika email terdaftar", type: MessageResponseDto })
	async forgotPassword(@Body() dto: PsbForgotPasswordDto): Promise<MessageResponseDto> {
		return this.psbAuthService.forgotPassword(dto)
	}

	@Public()
	@Post("reset-password")
	@ApiOperation({ summary: "Setel ulang password baru menggunakan token email" })
	@ApiResponseWrapped({ status: 200, description: "Password berhasil diperbarui", type: MessageResponseDto })
	@ApiResponse({ status: 400, description: "Token tidak valid atau konfirmasi password tidak cocok" })
	async resetPassword(@Body() dto: PsbResetPasswordDto): Promise<MessageResponseDto> {
		return this.psbAuthService.resetPassword(dto)
	}

	@UseGuards(PsbJwtAuthGuard)
	@ApiBearerAuth()
	@Post("logout")
	@ApiOperation({ summary: "Logout pendaftar dan cabut refresh token di Redis" })
	@ApiResponseWrapped({ status: 200, description: "Logout berhasil", type: MessageResponseDto })
	async logout(@CurrentUser() user: JwtPayload): Promise<MessageResponseDto> {
		return this.psbAuthService.logout(user.sub, user.tokenId)
	}
}
