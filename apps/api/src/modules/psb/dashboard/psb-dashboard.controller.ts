import { Controller, Get, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { CurrentUser } from "@core/auth/decorators/current-user.decorator"
import { ActiveMemberGuard } from "@psb/guards/active-member.guard"
import { PsbJwtAuthGuard } from "@psb/guards/psb-jwt-auth.guard"
import { DashboardResponseDto } from "@psb/dto/dashboard/dashboard-response.dto"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import { PsbDashboardService } from "@psb/dashboard/psb-dashboard.service"
import type { JwtPayload } from "@core/auth/strategies/jwt.strategy"

@ApiTags("PSB — Dashboard")
@ApiBearerAuth()
@Controller("psb/dashboard")
@UseGuards(PsbJwtAuthGuard, ActiveMemberGuard)
export class PsbDashboardController {
	constructor(private readonly psbDashboardService: PsbDashboardService) {}

	@Get()
	@ApiOperation({ summary: "Ambil ringkasan status pendaftaran, catatan verifikasi, dan pengumuman sekolah" })
	@ApiResponseWrapped({ status: 200, description: "Data dashboard pendaftar berhasil dimuat", type: DashboardResponseDto })
	@ApiResponse({ status: 401, description: "Token tidak valid atau tidak memiliki akses PSB" })
	async getDashboard(@CurrentUser() user: JwtPayload): Promise<DashboardResponseDto> {
		const res = await this.psbDashboardService.getDashboard(user.sub)
		return {
			registrant: res.registrant as any,
			school: res.school as any,
			announcement: res.announcement as any,
			statusInfo: {
				status: res.statusInfo.status,
				label: res.statusInfo.label,
				description: res.statusInfo.description ?? undefined,
			},
		}
	}
}
