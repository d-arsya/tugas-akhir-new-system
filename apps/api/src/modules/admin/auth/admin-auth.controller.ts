import { Body, Controller, Headers, Ip, Param, ParseIntPipe, Post, Res, UseGuards } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import type { Response } from "express"
import { CurrentUser } from "@core/auth/decorators/current-user.decorator"
import { Public } from "@core/auth/decorators/public.decorator"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import { JwtAuthGuard } from "@core/auth/guards/jwt-auth.guard"
import type { JwtPayload } from "@core/auth/strategies/jwt.strategy"
import { AdminAuthService, type AdminAuthResult } from "@admin/auth/admin-auth.service"
import { clearAuthCookies, setAuthCookies } from "@admin/auth/admin-auth-cookies"
import {
	AdminLoginDto,
	AdminAuthResultDto,
	AdminForgotPasswordDto,
	AdminResetPasswordDto,
	AdminTwoFactorDto,
} from "@admin/dto/admin-auth.dto"
import { AdminMessageResponseDto } from "@admin/dto/admin-response.dto"
import { AdminJwtRefreshGuard } from "@admin/guards/admin-jwt-refresh.guard"

@ApiTags("Admin — Authentication")
@Controller("admin/auth")
export class AdminAuthController {
	constructor(
		private readonly adminAuthService: AdminAuthService,
		private readonly configService: ConfigService,
	) {}

	@Public()
	@Post("login")
	@ApiOperation({ summary: "Login admin (email & password)" })
	@ApiResponseWrapped({ status: 200, description: "Login berhasil, mengembalikan JWT tokens", type: AdminAuthResultDto })
	@ApiResponse({ status: 401, description: "Kredensial tidak valid" })
	@ApiResponse({ status: 403, description: "Akun diblokir" })
	async login(
		@Body() dto: AdminLoginDto,
		@Ip() ip: string,
		@Headers("user-agent") userAgent: string,
		@Res({ passthrough: true }) response: Response,
	): Promise<AdminAuthResult> {
		const result = await this.adminAuthService.login(dto, ip, userAgent)
		if (result.accessToken) {
			setAuthCookies(response, this.configService, result.accessToken, result.refreshToken)
		}
		return result
	}

	@Public()
	@Post("2fa/verify")
	@ApiOperation({ summary: "Verifikasi 6-digit kode 2FA admin" })
	@ApiResponseWrapped({ status: 200, description: "Verifikasi 2FA berhasil", type: AdminAuthResultDto })
	@ApiResponse({ status: 400, description: "Kode 2FA salah atau kadaluarsa" })
	async verifyTwoFactor(
		@Body() dto: AdminTwoFactorDto,
		@Ip() ip: string,
		@Headers("user-agent") userAgent: string,
		@Res({ passthrough: true }) response: Response,
	): Promise<AdminAuthResult> {
		const result = await this.adminAuthService.verifyTwoFactor(dto, ip, userAgent)
		if (result.accessToken) {
			setAuthCookies(response, this.configService, result.accessToken, result.refreshToken)
		}
		return result
	}

	@Public()
	@Post("2fa/resend/:adminId")
	@ApiOperation({ summary: "Kirim ulang kode 2FA admin" })
	@ApiResponseWrapped({ status: 200, description: "Kode 2FA berhasil dikirim ulang", type: AdminMessageResponseDto })
	async resendTwoFactor(@Param("adminId", ParseIntPipe) adminId: number) {
		return this.adminAuthService.resendTwoFactor(adminId)
	}

	@Public()
	@Post("forgot-password")
	@ApiOperation({ summary: "Kirim link reset password ke email admin" })
	@ApiResponseWrapped({ status: 200, description: "Instruksi reset password telah dikirim", type: AdminMessageResponseDto })
	async forgotPassword(@Body() dto: AdminForgotPasswordDto) {
		return this.adminAuthService.forgotPassword(dto)
	}

	@Public()
	@Post("reset-password")
	@ApiOperation({ summary: "Reset password admin menggunakan token" })
	@ApiResponseWrapped({ status: 200, description: "Password berhasil diperbarui", type: AdminMessageResponseDto })
	@ApiResponse({ status: 400, description: "Token tidak valid atau kadaluarsa" })
	async resetPassword(@Body() dto: AdminResetPasswordDto) {
		return this.adminAuthService.resetPassword(dto)
	}

	@Public()
	@UseGuards(AdminJwtRefreshGuard)
	@Post("refresh")
	@ApiOperation({ summary: "Refresh access token admin" })
	@ApiResponseWrapped({ status: 200, description: "Access token baru berhasil dibuat", type: AdminAuthResultDto })
	async refresh(
		@CurrentUser() user: JwtPayload,
		@Res({ passthrough: true }) response: Response,
	): Promise<AdminAuthResult> {
		const result = await this.adminAuthService.refreshToken(user)
		if (result.accessToken) {
			setAuthCookies(response, this.configService, result.accessToken, result.refreshToken)
		}
		return result
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth("JWT-Auth")
	@Post("logout")
	@ApiOperation({ summary: "Logout admin dan cabut refresh token" })
	@ApiResponseWrapped({ status: 200, description: "Logout berhasil", type: AdminMessageResponseDto })
	async logout(
		@CurrentUser() user: JwtPayload,
		@Ip() ip: string,
		@Headers("user-agent") userAgent: string,
		@Res({ passthrough: true }) response: Response,
	) {
		clearAuthCookies(response, this.configService)
		return this.adminAuthService.logout(user.sub, user.tokenId, ip, userAgent)
	}
}
