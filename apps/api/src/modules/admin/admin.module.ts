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

import { AcademicYearAdminService } from "@admin/academic/academic-year-admin.service"
import { AcademicYearAdminController } from "@admin/academic/academic-year-admin.controller"
import { AcademicYearDeleteService } from "@admin/academic/academic-year-delete.service"
import { AcademicYearDeleteController } from "@admin/academic/academic-year-delete.controller"
import { LevelAdminService } from "@admin/academic/level-admin.service"
import { LevelAdminController } from "@admin/academic/level-admin.controller"
import { MajorAdminService } from "@admin/academic/major-admin.service"
import { MajorAdminController } from "@admin/academic/major-admin.controller"
import { GradeAdminService } from "@admin/academic/grade-admin.service"
import { GradeAdminController } from "@admin/academic/grade-admin.controller"
import { SubGradeAdminService } from "@admin/academic/sub-grade-admin.service"
import { SubGradeAdminController } from "@admin/academic/sub-grade-admin.controller"

import { AccountancyAdminService } from "@admin/billing/accountancy-admin.service"
import { AccountancyAdminController } from "@admin/billing/accountancy-admin.controller"
import { StudentCostAdminService } from "@admin/billing/student-cost-admin.service"
import { StudentCostAdminController } from "@admin/billing/student-cost-admin.controller"
import { MerchantAdminService } from "@admin/merchant/merchant-admin.service"
import { MerchantAdminController } from "@admin/merchant/merchant-admin.controller"

import { PsbAdminService } from "@admin/psb/psb-admin.service"
import { PsbAdminController } from "@admin/psb/psb-admin.controller"

import { StudentAdminService } from "@admin/student/student-admin.service"
import { StudentAdminController } from "@admin/student/student-admin.controller"

import { AdminReportService } from "@admin/report/admin-report.service"
import { AdminReportExportService } from "@admin/report/admin-report-export.service"
import { AdminReportController } from "@admin/report/admin-report.controller"

import { EwalletAdminService } from "@admin/ewallet/ewallet-admin.service"
import { EwalletAdminController } from "@admin/ewallet/ewallet-admin.controller"

import { AlumniAdminService } from "@admin/alumni/alumni-admin.service"
import { AlumniAdminController } from "@admin/alumni/alumni-admin.controller"


import { InvoiceAdminController } from "@admin/payments/invoice-admin.controller"
import { InvoiceAdminService } from "@admin/payments/invoice-admin.service"
import { PaymentAdminController } from "@admin/payments/payment-admin.controller"
import { PaymentAdminService } from "@admin/payments/payment-admin.service"
import { TransactionAdminController } from "@admin/payments/transaction-admin.controller"
import { TransactionAdminService } from "@admin/payments/transaction-admin.service"

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
		InvoiceAdminController,
		PaymentAdminController,
		TransactionAdminController,
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
		AcademicYearAdminController,
		AcademicYearDeleteController,
		LevelAdminController,
		MajorAdminController,
		GradeAdminController,
		SubGradeAdminController,
		AccountancyAdminController,
		StudentCostAdminController,
		MerchantAdminController,
		PsbAdminController,
		StudentAdminController,
		AdminDashboardController,
		AdminReportController,
		EwalletAdminController,
		AlumniAdminController,
	],
	providers: [
		InvoiceAdminService,
		PaymentAdminService,
		TransactionAdminService,
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
		AcademicYearAdminService,
		AcademicYearDeleteService,
		LevelAdminService,
		MajorAdminService,
		GradeAdminService,
		SubGradeAdminService,
		AccountancyAdminService,
		StudentCostAdminService,
		MerchantAdminService,
		PsbAdminService,
		StudentAdminService,
		AdminDashboardService,
		AdminReportService,
		AdminReportExportService,
		EwalletAdminService,
		AlumniAdminService,
	],
	exports: [
		AdminAuthService,
		AcademicYearAdminService,
		AcademicYearDeleteService,
		LevelAdminService,
		MajorAdminService,
		GradeAdminService,
		SubGradeAdminService,
		AccountancyAdminService,
		StudentCostAdminService,
		MerchantAdminService,
		PsbAdminService,
		StudentAdminService,
		AdminDashboardService,
		EwalletAdminService,
		AlumniAdminService,
	],
})
export class AdminModule {}
