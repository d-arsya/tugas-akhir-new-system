import {
	Body,
	Controller,
	Get,
	Ip,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Query,
	Res,
	UseGuards,
} from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { CurrentUser } from "@core/auth/decorators/current-user.decorator"
import { Public } from "@core/auth/decorators/public.decorator"
import type { JwtPayload } from "@core/auth/strategies/jwt.strategy"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import {
	SantriAuthResultDto,
	SantriEmailInfoDto,
	SantriMessageResponseDto,
	SantriRefreshResultDto,
} from "@santri/dto/auth/auth-response.dto"
import { SantriForgotPasswordDto } from "@santri/dto/auth/forgot-password.dto"
import { SantriLoginDto } from "@santri/dto/auth/login.dto"
import { SantriResetPasswordDto } from "@santri/dto/auth/reset-password.dto"
import { SantriTwoFactorDto } from "@santri/dto/auth/two-factor.dto"
import { SantriUpdateEmailDto } from "@santri/dto/auth/update-email.dto"
import { SantriJwtAuthGuard } from "@santri/guards/santri-jwt-auth.guard"
import { SantriJwtRefreshGuard } from "@santri/guards/santri-jwt-refresh.guard"
import { SantriAuthResult, SantriAuthService } from "@santri/auth/santri-auth.service"
import { SantriGoogleLoginService } from "@santri/auth/santri-google-login.service"
import { GoogleLoginDto } from "@core/auth/google/google-login.dto"
import { ConfigService } from "@nestjs/config"
import type { Response } from "express"

@ApiTags("Santri — Authentication")
@Controller("santri/auth")
export class SantriAuthController {
	constructor(
		private readonly santriAuthService: SantriAuthService,
		private readonly santriGoogleLoginService: SantriGoogleLoginService,
		private readonly configService: ConfigService
	) { }

	private setAuthCookies(res: Response, accessToken?: string, refreshToken?: string) {
		const rawDomain = this.configService.get<string>("COOKIE_DOMAIN")?.trim().toLowerCase()

		if (accessToken) {
			res.cookie("access_token", accessToken, {
				httpOnly: true,
				secure: process.env["NODE_ENV"] === "production",
				sameSite: "strict",
				...(rawDomain ? { domain: rawDomain } : {}),
				maxAge: 15 * 60 * 1000,
			})
		}
		if (refreshToken) {
			res.cookie("refresh_token", refreshToken, {
				httpOnly: true,
				secure: process.env["NODE_ENV"] === "production",
				sameSite: "strict",
				...(rawDomain ? { domain: rawDomain } : {}),
				maxAge: 7 * 24 * 60 * 60 * 1000,
			})
		}
	}

	@Public()
	@Post("login")
	@ApiOperation({ summary: "Login akun santri (NIS & Password)" })
	@ApiResponseWrapped({
		status: 200,
		description: "Login berhasil atau memerlukan verifikasi 2FA",
		type: SantriAuthResultDto,
	})
	@ApiResponse({ status: 401, description: "NIS atau password salah" })
	@ApiResponse({ status: 403, description: "Akun diblokir" })
	async login(
		@Body() dto: SantriLoginDto,
		@Ip() ip: string,
		@Res({ passthrough: true }) response: any,
	): Promise<SantriAuthResult> {
		const result = await this.santriAuthService.login(dto, ip)
		if ("accessToken" in result) {
			this.setAuthCookies(response, result.accessToken, result.refreshToken)
		}
		return result
	}

	@Public()
	@Post("google")
	@ApiOperation({ summary: "Login akun santri dengan Google" })
	@ApiResponseWrapped({
		status: 200,
		description: "Login berhasil atau memerlukan verifikasi 2FA",
		type: SantriAuthResultDto,
	})
	@ApiResponse({ status: 401, description: "Token Google tidak valid atau email tidak terdaftar" })
	@ApiResponse({ status: 403, description: "Akun diblokir" })
	async loginWithGoogle(
		@Body() dto: GoogleLoginDto,
		@Ip() ip: string,
		@Res({ passthrough: true }) response: Response,
	): Promise<SantriAuthResult> {
		const result = await this.santriGoogleLoginService.login(dto.credential, ip)
		if ("accessToken" in result) {
			this.setAuthCookies(response, result.accessToken, result.refreshToken)
		}
		return result
	}

	@Public()
	@Post("2fa/verify")
	@ApiOperation({ summary: "Verifikasi 6-digit kode 2FA" })
	@ApiResponseWrapped({
		status: 200,
		description: "Verifikasi 2FA berhasil",
		type: SantriAuthResultDto,
	})
	@ApiResponse({ status: 400, description: "Kode 2FA salah atau kadaluarsa" })
	async verifyTwoFactor(
		@Body() dto: SantriTwoFactorDto,
		@Query("student_id", ParseIntPipe) studentId: number,
		@Ip() ip: string,
		@Res({ passthrough: true }) response: any,
	): Promise<SantriAuthResult> {
		const result = await this.santriAuthService.verifyTwoFactor(dto, ip, studentId)
		if ("accessToken" in result) {
			this.setAuthCookies(response, result.accessToken, result.refreshToken)
		}
		return result
	}

