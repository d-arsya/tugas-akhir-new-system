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
import { Setting } from "./entities/setting.entity"
import { SettingAnnc } from "../psb/entities/setting-annc.entity"
import { SettingForm } from "../psb/entities/setting-form.entity"
import { SettingSchool } from "../../shared/school/entities/setting-school.entity"

// Feature Services & Controllers
import { AdminAuthService } from "@admin/auth/admin-auth.service"
import { AuthLogWriter } from "@admin/auth/auth-log.writer"
import { AuthLogScheduler } from "@admin/auth/auth-log.scheduler"
import { AuthLogService } from "@admin/auth/auth-log.service"
import { AdminAuthController } from "@admin/auth/admin-auth.controller"
import { AuthLogController } from "@admin/auth/auth-log.controller"
import { AdminIpBanController } from "@admin/auth/ip-ban.controller"
import { AdminCreatePasswordService } from "@admin/auth/admin-create-password.service"
import { AdminCreatePasswordController } from "@admin/auth/admin-create-password.controller"
import { AdminProfileService } from "@admin/auth/admin-profile.service"
import { AdminProfileController } from "@admin/auth/admin-profile.controller"
import { AdminUserService } from "@admin/user/admin-user.service"
import { AdminUserController } from "@admin/user/admin-user.controller"

import { AdminDashboardService } from "@admin/dashboard/admin-dashboard.service"
import { AdminDashboardController } from "@admin/dashboard/admin-dashboard.controller"

import { AdminSchoolService } from "@admin/setting/admin-school.service"
import { AdminSchoolController } from "@admin/setting/admin-school.controller"
import { AdminAnnouncementService } from "@admin/setting/admin-announcement.service"
import { AdminAnnouncementController } from "@admin/setting/admin-announcement.controller"
import { AdminSettingFormService } from "@admin/setting/admin-setting-form.service"
import { AdminSettingFormController } from "@admin/setting/admin-setting-form.controller"
import { AdminSystemSettingService } from "@admin/setting/admin-system-setting.service"
import { AdminSystemSettingController } from "@admin/setting/admin-system-setting.controller"

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
			Setting,
			SettingAnnc,
			SettingForm,
			SettingSchool,
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
		AdminCreatePasswordController,
		AdminProfileController,
		AdminUserController,
		AuthLogController,
		AdminIpBanController,
		AdminSchoolController,
		AdminAnnouncementController,
		AdminSettingFormController,
		AdminSystemSettingController,
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
		AuthLogWriter,
		AuthLogScheduler,
		AdminCreatePasswordService,
		AdminProfileService,
		AdminUserService,
		AuthLogService,
		AdminSchoolService,
		AdminAnnouncementService,
		AdminSettingFormService,
		AdminSystemSettingService,
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
