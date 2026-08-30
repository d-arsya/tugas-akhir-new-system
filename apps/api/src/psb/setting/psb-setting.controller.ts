import { Body, Controller, Patch, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { CurrentUser } from "../../core/auth/decorators/current-user.decorator"
import { ActiveMemberGuard } from "../guards/active-member.guard"
import { PsbJwtAuthGuard } from "../guards/psb-jwt-auth.guard"
import { Toggle2faDto } from "../dto/setting/toggle-2fa.dto"
import { UpdatePasswordDto } from "../dto/setting/update-password.dto"
import { UpdateProfileDto } from "../dto/setting/update-profile.dto"
import { MessageResponseDto } from "../dto/auth/auth-response.dto"
import { ApiResponseWrapped } from "../../core/decorators/api-response-wrapped.decorator"
import { PsbSettingService } from "./psb-setting.service"
import type { JwtPayload } from "../../core/auth/strategies/jwt.strategy"

@ApiTags("PSB — Settings")
@ApiBearerAuth()
@Controller("psb/setting")
@UseGuards(PsbJwtAuthGuard, ActiveMemberGuard)
export class PsbSettingController {
	constructor(private readonly psbSettingService: PsbSettingService) {}

	@Patch("profile")
	@ApiOperation({ summary: "Perbarui nama lengkap profil pendaftar" })
	@ApiResponseWrapped({ status: 200, description: "Profil berhasil diperbarui", type: MessageResponseDto })
	async updateProfile(
		@CurrentUser() user: JwtPayload,
		@Body() dto: UpdateProfileDto,
	): Promise<MessageResponseDto> {
		const res = await this.psbSettingService.updateProfile(user.sub, dto)
		return { message: res.message as string }
	}

	@Patch("password")
	@ApiOperation({ summary: "Ganti password akun pendaftar" })
	@ApiResponseWrapped({ status: 200, description: "Password berhasil diganti", type: MessageResponseDto })
	@ApiResponse({ status: 400, description: "Konfirmasi password tidak cocok" })
	async updatePassword(
		@CurrentUser() user: JwtPayload,
		@Body() dto: UpdatePasswordDto,
	): Promise<MessageResponseDto> {
		const res = await this.psbSettingService.updatePassword(user.sub, dto)
		return { message: res.message as string }
	}

	@Patch("two-factor")
	@ApiOperation({ summary: "Aktifkan atau nonaktifkan autentikasi dua faktor (2FA)" })
	@ApiResponseWrapped({ status: 200, description: "Pengaturan 2FA berhasil diubah", type: MessageResponseDto })
	async toggle2fa(
		@CurrentUser() user: JwtPayload,
		@Body() dto: Toggle2faDto,
	): Promise<MessageResponseDto> {
		const res = await this.psbSettingService.toggle2fa(user.sub, dto)
		return { message: res.message as string }
	}
}
