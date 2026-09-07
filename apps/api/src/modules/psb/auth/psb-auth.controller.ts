import { Body, Controller, Get, Ip, Post, Query, Res, UseGuards } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { CurrentUser } from "@core/auth/decorators/current-user.decorator"
import { Public } from "@core/auth/decorators/public.decorator"
import { PsbForgotPasswordDto } from "@psb/dto/auth/forgot-password.dto"
import { PsbLoginDto } from "@psb/dto/auth/login.dto"
import { PsbResetPasswordDto } from "@psb/dto/auth/reset-password.dto"
import { PsbResendTwoFactorDto, PsbTwoFactorDto } from "@psb/dto/auth/two-factor.dto"
import { MessageResponseDto, PsbAuthResultDto } from "@psb/dto/auth/auth-response.dto"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import { PsbJwtAuthGuard } from "@psb/guards/psb-jwt-auth.guard"
import { PsbJwtRefreshGuard } from "@psb/guards/psb-jwt-refresh.guard"
import { PsbAuthService } from "@psb/auth/psb-auth.service"
import type { JwtPayload } from "@core/auth/strategies/jwt.strategy"
import { Throttle } from '@nestjs/throttler';

@ApiTags("PSB — Authentication")
@Controller("psb/auth")
@Throttle({ auth: {} })
export class PsbAuthController {
	constructor(
		private readonly psbAuthService: PsbAuthService,
		private readonly configService: ConfigService,
	) { }

	private setAuthCookies(res: any, accessToken?: string, refreshToken?: string) {
		if (accessToken) {
			res.cookie("access_token", accessToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				maxAge: 15 * 60 * 1000, // 15 mins
			})
		}
		if (refreshToken) {
			res.cookie("refresh_token", refreshToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
			})
		}
	}

	@Public()
	@Post("login")
	@ApiOperation({ summary: "Login akun pendaftar (email & password + 2FA trigger)" })
	@ApiResponseWrapped({ status: 200, description: "Login berhasil atau membutuhkan verifikasi kode 2FA", type: PsbAuthResultDto })
	@ApiResponse({ status: 401, description: "Email atau password salah" })
	@ApiResponse({ status: 403, description: "Akun diblokir" })
	async login(
		@Body() dto: PsbLoginDto,
		@Ip() ip: string,
		@Res({ passthrough: true }) response: any,
	): Promise<PsbAuthResultDto> {
		const result = await this.psbAuthService.login(dto, ip)
		if ("accessToken" in result) {
			this.setAuthCookies(response, result.accessToken, result.refreshToken)
		}
		return result
	}

	@Public()
	@Post("two-factor")
	@ApiOperation({ summary: "Verifikasi 6-digit kode 2FA dari email" })
	@ApiResponseWrapped({ status: 200, description: "Verifikasi sukses dan mengembalikan JWT access & refresh token", type: PsbAuthResultDto })
	@ApiResponse({ status: 400, description: "Kode 2FA salah atau kadaluarsa" })
	async verifyTwoFactor(
		@Body() dto: PsbTwoFactorDto,
		@Ip() ip: string,
		@Res({ passthrough: true }) response: any,
	): Promise<PsbAuthResultDto> {
		const result = await this.psbAuthService.verifyTwoFactor(dto, ip)
		if ("accessToken" in result) {
			this.setAuthCookies(response, result.accessToken, result.refreshToken)
		}
		return result
	}

	@Public()
	@Post("two-factor/resend")
	@ApiOperation({ summary: "Kirim ulang kode verifikasi 2FA ke email pendaftar" })
	@ApiResponseWrapped({ status: 200, description: "Kode baru berhasil dikirim", type: MessageResponseDto })
	async resendTwoFactor(@Body() dto: PsbResendTwoFactorDto, @Ip() ip: string): Promise<MessageResponseDto> {
		return this.psbAuthService.resendTwoFactor(dto.email, ip)
	}

	@Public()
	@Post("verify-email")
	@ApiOperation({ summary: "Verifikasi email akun pendaftar menggunakan token link email" })
	@ApiResponseWrapped({ status: 200, description: "Email berhasil diverifikasi", type: MessageResponseDto })
	async verifyEmail(@Body("token") token: string): Promise<MessageResponseDto> {
		return this.psbAuthService.verifyEmail(token)
	}

	@Public()
	@Post("resend-verification")
	@ApiOperation({ summary: "Kirim ulang link verifikasi email ke pendaftar" })
	@ApiResponseWrapped({ status: 200, description: "Link verifikasi baru telah dikirim", type: MessageResponseDto })
	async resendVerification(
		@Body("email") email: string,
		@Body("clientUrl") clientUrl?: string,
	): Promise<MessageResponseDto> {
		return this.psbAuthService.sendVerificationEmail(email, undefined, clientUrl)
	}

	@Public()
	@Post("forgot-password")
	@ApiOperation({ summary: "Permintaan link reset password ke email pendaftar" })
	@ApiResponseWrapped({ status: 200, description: "Instruksi reset password dikirimkan jika email terdaftar", type: MessageResponseDto })
	async forgotPassword(
		@Body() dto: PsbForgotPasswordDto,
		@Body("clientUrl") clientUrl?: string,
	): Promise<MessageResponseDto> {
		return this.psbAuthService.forgotPassword(dto, clientUrl)
	}

	@Public()
	@Post("reset-password")
	@ApiOperation({ summary: "Setel ulang password baru menggunakan token email" })
	@ApiResponseWrapped({ status: 200, description: "Password berhasil diperbarui", type: MessageResponseDto })
	@ApiResponse({ status: 400, description: "Token tidak valid atau konfirmasi password tidak cocok" })
	async resetPassword(@Body() dto: PsbResetPasswordDto): Promise<MessageResponseDto> {
		return this.psbAuthService.resetPassword(dto)
	}

	@Public()
	@UseGuards(PsbJwtRefreshGuard)
	@Post("refresh")
	@ApiOperation({ summary: "Memperbarui access token yang kadaluarsa menggunakan refresh token" })
	@ApiResponseWrapped({ status: 200, description: "Token baru berhasil dibuat", type: PsbAuthResultDto })
	@ApiResponse({ status: 401, description: "Refresh token tidak valid, kadaluarsa, atau dicabut di Redis" })
	async refresh(
		@CurrentUser() user: JwtPayload,
		@Res({ passthrough: true }) response: any,
	): Promise<PsbAuthResultDto> {
		const result = await this.psbAuthService.refreshToken(user)
		if ("accessToken" in result) {
			this.setAuthCookies(response, result.accessToken, result.refreshToken)
		}
		return result
	}

	@UseGuards(PsbJwtAuthGuard)
	@ApiBearerAuth()
	@Post("logout")
	@ApiOperation({ summary: "Logout pendaftar dan cabut refresh token di Redis" })
	@ApiResponseWrapped({ status: 200, description: "Logout berhasil", type: MessageResponseDto })
	async logout(
		@CurrentUser() user: JwtPayload,
		@Res({ passthrough: true }) response: any,
	): Promise<MessageResponseDto> {
		response.clearCookie("access_token")
		response.clearCookie("refresh_token")
		return this.psbAuthService.logout(user.sub, user.tokenId)
	}
}
