import { Controller, Get, Query, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import { Roles } from "@core/auth/decorators/roles.decorator"
import { JwtAuthGuard } from "@core/auth/guards/jwt-auth.guard"
import { RolesGuard } from "@core/auth/guards/roles.guard"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import { AdminDashboardService } from "@admin/dashboard/admin-dashboard.service"
import {
	DashboardStatsFilterDto,
	DashboardChartFilterDto,
	DashboardStatsResponseDto,
	DashboardChartResponseDto,
	DashboardPieResponseDto,
} from "@admin/dto/admin-dashboard.dto"

@ApiTags("Admin — Dashboard")
@Controller("admin/dashboard")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin", "Admin")
@ApiBearerAuth("JWT-Auth")
export class AdminDashboardController {
	constructor(private readonly dashboardService: AdminDashboardService) {}

	@Get("stats")
	@ApiOperation({ summary: "Ringkasan statistik dashboard (PSB & Santri)" })
	@ApiResponseWrapped({
		status: 200,
		description: "Data statistik dashboard",
		type: DashboardStatsResponseDto,
	})
	async getStats(@Query() query: DashboardStatsFilterDto) {
		return this.dashboardService.getStats(query.academicYearId)
	}

	@Get("chart-student")
	@ApiOperation({ summary: "Grafik bar jumlah santri per tahun ajaran" })
	@ApiResponseWrapped({
		status: 200,
		description: "Data grafik bar santri",
		type: DashboardChartResponseDto,
	})
	async getChartStudent(@Query() query: DashboardChartFilterDto) {
		return this.dashboardService.getChartStudent(query.gradeId)
	}

	@Get("pie-chart")
	@ApiOperation({ summary: "Distribusi santri per kelas (tahun ajaran aktif)" })
	@ApiResponseWrapped({
		status: 200,
		description: "Data pie chart santri per kelas",
		type: DashboardPieResponseDto,
	})
	async getPieChart() {
		return this.dashboardService.getPieChart()
	}
}
