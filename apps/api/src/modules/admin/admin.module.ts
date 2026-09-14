import { Module } from "@nestjs/common"
import { JwtModule } from "@nestjs/jwt"
import { TypeOrmModule } from "@nestjs/typeorm"
import { IpBanModule } from "../../core/ip-ban/ip-ban.module"

// Domain Modules for Modular Monolith Decoupling
import { MasterModule } from "../../shared/master/master.module"
import { SchoolModule } from "../../shared/school/school.module"
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

// Services
import { AdminAuthService } from "./services/admin-auth.service"
import { UserManagementService } from "./services/user-management.service"
import { AuthLogService } from "./services/auth-log.service"
import { AdminSettingsService } from "./services/admin-settings.service"
import { AcademicYearService } from "./services/academic-year.service"
import { LevelService } from "./services/level.service"
import { MajorService } from "./services/major.service"
import { GradeService } from "./services/grade.service"
import { SubGradeService } from "./services/sub-grade.service"
import { PsbAdminService } from "./services/psb-admin.service"
import { StudentAdminService } from "./services/student-admin.service"
import { AdminDashboardService } from "./services/admin-dashboard.service"
import { BillingAdminService } from "./services/billing-admin.service"
import { EwalletAdminService } from "./services/ewallet-admin.service"
import { AlumniAdminService } from "./services/alumni-admin.service"
import { MerchantAdminService } from "./services/merchant-admin.service"

// Controllers
import { AdminAuthController } from "./controllers/admin-auth.controller"
import { UserManagementController } from "./controllers/user-management.controller"
import { AuthLogController } from "./controllers/auth-log.controller"
import { AdminIpBanController } from "./controllers/ip-ban.controller"
import { AdminSettingsController } from "./controllers/admin-settings.controller"
import { AcademicYearController } from "./controllers/academic-year.controller"
import { LevelController } from "./controllers/level.controller"
import { MajorController } from "./controllers/major.controller"
import { GradeController } from "./controllers/grade.controller"
import { SubGradeController } from "./controllers/sub-grade.controller"
import { PsbAdminController } from "./controllers/psb-admin.controller"
import { StudentAdminController } from "./controllers/student-admin.controller"
import { AdminDashboardController } from "./controllers/admin-dashboard.controller"
import { BillingAdminController } from "./controllers/billing-admin.controller"
import { EwalletAdminController } from "./controllers/ewallet-admin.controller"
import { AlumniAdminController } from "./controllers/alumni-admin.controller"
import { MerchantAdminController } from "./controllers/merchant-admin.controller"

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
