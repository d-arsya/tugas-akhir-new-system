import { Module } from "@nestjs/common"
import { JwtModule } from "@nestjs/jwt"
import { TypeOrmModule } from "@nestjs/typeorm"
import { PsbAuthController } from "./auth/psb-auth.controller"
import { PsbAuthService } from "./auth/psb-auth.service"
import { PsbDashboardController } from "./dashboard/psb-dashboard.controller"
import { PsbDashboardService } from "./dashboard/psb-dashboard.service"
import { AcademicYear } from "./entities/academic-year.entity"
import { DiseaseHistory } from "./entities/disease-history.entity"
import { Level } from "./entities/level.entity"
import { RegistrantPasswordReset } from "./entities/registrant-password-reset.entity"
import { Registrant } from "./entities/registrant.entity"
import { SettingAnnc } from "./entities/setting-annc.entity"
import { SettingForm } from "./entities/setting-form.entity"
import { SettingSchool } from "./entities/setting-school.entity"
import { TwoFactorRegistrant } from "./entities/two-factor-registrant.entity"
import { AcademicDataGuard } from "./guards/academic-data.guard"
import { ActiveMemberGuard } from "./guards/active-member.guard"
import { PsbJwtAuthGuard } from "./guards/psb-jwt-auth.guard"
import { PsbInvalidController } from "./invalid/psb-invalid.controller"
import { PsbInvalidService } from "./invalid/psb-invalid.service"
import { PsbPrintController } from "./print/psb-print.controller"
import { PsbPrintService } from "./print/psb-print.service"
import { PsbRegisterController } from "./register/psb-register.controller"
import { PsbRegisterService } from "./register/psb-register.service"
import { PsbSettingController } from "./setting/psb-setting.controller"
import { PsbSettingService } from "./setting/psb-setting.service"

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
	exports: [PsbAuthService, PsbRegisterService],
})
export class PsbModule {}
