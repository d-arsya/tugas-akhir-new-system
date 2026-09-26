import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"

import { CurrentUser } from "@core/auth/decorators/current-user.decorator"
import { Roles } from "@core/auth/decorators/roles.decorator"
import { RolesGuard } from "@core/auth/guards/roles.guard"
import { JwtAuthGuard } from "@core/auth/guards/jwt-auth.guard"
import type { JwtPayload } from "@core/auth/strategies/jwt.strategy"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import { AdminProfileService, type MyProfile } from "@admin/auth/admin-profile.service"
import { MyProfileDto, MyProfileUpdateDto } from "@admin/auth/dto/admin-profile.dto"
import { AdminMessageResponseDto } from "@admin/common/admin-response.dto"

// WS-B: legacy MyprofileController (setting.myProfile)
@ApiTags("Admin — Profil Saya")
@ApiBearerAuth("JWT-Auth")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin", "Admin", "Bendahara", "Kasir E-Wallet")
@Controller("admin/auth/profile")
export class AdminProfileController {
	constructor(private readonly adminProfileService: AdminProfileService) {}

	@Get()
	@ApiOperation({ summary: "Profil admin yang sedang login" })
	@ApiResponseWrapped({ status: 200, description: "Data profil", type: MyProfileDto })
	async getProfile(@CurrentUser() user: JwtPayload): Promise<MyProfile> {
		return this.adminProfileService.getProfile(user.sub)
	}

	@Patch()
	@ApiOperation({ summary: "Ubah nama, jenis kelamin dan kata sandi sendiri" })
	@ApiResponseWrapped({ status: 200, description: "Data berhasil diupdate", type: AdminMessageResponseDto })
	async updateProfile(
		@CurrentUser() user: JwtPayload,
		@Body() dto: MyProfileUpdateDto,
	): Promise<{ message: string }> {
		return this.adminProfileService.updateProfile(user.sub, dto)
	}
}