	@Public()
	@Get("2fa/resend")
	@ApiOperation({ summary: "Kirim ulang kode 2FA" })
	@ApiResponseWrapped({
		status: 200,
		description: "Kode verifikasi 2FA berhasil dikirim ulang",
		type: SantriMessageResponseDto,
	})
	async resendTwoFactor(
		@Query("student_id", ParseIntPipe) studentId: number,
		@Ip() ip: string,
	) {
		return this.santriAuthService.resendTwoFactor(studentId, ip)
	}

	@Public()
	@Post("forgot-password")
	@ApiOperation({ summary: "Kirim link reset password ke email santri" })
	@ApiResponseWrapped({
		status: 200,
		description: "Instruksi reset password telah dikirim jika email terdaftar",
		type: SantriMessageResponseDto,
	})
	async forgotPassword(@Body() dto: SantriForgotPasswordDto) {
		return this.santriAuthService.forgotPassword(dto)
	}

	@Public()
	@Post("reset-password")
	@ApiOperation({ summary: "Reset password menggunakan token" })
	@ApiResponseWrapped({
		status: 200,
		description: "Password berhasil diperbarui",
		type: SantriMessageResponseDto,
	})
	@ApiResponse({ status: 400, description: "Token tidak valid atau kadaluarsa" })
	async resetPassword(@Body() dto: SantriResetPasswordDto) {
		return this.santriAuthService.resetPassword(dto)
	}

	@ApiBearerAuth()
	@UseGuards(SantriJwtAuthGuard)
	@Post("email/verify/send")
	@ApiOperation({ summary: "Kirim ulang email verifikasi" })
	@ApiResponseWrapped({
		status: 200,
		description: "Email verifikasi berhasil dikirim",
		type: SantriMessageResponseDto,
	})
	async sendEmailVerification(@CurrentUser() user: JwtPayload) {
		return this.santriAuthService.sendEmailVerification(user.sub)
	}

	@Public()
	@Get("email/verify/:id/:hash")
	@ApiOperation({ summary: "Verifikasi email melalui link" })
	@ApiResponseWrapped({
		status: 200,
		description: "Email berhasil diverifikasi",
		type: SantriMessageResponseDto,
	})
	@ApiResponse({ status: 400, description: "Token verifikasi tidak valid" })
	async verifyEmail(
		@Param("id", ParseIntPipe) id: number,
		@Param("hash") hash: string,
	) {
		return this.santriAuthService.verifyEmail(id, hash)
	}

	@ApiBearerAuth()
	@UseGuards(SantriJwtAuthGuard)
	@Get("check-email")
	@ApiOperation({ summary: "Ambil informasi email santri saat ini" })
	@ApiResponseWrapped({
		status: 200,
		description: "Informasi email santri berhasil dimuat",
		type: SantriEmailInfoDto,
	})
	async getEmail(@CurrentUser() user: JwtPayload) {
		return this.santriAuthService.getEmail(user.sub)
	}

	@ApiBearerAuth()
	@UseGuards(SantriJwtAuthGuard)
	@Patch("check-email")
	@ApiOperation({ summary: "Perbarui email santri" })
	@ApiResponseWrapped({
		status: 200,
		description: "Email berhasil diperbarui",
		type: SantriMessageResponseDto,
	})
	@ApiResponse({ status: 400, description: "Email sudah digunakan oleh akun lain" })
	async updateEmail(
		@CurrentUser() user: JwtPayload,
		@Body() dto: SantriUpdateEmailDto,
	) {
		return this.santriAuthService.updateEmail(user.sub, dto)
	}

	@ApiBearerAuth()
	@UseGuards(SantriJwtAuthGuard)
	@Post("logout")
	@ApiOperation({ summary: "Logout akun santri" })
	@ApiResponseWrapped({
		status: 200,
		description: "Berhasil keluar",
		type: SantriMessageResponseDto,
	})
	async logout(
		@CurrentUser() user: JwtPayload,
		@Res({ passthrough: true }) response: Response,
	) {
		const rawDomain = this.configService.get<string>("COOKIE_DOMAIN")?.trim().toLowerCase()
		response.clearCookie("access_token", rawDomain ? { domain: rawDomain } : undefined)
		response.clearCookie("refresh_token", rawDomain ? { domain: rawDomain } : undefined)
		return this.santriAuthService.logout(user.sub, user.tokenId)
	}

	@Public()
	@UseGuards(SantriJwtRefreshGuard)
	@Post("refresh")
	@ApiOperation({ summary: "Refresh access token santri" })
	@ApiResponseWrapped({
		status: 200,
		description: "Access token & refresh token baru berhasil dibuat",
		type: SantriRefreshResultDto,
	})
	async refreshToken(
		@CurrentUser() user: JwtPayload,
		@Res({ passthrough: true }) response: any,
	) {
		const result = await this.santriAuthService.refreshToken(user)
		this.setAuthCookies(response, result.accessToken, result.refreshToken)
		return result
	}
}
