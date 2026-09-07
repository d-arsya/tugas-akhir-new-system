import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import { CurrentUser } from "../../core/auth/decorators/current-user.decorator"
import type { JwtPayload } from "../../core/auth/strategies/jwt.strategy"
import { ChangePasswordDto } from "../dto/setting/change-password.dto"
import { Toggle2faDto } from "../dto/setting/toggle-2fa.dto"
import { ActiveStudentGuard } from "../guards/active-student.guard"
import { SantriJwtAuthGuard } from "../guards/santri-jwt-auth.guard"
import { SettingService } from "./setting.service"

@ApiTags("Santri — Setting")
@ApiBearerAuth()
@UseGuards(SantriJwtAuthGuard, ActiveStudentGuard)
@Controller("santri/setting")
export class SettingController {
	constructor(private readonly settingService: SettingService) {}

	@Get()
	@ApiOperation({ summary: "Data halaman pengaturan akun santri (Email status, 2FA status)" })
	async getSettingPage(@CurrentUser() user: JwtPayload) {
		return this.settingService.getSettingPage(user.sub)
	}

	@Patch("password")
	@ApiOperation({ summary: "Ubah password akun santri" })
	async changePassword(
		@CurrentUser() user: JwtPayload,
		@Body() dto: ChangePasswordDto,
	) {
		return this.settingService.changePassword(user.sub, dto)
	}

	@Patch("2fa")
	@ApiOperation({ summary: "Aktifkan atau nonaktifkan autentikasi 2FA via email" })
	async toggle2fa(
		@CurrentUser() user: JwtPayload,
		@Body() dto: Toggle2faDto,
	) {
		return this.settingService.toggle2fa(user.sub, dto)
	}

	@Get("email/resend")
	@ApiOperation({ summary: "Kirim ulang email verifikasi ke akun santri" })
	async resendVerification(@CurrentUser() user: JwtPayload) {
		return this.settingService.resendVerification(user.sub)
	}
}
