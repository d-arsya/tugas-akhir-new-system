import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"

import { RegistrantAdminController } from "@admin/registrant/registrant-admin.controller"
import { RegistrantAdminService } from "@admin/registrant/registrant-admin.service"
import { RegistrantFormController } from "@admin/registrant/registrant-form.controller"
import { RegistrantMailService } from "@admin/registrant/registrant-mail.service"
import { RegistrantStatusService } from "@admin/registrant/registrant-status.service"
import { RegistrantWriteService } from "@admin/registrant/registrant-write.service"
import { Registrant } from "@psb/entities/registrant.entity"
import { Student } from "@santri/entities/student.entity"
import { AcademicYear } from "@shared/master/entities/academic-year.entity"
import { LevelAcademicYear } from "@shared/master/entities/level-academic-year.entity"
import { Level } from "@shared/master/entities/level.entity"
import { SettingSchool } from "@shared/school/entities/setting-school.entity"

@Module({
	imports: [TypeOrmModule.forFeature([Level, AcademicYear, LevelAcademicYear, Registrant, Student, SettingSchool])],
	// RegistrantFormController first: its literal `create/…` paths must win over `:registrantId`
	controllers: [RegistrantFormController, RegistrantAdminController],
	providers: [RegistrantAdminService, RegistrantWriteService, RegistrantStatusService, RegistrantMailService],
})
export class RegistrantAdminModule {}
