import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import { CurrentUser } from "@core/auth/decorators/current-user.decorator"
import type { JwtPayload } from "@core/auth/strategies/jwt.strategy"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import { ChangePasswordDto } from "@santri/dto/setting/change-password.dto"
import {
	SantriMessageResponseDto,
	SantriSettingPageResponseDto,
	SantriSettingToggle2faResponseDto,
} from "@santri/dto/setting/setting-response.dto"
import { Toggle2faDto } from "@santri/dto/setting/toggle-2fa.dto"
import { ActiveStudentGuard } from "@santri/guards/active-student.guard"
import { SantriJwtAuthGuard } from "@santri/guards/santri-jwt-auth.guard"
import { SettingService } from "@santri/setting/setting.service"

@ApiTags("Santri — Setting")
@ApiBearerAuth()
@UseGuards(SantriJwtAuthGuard, ActiveStudentGuard)
@Controller("santri/setting")
export class SettingController {
	constructor(private readonly settingService: SettingService) {}

	@Get()
	@ApiOperation({ summary: "Data halaman pengaturan akun santri (Email status, 2FA status)" })
	@ApiResponseWrapped({
		status: 200,
		description: "Data pengaturan akun santri berhasil dimuat",
		type: SantriSettingPageResponseDto,
	})
	async getSettingPage(@CurrentUser() user: JwtPayload) {
		return this.settingService.getSettingPage(user.sub)
	}

	@Patch("password")
	@ApiOperation({ summary: "Ubah password akun santri" })
	@ApiResponseWrapped({
		status: 200,
		description: "Password berhasil diperbarui",
		type: SantriMessageResponseDto,
	})
	async changePassword(
		@CurrentUser() user: JwtPayload,
		@Body() dto: ChangePasswordDto,
	) {
		return this.settingService.changePassword(user.sub, dto)
	}

	@Patch("2fa")
	@ApiOperation({ summary: "Aktifkan atau nonaktifkan autentikasi 2FA via email" })
	@ApiResponseWrapped({
		status: 200,
		description: "Status 2FA berhasil diperbarui",
		type: SantriSettingToggle2faResponseDto,
	})
	async toggle2fa(
		@CurrentUser() user: JwtPayload,
		@Body() dto: Toggle2faDto,
	) {
		return this.settingService.toggle2fa(user.sub, dto)
	}

	@Get("email/resend")
	@ApiOperation({ summary: "Kirim ulang email verifikasi ke akun santri" })
	@ApiResponseWrapped({
		status: 200,
		description: "Email verifikasi berhasil dikirim ulang",
		type: SantriMessageResponseDto,
	})
	async resendVerification(@CurrentUser() user: JwtPayload) {
		return this.settingService.resendVerification(user.sub)
	}
}

