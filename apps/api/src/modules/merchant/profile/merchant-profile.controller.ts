import { Controller, Get, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import { CurrentUser } from "@core/auth/decorators/current-user.decorator"
import type { JwtPayload } from "@core/auth/strategies/jwt.strategy"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import { MerchantProfileResponseDto } from "@merchant/dto/profile"
import { ActiveMerchantGuard } from "@merchant/guards/active-merchant.guard"
import { MerchantJwtAuthGuard } from "@merchant/guards/merchant-jwt-auth.guard"
import { MerchantProfileService } from "@merchant/profile/merchant-profile.service"

@ApiTags("Merchant — Profile")
@ApiBearerAuth()
@UseGuards(MerchantJwtAuthGuard, ActiveMerchantGuard)
@Controller("merchant/profile")
export class MerchantProfileController {
	constructor(private readonly merchantProfileService: MerchantProfileService) {}

	@Get()
	@ApiOperation({ summary: "Ambil informasi profil merchant saat ini" })
	@ApiResponseWrapped({
		status: 200,
		description: "Profil merchant berhasil dimuat",
		type: MerchantProfileResponseDto,
	})
	async getProfile(@CurrentUser() user: JwtPayload) {
		return this.merchantProfileService.getProfile(user.sub)
	}
}
