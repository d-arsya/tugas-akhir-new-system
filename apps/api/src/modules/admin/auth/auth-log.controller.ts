import { Controller, Get, Query, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import { Roles } from "@core/auth/decorators/roles.decorator"
import { JwtAuthGuard } from "@core/auth/guards/jwt-auth.guard"
import { RolesGuard } from "@core/auth/guards/roles.guard"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import { PaginationQueryDto } from "@core/dto/pagination-query.dto"
import { AuthLogService } from "@admin/auth/auth-log.service"
import { AuthLogResponseDto } from "@admin/dto/auth-log.dto"

@ApiTags("Admin — Auth Logs")
@Controller("admin/auth-logs")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin", "Admin")
@ApiBearerAuth("JWT-Auth")
export class AuthLogController {
	constructor(private readonly authLogService: AuthLogService) {}

	@Get()
	@ApiOperation({ summary: "Daftar riwayat log aktivitas login admin" })
	@ApiResponseWrapped({ status: 200, description: "List auth logs", type: AuthLogResponseDto, isPaginated: true })
	async findAll(@Query() query: PaginationQueryDto) {
		return this.authLogService.findAll(query)
	}
}
