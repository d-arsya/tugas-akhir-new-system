import { Controller, Get, Query, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"

import { Roles } from "@core/auth/decorators/roles.decorator"
import { JwtAuthGuard } from "@core/auth/guards/jwt-auth.guard"
import { RolesGuard } from "@core/auth/guards/roles.guard"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import { AuthLogService, type AuthLogPage } from "@admin/auth/auth-log.service"
import { AuthLogQueryDto, AuthLogResponseDto } from "@admin/auth/dto/auth-log.dto"

// Legacy `AuthLogController` — the constructor applies `can:do-as-superadmin`
@ApiTags("Admin — Auth Logs")
@Controller("admin/auth-logs")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin")
@ApiBearerAuth("JWT-Auth")
export class AuthLogController {
	constructor(private readonly authLogService: AuthLogService) {}

	@Get()
	@ApiOperation({ summary: "Daftar riwayat log aktivitas login admin" })
	@ApiResponseWrapped({ status: 200, description: "List auth logs", type: AuthLogResponseDto, isPaginated: true })
	async findAll(@Query() query: AuthLogQueryDto): Promise<AuthLogPage> {
		return this.authLogService.findAll(query)
	}
}
