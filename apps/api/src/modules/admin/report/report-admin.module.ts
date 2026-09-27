import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"

import { Accountancy } from "@admin/common/entities/accountancy.entity"
import { AdminReportExportService } from "@admin/report/admin-report-export.service"
import { AdminReportController } from "@admin/report/admin-report.controller"
import { AdminReportService } from "@admin/report/admin-report.service"
import { Grade } from "@shared/master/entities/grade.entity"
import { SubGrade } from "@shared/master/entities/sub-grade.entity"

@Module({
	imports: [TypeOrmModule.forFeature([Grade, SubGrade, Accountancy])],
	controllers: [AdminReportController],
	providers: [AdminReportService, AdminReportExportService],
})
export class ReportAdminModule {}
