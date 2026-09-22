import { Controller, Get, Query, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import { Roles } from "@core/auth/decorators/roles.decorator"
import { JwtAuthGuard } from "@core/auth/guards/jwt-auth.guard"
import { RolesGuard } from "@core/auth/guards/roles.guard"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import {
	AdminDashboardService,
	type DashboardChartItem,
	type DashboardOptions,
	type DashboardPieItem,
	type DashboardStats,
} from "@admin/dashboard/admin-dashboard.service"
import {
	DashboardChartFilterDto,
	DashboardChartItemDto,
	DashboardOptionsResponseDto,
	DashboardPieItemDto,
	DashboardStatsFilterDto,
	DashboardStatsResponseDto,
} from "@admin/dto/admin-dashboard.dto"

// Legacy: the dashboard page is open to every non-cashier role, while the chart
// endpoints sit behind `asAdmin` (Superadmin/Admin only)
@ApiTags("Admin — Dashboard")
@Controller("admin/dashboard")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth("JWT-Auth")
export class AdminDashboardController {
	constructor(private readonly dashboardService: AdminDashboardService) {}

	@Get("stats")
	@Roles("Superadmin", "Admin", "Bendahara")
	@ApiOperation({ summary: "Statistik pendaftaran santri baru (total, diterima, tidak diterima)" })
	@ApiResponseWrapped({ status: 200, description: "Statistik PSB", type: DashboardStatsResponseDto })
	async getStats(@Query() query: DashboardStatsFilterDto): Promise<DashboardStats> {
		return this.dashboardService.getStats(query.academicYearId)
	}

	@Get("options")
	@Roles("Superadmin", "Admin", "Bendahara")
	@ApiOperation({ summary: "Pilihan filter dashboard (tahun ajaran & kelas)" })
	@ApiResponseWrapped({ status: 200, description: "Pilihan filter", type: DashboardOptionsResponseDto })
	async getOptions(): Promise<DashboardOptions> {
		return this.dashboardService.getOptions()
	}

	@Get("chart-student")
	@Roles("Superadmin", "Admin")
	@ApiOperation({ summary: "Jumlah santri per kelas selama 5 tahun ajaran terakhir" })
	@ApiResponseWrapped({ status: 200, description: "Data grafik garis", type: DashboardChartItemDto, isArray: true })
	async getChartStudent(@Query() query: DashboardChartFilterDto): Promise<DashboardChartItem[]> {
		return this.dashboardService.getChartStudent(query.grade)
	}

	@Get("pie-chart")
	@Roles("Superadmin", "Admin")
	@ApiOperation({ summary: "Distribusi santri aktif per kelas pada tahun ajaran berjalan" })
	@ApiResponseWrapped({ status: 200, description: "Data pie chart", type: DashboardPieItemDto, isArray: true })
	async getPieChart(): Promise<DashboardPieItem[]> {
		return this.dashboardService.getPieChart()
	}
}
