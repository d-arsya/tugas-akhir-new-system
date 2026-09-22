import { Controller, Get, Query, Res, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiProduces, ApiTags } from "@nestjs/swagger"
import type { Response } from "express"
import { Roles } from "@core/auth/decorators/roles.decorator"
import { JwtAuthGuard } from "@core/auth/guards/jwt-auth.guard"
import { RolesGuard } from "@core/auth/guards/roles.guard"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import {
	AdminReportService,
	type ArrearPage,
	type IncomeDetailPage,
	type IncomeRecap,
	type ReportOptions,
} from "@admin/report/admin-report.service"
import { AdminReportExportService, type ReportFile } from "@admin/report/admin-report-export.service"
import {
	ArrearFilterDto,
	ArrearQueryDto,
	ArrearRowDto,
	IncomeDetailQueryDto,
	IncomeDetailRowDto,
	IncomeFilterDto,
	IncomeRecapResponseDto,
	ReportOptionsResponseDto,
} from "@admin/dto/admin-report.dto"

const XLSX_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

// Streams the workbook directly, bypassing the JSON TransformInterceptor
const sendFile = (res: Response, file: ReportFile): void => {
	res.setHeader("Content-Type", XLSX_TYPE)
	res.setHeader(
		"Content-Disposition",
		`attachment; filename="${file.fileName}"; filename*=UTF-8''${encodeURIComponent(file.fileName)}`,
	)
	res.send(file.buffer)
}

// Legacy `report` route group behind the `asBendahara` middleware (Superadmin & Bendahara)
@ApiTags("Admin — Laporan")
@Controller("admin/reports")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin", "Bendahara")
@ApiBearerAuth("JWT-Auth")
export class AdminReportController {
	constructor(
		private readonly reportService: AdminReportService,
		private readonly exportService: AdminReportExportService,
	) {}

	@Get("options")
	@ApiOperation({ summary: "Pilihan filter laporan (tahun ajaran, kelas, subkelas, nama biaya)" })
	@ApiResponseWrapped({ status: 200, description: "Pilihan filter laporan", type: ReportOptionsResponseDto })
	async getOptions(): Promise<ReportOptions> {
		return this.reportService.getOptions()
	}

	@Get("income/detail")
	@ApiOperation({ summary: "Laporan pemasukkan — rincian transaksi" })
	@ApiResponseWrapped({ status: 200, description: "Rincian pemasukkan", type: IncomeDetailRowDto, isPaginated: true })
	async getIncomeDetail(@Query() query: IncomeDetailQueryDto): Promise<IncomeDetailPage> {
		return this.reportService.getIncomeDetail(query)
	}

	@Get("income/detail/export")
	@ApiOperation({ summary: "Export rincian pemasukkan (xlsx)" })
	@ApiProduces(XLSX_TYPE)
	async exportIncomeDetail(@Query() query: IncomeFilterDto, @Res() res: Response): Promise<void> {
		sendFile(res, await this.exportService.exportDetail(query))
	}

	@Get("income/recap")
	@ApiOperation({ summary: "Laporan pemasukkan — rekapitulasi per nama biaya" })
	@ApiResponseWrapped({ status: 200, description: "Rekapitulasi pemasukkan", type: IncomeRecapResponseDto })
	async getIncomeRecap(@Query() query: IncomeFilterDto): Promise<IncomeRecap> {
		return this.reportService.getIncomeRecap(query)
	}

	@Get("income/recap/export")
	@ApiOperation({ summary: "Export rekapitulasi pemasukkan (xlsx)" })
	@ApiProduces(XLSX_TYPE)
	async exportIncomeRecap(@Query() query: IncomeFilterDto, @Res() res: Response): Promise<void> {
		sendFile(res, await this.exportService.exportRecap(query))
	}

	@Get("arrears")
	@ApiOperation({ summary: "Laporan tunggakan" })
	@ApiResponseWrapped({ status: 200, description: "Laporan tunggakan", type: ArrearRowDto, isPaginated: true })
	async getArrears(@Query() query: ArrearQueryDto): Promise<ArrearPage> {
		return this.reportService.getArrears(query)
	}

	@Get("arrears/export")
	@ApiOperation({ summary: "Export laporan tunggakan (xlsx)" })
	@ApiProduces(XLSX_TYPE)
	async exportArrears(@Query() query: ArrearFilterDto, @Res() res: Response): Promise<void> {
		sendFile(res, await this.exportService.exportArrear(query))
	}
}
