import { Controller, Get, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import { CurrentUser } from "../../core/auth/decorators/current-user.decorator"
import type { JwtPayload } from "../../core/auth/strategies/jwt.strategy"
import { ActiveStudentGuard } from "../guards/active-student.guard"
import { SantriJwtAuthGuard } from "../guards/santri-jwt-auth.guard"
import { ProfileService } from "./profile.service"

@ApiTags("Santri — Profile")
@ApiBearerAuth()
@UseGuards(SantriJwtAuthGuard, ActiveStudentGuard)
@Controller("santri/profile")
export class ProfileController {
	constructor(private readonly profileService: ProfileService) {}

	@Get()
	@ApiOperation({ summary: "Informasi profil & data akademis santri" })
	async getProfile(@CurrentUser() user: JwtPayload) {
		return this.profileService.getProfile(user.sub)
	}
}
