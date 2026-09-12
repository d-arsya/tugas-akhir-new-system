import {
	Body,
	Controller,
	Get,
	Patch,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger"
import { CurrentUser } from "@core/auth/decorators/current-user.decorator"
import type { JwtPayload } from "@core/auth/strategies/jwt.strategy"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import { MerchantMessageResponseDto } from "@merchant/dto/auth"
import {
	MerchantChangePasswordDto,
	MerchantSettingOverviewDto,
	Toggle2faDto,
	Toggle2faResponseDto,
	UpdateMerchantProfileDto,
	UpdateProfileResponseDto,
} from "@merchant/dto/setting"
import { ActiveMerchantGuard } from "@merchant/guards/active-merchant.guard"
import { MerchantJwtAuthGuard } from "@merchant/guards/merchant-jwt-auth.guard"
import { MerchantSettingService } from "@merchant/setting/merchant-setting.service"

@ApiTags("Merchant — Settings")
@ApiBearerAuth()
@UseGuards(MerchantJwtAuthGuard, ActiveMerchantGuard)
@Controller("merchant/setting")
export class MerchantSettingController {
	constructor(private readonly merchantSettingService: MerchantSettingService) {}

	@Get()
	@ApiOperation({ summary: "Ambil informasi pengaturan merchant" })
	@ApiResponseWrapped({
		status: 200,
		description: "Pengaturan merchant berhasil dimuat",
		type: MerchantSettingOverviewDto,
	})
	async getSettingData(@CurrentUser() user: JwtPayload) {
		return this.merchantSettingService.getSettingData(user.sub)
	}

	@Patch("profile")
	@UseInterceptors(FileInterceptor("merchantPhoto"))
	@ApiConsumes("multipart/form-data")
	@ApiOperation({ summary: "Perbarui profil merchant (nama toko, telepon, alamat, foto)" })
	@ApiResponseWrapped({
		status: 200,
		description: "Profil merchant berhasil diperbarui",
		type: UpdateProfileResponseDto,
	})
	async updateProfile(
		@CurrentUser() user: JwtPayload,
		@Body() dto: UpdateMerchantProfileDto,
		@UploadedFile() file?: Express.Multer.File,
	) {
		return this.merchantSettingService.updateProfile(user.sub, dto, file)
	}

	@Patch("password")
	@ApiOperation({ summary: "Ubah password akun merchant" })
	@ApiResponseWrapped({
		status: 200,
		description: "Password merchant berhasil diperbarui",
		type: MerchantMessageResponseDto,
	})
	async changePassword(
		@CurrentUser() user: JwtPayload,
		@Body() dto: MerchantChangePasswordDto,
	) {
		return this.merchantSettingService.changePassword(user.sub, dto)
	}

	@Patch("2fa")
	@ApiOperation({ summary: "Aktifkan atau nonaktifkan 2FA merchant" })
	@ApiResponseWrapped({
		status: 200,
		description: "Pengaturan 2FA berhasil diperbarui",
		type: Toggle2faResponseDto,
	})
	async toggle2fa(
		@CurrentUser() user: JwtPayload,
		@Body() dto: Toggle2faDto,
	) {
		return this.merchantSettingService.toggle2fa(user.sub, dto)
	}

	@Get("email/resend")
	@ApiOperation({ summary: "Kirim ulang email verifikasi merchant" })
	@ApiResponseWrapped({
		status: 200,
		description: "Email verifikasi berhasil dikirim",
		type: MerchantMessageResponseDto,
	})
	async resendVerification(@CurrentUser() user: JwtPayload) {
		return this.merchantSettingService.resendVerification(user.sub)
	}
}
