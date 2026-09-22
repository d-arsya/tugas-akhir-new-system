import { Module } from "@nestjs/common"
import { JwtModule } from "@nestjs/jwt"
import { TypeOrmModule } from "@nestjs/typeorm"
import { IpBanModule } from "@core/ip-ban/ip-ban.module"

// Domain Modules for Modular Monolith Decoupling
import { MasterModule } from "@shared/master/master.module"
import { SchoolModule } from "@shared/school/school.module"
import { PsbModule } from "../psb/psb.module"
import { SantriModule } from "../santri/santri.module"
import { MerchantModule } from "../merchant/merchant.module"
import { EwalletModule } from "../ewallet/ewallet.module"

// Admin Entities
import { User } from "./entities/user.entity"
import { AuthLog } from "./entities/auth-log.entity"
import { Accountancy } from "./entities/accountancy.entity"
import { StudentCostTerm } from "./entities/student-cost-term.entity"
import { StudentCost } from "./entities/student-cost.entity"
import { Alumni } from "./entities/alumni.entity"

// Feature Services & Controllers
import { AdminAuthService } from "@admin/auth/admin-auth.service"
import { UserManagementService } from "@admin/auth/user-management.service"
import { AuthLogService } from "@admin/auth/auth-log.service"
import { AdminAuthController } from "@admin/auth/admin-auth.controller"
import { UserManagementController } from "@admin/auth/user-management.controller"
import { AuthLogController } from "@admin/auth/auth-log.controller"
import { AdminIpBanController } from "@admin/auth/ip-ban.controller"

import { AdminDashboardService } from "@admin/dashboard/admin-dashboard.service"
import { AdminDashboardController } from "@admin/dashboard/admin-dashboard.controller"

import { AdminSettingsService } from "@admin/setting/admin-settings.service"
import { AdminSettingsController } from "@admin/setting/admin-settings.controller"

import { AcademicYearService } from "@admin/academic/academic-year.service"
import { LevelService } from "@admin/academic/level.service"
import { MajorService } from "@admin/academic/major.service"
import { GradeService } from "@admin/academic/grade.service"
import { SubGradeService } from "@admin/academic/sub-grade.service"
import { AcademicYearController } from "@admin/academic/academic-year.controller"
import { LevelController } from "@admin/academic/level.controller"
import { MajorController } from "@admin/academic/major.controller"
import { GradeController } from "@admin/academic/grade.controller"
import { SubGradeController } from "@admin/academic/sub-grade.controller"

import { PsbAdminService } from "@admin/psb/psb-admin.service"
import { PsbAdminController } from "@admin/psb/psb-admin.controller"

import { StudentAdminService } from "@admin/student/student-admin.service"
import { StudentAdminController } from "@admin/student/student-admin.controller"

import { AdminReportService } from "@admin/report/admin-report.service"
import { AdminReportExportService } from "@admin/report/admin-report-export.service"
import { AdminReportController } from "@admin/report/admin-report.controller"

import { BillingAdminService } from "@admin/billing/billing-admin.service"
import { BillingAdminController } from "@admin/billing/billing-admin.controller"

import { EwalletAdminService } from "@admin/ewallet/ewallet-admin.service"
import { EwalletAdminController } from "@admin/ewallet/ewallet-admin.controller"

import { AlumniAdminService } from "@admin/alumni/alumni-admin.service"
import { AlumniAdminController } from "@admin/alumni/alumni-admin.controller"

import { MerchantAdminService } from "@admin/merchant/merchant-admin.service"
import { MerchantAdminController } from "@admin/merchant/merchant-admin.controller"

@Module({
	imports: [
		TypeOrmModule.forFeature([
			User,
			AuthLog,
			Accountancy,
			StudentCostTerm,
			StudentCost,
			Alumni,
		]),
		JwtModule.register({}),
		IpBanModule,
		MasterModule,
		SchoolModule,
		PsbModule,
		SantriModule,
		MerchantModule,
		EwalletModule,
	],
	controllers: [
		AdminAuthController,
		UserManagementController,
		AuthLogController,
		AdminIpBanController,
		AdminSettingsController,
		AcademicYearController,
		LevelController,
		MajorController,
		GradeController,
		SubGradeController,
		PsbAdminController,
		StudentAdminController,
		AdminDashboardController,
		BillingAdminController,
		AdminReportController,
		EwalletAdminController,
		AlumniAdminController,
		MerchantAdminController,
	],
	providers: [
		AdminAuthService,
		UserManagementService,
		AuthLogService,
		AdminSettingsService,
		AcademicYearService,
		LevelService,
		MajorService,
		GradeService,
		SubGradeService,
		PsbAdminService,
		StudentAdminService,
		AdminDashboardService,
		BillingAdminService,
		AdminReportService,
		AdminReportExportService,
		EwalletAdminService,
		AlumniAdminService,
		MerchantAdminService,
	],
	exports: [
		AdminAuthService,
		UserManagementService,
		AcademicYearService,
		LevelService,
		PsbAdminService,
		StudentAdminService,
		AdminDashboardService,
		BillingAdminService,
		EwalletAdminService,
		AlumniAdminService,
		MerchantAdminService,
	],
})
export class AdminModule {}
