import { Body, Controller, Get, Headers, Ip, Patch, Post, Res, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import type { Response } from "express"
import { CurrentUser } from "../../../core/auth/decorators/current-user.decorator"
import { Public } from "../../../core/auth/decorators/public.decorator"
import { ApiResponseWrapped } from "../../../core/decorators/api-response-wrapped.decorator"
import { JwtAuthGuard } from "../../../core/auth/guards/jwt-auth.guard"
import { AdminAuthService } from "../services/admin-auth.service"
import type { AdminAuthResult } from "../services/admin-auth.service"
import type { JwtPayload } from "../../../core/auth/strategies/jwt.strategy"
import type { User } from "../entities/user.entity"
import { AdminLoginDto, ChangePasswordDto, UpdateProfileDto, AdminAuthResultDto } from "../dto/admin-auth.dto"
import { UserResponseDto } from "../dto/user-management.dto"
import { AdminMessageResponseDto } from "../dto/admin-response.dto"

@ApiTags("Admin — Authentication")
@Controller("admin/auth")
export class AdminAuthController {
	constructor(private readonly adminAuthService: AdminAuthService) {}

	private setAuthCookies(res: Response, accessToken?: string, refreshToken?: string) {
		if (accessToken) {
			res.cookie("access_token", accessToken, {
				httpOnly: true,
				secure: process.env["NODE_ENV"] === "production",
				sameSite: "lax",
				maxAge: 15 * 60 * 1000,
			})
		}
		if (refreshToken) {
			res.cookie("refresh_token", refreshToken, {
				httpOnly: true,
				secure: process.env["NODE_ENV"] === "production",
				sameSite: "lax",
				maxAge: 7 * 24 * 60 * 60 * 1000,
			})
		}
	}

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
		this.setAuthCookies(response, result.accessToken, result.refreshToken)
		return result
	}

	@Public()
	@Post("refresh")
	@ApiOperation({ summary: "Refresh access token admin" })
	@ApiResponseWrapped({ status: 200, description: "Access token baru berhasil dibuat", type: AdminAuthResultDto })
	async refresh(
		@CurrentUser() user: JwtPayload,
		@Res({ passthrough: true }) response: Response,
	): Promise<AdminAuthResult> {
		const result = await this.adminAuthService.refreshToken(user)
		this.setAuthCookies(response, result.accessToken, result.refreshToken)
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
		response.clearCookie("access_token")
		response.clearCookie("refresh_token")
		return this.adminAuthService.logout(user.sub, user.tokenId, ip, userAgent)
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth("JWT-Auth")
	@Get("profile")
	@ApiOperation({ summary: "Get profil admin yang sedang login" })
	@ApiResponseWrapped({ status: 200, description: "Detail profil admin", type: UserResponseDto })
	async getProfile(@CurrentUser() user: JwtPayload): Promise<User> {
		return this.adminAuthService.getProfile(user.sub)
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth("JWT-Auth")
	@Patch("profile")
	@ApiOperation({ summary: "Update profil admin yang sedang login" })
	@ApiResponseWrapped({ status: 200, description: "Profil berhasil diupdate", type: UserResponseDto })
	async updateProfile(
		@CurrentUser() user: JwtPayload,
		@Body() dto: UpdateProfileDto,
	): Promise<User> {
		return this.adminAuthService.updateProfile(user.sub, dto)
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth("JWT-Auth")
	@Post("change-password")
	@ApiOperation({ summary: "Ubah password admin yang sedang login" })
	@ApiResponseWrapped({ status: 200, description: "Password berhasil diubah", type: AdminMessageResponseDto })
	async changePassword(
		@CurrentUser() user: JwtPayload,
		@Body() dto: ChangePasswordDto,
	) {
		return this.adminAuthService.changePassword(user.sub, dto)
	}
}

