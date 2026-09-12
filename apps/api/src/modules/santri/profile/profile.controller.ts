import { Controller, Get, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import { CurrentUser } from "@core/auth/decorators/current-user.decorator"
import type { JwtPayload } from "@core/auth/strategies/jwt.strategy"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import { SantriProfileResponseDto } from "@santri/dto/profile/profile-response.dto"
import { ActiveStudentGuard } from "@santri/guards/active-student.guard"
import { SantriJwtAuthGuard } from "@santri/guards/santri-jwt-auth.guard"
import { ProfileService } from "@santri/profile/profile.service"

@ApiTags("Santri — Profile")
@ApiBearerAuth()
@UseGuards(SantriJwtAuthGuard, ActiveStudentGuard)
@Controller("santri/profile")
export class ProfileController {
	constructor(private readonly profileService: ProfileService) {}

	@Get()
	@ApiOperation({ summary: "Informasi profil & data akademis santri" })
	@ApiResponseWrapped({
		status: 200,
		description: "Informasi profil & data akademis santri",
		type: SantriProfileResponseDto,
	})
	async getProfile(@CurrentUser() user: JwtPayload) {
		return this.profileService.getProfile(user.sub)
	}
}

