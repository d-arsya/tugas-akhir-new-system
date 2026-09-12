import {
	Body,
	Controller,
	Get,
	Ip,
	Param,
	ParseIntPipe,
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
	MerchantAuthResultDto,
	MerchantForgotPasswordDto,
	MerchantLoginDto,
	MerchantMessageResponseDto,
	MerchantRefreshResultDto,
	MerchantResetPasswordDto,
	MerchantTwoFactorDto,
} from "@merchant/dto/auth"
import { MerchantJwtAuthGuard } from "@merchant/guards/merchant-jwt-auth.guard"
import { MerchantJwtRefreshGuard } from "@merchant/guards/merchant-jwt-refresh.guard"
import { MerchantAuthResult, MerchantAuthService } from "@merchant/auth/merchant-auth.service"

@ApiTags("Merchant — Authentication")
@Controller("merchant/auth")
export class MerchantAuthController {
	constructor(private readonly merchantAuthService: MerchantAuthService) {}

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
	@ApiOperation({ summary: "Login akun merchant (Nomor Merchant & Password)" })
	@ApiResponseWrapped({
		status: 200,
		description: "Login berhasil atau memerlukan verifikasi 2FA",
		type: MerchantAuthResultDto,
	})
	@ApiResponse({ status: 401, description: "Nomor Merchant atau password salah" })
	@ApiResponse({ status: 403, description: "Akun diblokir" })
	async login(
		@Body() dto: MerchantLoginDto,
		@Ip() ip: string,
		@Res({ passthrough: true }) response: any,
	): Promise<MerchantAuthResult> {
		const result = await this.merchantAuthService.login(dto, ip)
		if ("accessToken" in result) {
			this.setAuthCookies(response, result.accessToken, result.refreshToken)
		}
		return result
	}

	@Public()
	@Post("2fa/verify")
	@ApiOperation({ summary: "Verifikasi 6-digit kode 2FA merchant" })
	@ApiResponseWrapped({
		status: 200,
		description: "Verifikasi 2FA berhasil",
		type: MerchantAuthResultDto,
	})
	@ApiResponse({ status: 400, description: "Kode 2FA salah atau kadaluarsa" })
	async verifyTwoFactor(
		@Body() dto: MerchantTwoFactorDto,
		@Query("merchant_id", ParseIntPipe) merchantId: number,
		@Ip() ip: string,
		@Res({ passthrough: true }) response: any,
	): Promise<MerchantAuthResult> {
		const result = await this.merchantAuthService.verifyTwoFactor(dto, ip, merchantId)
		if ("accessToken" in result) {
			this.setAuthCookies(response, result.accessToken, result.refreshToken)
		}
		return result
	}

	@Public()
	@Get("2fa/resend")
	@ApiOperation({ summary: "Kirim ulang kode 2FA merchant" })
	@ApiResponseWrapped({
		status: 200,
		description: "Kode verifikasi 2FA berhasil dikirim ulang",
		type: MerchantMessageResponseDto,
	})
	async resendTwoFactor(
		@Query("merchant_id", ParseIntPipe) merchantId: number,
		@Ip() ip: string,
	) {
		return this.merchantAuthService.resendTwoFactor(merchantId, ip)
	}

	@Public()
	@Post("forgot-password")
	@ApiOperation({ summary: "Kirim link reset password berdasarkan Nomor Merchant" })
	@ApiResponseWrapped({
		status: 200,
		description: "Instruksi reset password telah dikirim jika Nomor Merchant terdaftar",
		type: MerchantMessageResponseDto,
	})
	async forgotPassword(@Body() dto: MerchantForgotPasswordDto) {
		return this.merchantAuthService.forgotPassword(dto)
	}

	@Public()
	@Post("reset-password")
	@ApiOperation({ summary: "Reset password merchant menggunakan token" })
	@ApiResponseWrapped({
		status: 200,
		description: "Password berhasil diperbarui",
		type: MerchantMessageResponseDto,
	})
	@ApiResponse({ status: 400, description: "Token tidak valid atau kadaluarsa" })
	async resetPassword(@Body() dto: MerchantResetPasswordDto) {
		return this.merchantAuthService.resetPassword(dto)
	}

	@ApiBearerAuth()
	@UseGuards(MerchantJwtAuthGuard)
	@Post("email/verify/send")
	@ApiOperation({ summary: "Kirim ulang email verifikasi merchant" })
	@ApiResponseWrapped({
		status: 200,
		description: "Email verifikasi berhasil dikirim",
		type: MerchantMessageResponseDto,
	})
	async sendEmailVerification(@CurrentUser() user: JwtPayload) {
		return this.merchantAuthService.sendEmailVerification(user.sub)
	}

	@Public()
	@Get("email/verify/:id/:hash")
	@ApiOperation({ summary: "Verifikasi email merchant melalui link" })
	@ApiResponseWrapped({
		status: 200,
		description: "Email berhasil diverifikasi",
		type: MerchantMessageResponseDto,
	})
	@ApiResponse({ status: 400, description: "Token verifikasi tidak valid" })
	async verifyEmail(
		@Param("id", ParseIntPipe) id: number,
		@Param("hash") hash: string,
	) {
		return this.merchantAuthService.verifyEmail(id, hash)
	}

	@ApiBearerAuth()
	@UseGuards(MerchantJwtAuthGuard)
	@Post("logout")
	@ApiOperation({ summary: "Logout akun merchant" })
	@ApiResponseWrapped({
		status: 200,
		description: "Berhasil keluar",
		type: MerchantMessageResponseDto,
	})
	async logout(
		@CurrentUser() user: JwtPayload,
		@Res({ passthrough: true }) response: any,
	) {
		response.clearCookie("access_token")
		response.clearCookie("refresh_token")
		return this.merchantAuthService.logout(user.sub, user.tokenId)
	}

	@Public()
	@UseGuards(MerchantJwtRefreshGuard)
	@Post("refresh")
	@ApiOperation({ summary: "Refresh access token merchant" })
	@ApiResponseWrapped({
		status: 200,
		description: "Access token & refresh token baru berhasil dibuat",
		type: MerchantRefreshResultDto,
	})
	async refreshToken(
		@CurrentUser() user: JwtPayload,
		@Res({ passthrough: true }) response: any,
	) {
		const result = await this.merchantAuthService.refreshToken(user)
		this.setAuthCookies(response, result.accessToken, result.refreshToken)
		return result
	}
}
