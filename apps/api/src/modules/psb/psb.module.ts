import { Module } from "@nestjs/common"
import { JwtModule } from "@nestjs/jwt"
import { TypeOrmModule } from "@nestjs/typeorm"
import { PsbAuthController } from "@psb/auth/psb-auth.controller"
import { PsbAuthService } from "@psb/auth/psb-auth.service"
import { PsbDashboardController } from "@psb/dashboard/psb-dashboard.controller"
import { PsbDashboardService } from "@psb/dashboard/psb-dashboard.service"
import { AcademicYear } from "@shared/master/entities/academic-year.entity"
import { DiseaseHistory } from "@psb/entities/disease-history.entity"
import { Level } from "@shared/master/entities/level.entity"
import { RegistrantPasswordReset } from "@psb/entities/registrant-password-reset.entity"
import { Registrant } from "@psb/entities/registrant.entity"
import { SettingAnnc } from "@psb/entities/setting-annc.entity"
import { SettingForm } from "@psb/entities/setting-form.entity"
import { SettingSchool } from "@shared/school/entities/setting-school.entity"
import { TwoFactorRegistrant } from "@psb/entities/two-factor-registrant.entity"
import { AcademicDataGuard } from "@psb/guards/academic-data.guard"
import { ActiveMemberGuard } from "@psb/guards/active-member.guard"
import { PsbJwtAuthGuard } from "@psb/guards/psb-jwt-auth.guard"
import { PsbInvalidController } from "@psb/invalid/psb-invalid.controller"
import { PsbInvalidService } from "@psb/invalid/psb-invalid.service"
import { PsbPrintController } from "@psb/print/psb-print.controller"
import { PsbPrintService } from "@psb/print/psb-print.service"
import { PsbRegisterController } from "@psb/register/psb-register.controller"
import { PsbRegisterService } from "@psb/register/psb-register.service"
import { PsbSettingController } from "@psb/setting/psb-setting.controller"
import { PsbSettingService } from "@psb/setting/psb-setting.service"

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Registrant,
			TwoFactorRegistrant,
			RegistrantPasswordReset,
			DiseaseHistory,
			SettingSchool,
			SettingForm,
			SettingAnnc,
			AcademicYear,
			Level,
		]),
		JwtModule.register({}),
	],
	controllers: [
		PsbAuthController,
		PsbRegisterController,
		PsbDashboardController,
		PsbInvalidController,
		PsbPrintController,
		PsbSettingController,
	],
	providers: [
		PsbAuthService,
		PsbRegisterService,
		PsbDashboardService,
		PsbInvalidService,
		PsbPrintService,
		PsbSettingService,
		AcademicDataGuard,
		ActiveMemberGuard,
		PsbJwtAuthGuard,
	],
	exports: [TypeOrmModule, PsbAuthService, PsbRegisterService],
})
export class PsbModule {}
