import { Module } from "@nestjs/common"

import { AdminReportExportService } from "@admin/report/admin-report-export.service"
import { AdminReportController } from "@admin/report/admin-report.controller"
import { AdminReportService } from "@admin/report/admin-report.service"

@Module({
	controllers: [AdminReportController],
	providers: [AdminReportService, AdminReportExportService],
})
export class ReportAdminModule {}
