import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"

import { AdminDashboardController } from "@admin/dashboard/admin-dashboard.controller"
import { AdminDashboardService } from "@admin/dashboard/admin-dashboard.service"
import { Registrant } from "@psb/entities/registrant.entity"
import { StudentGrade } from "@santri/entities/student-grade.entity"
import { AcademicYear } from "@shared/master/entities/academic-year.entity"
import { Grade } from "@shared/master/entities/grade.entity"

@Module({
	imports: [TypeOrmModule.forFeature([Registrant, StudentGrade, AcademicYear, Grade])],
	controllers: [AdminDashboardController],
	providers: [AdminDashboardService],
})
export class DashboardAdminModule {}
