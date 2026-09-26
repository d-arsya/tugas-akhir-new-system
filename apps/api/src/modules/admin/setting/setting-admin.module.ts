import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"

import { AdminAnnouncementController } from "@admin/setting/admin-announcement.controller"
import { AdminAnnouncementService } from "@admin/setting/admin-announcement.service"
import { AdminSchoolController } from "@admin/setting/admin-school.controller"
import { AdminSchoolService } from "@admin/setting/admin-school.service"
import { AdminSettingFormController } from "@admin/setting/admin-setting-form.controller"
import { AdminSettingFormService } from "@admin/setting/admin-setting-form.service"
import { AdminSystemSettingController } from "@admin/setting/admin-system-setting.controller"
import { AdminSystemSettingService } from "@admin/setting/admin-system-setting.service"
import { Setting } from "@admin/setting/entities/setting.entity"
import { SettingAnnc } from "@shared/school/entities/setting-annc.entity"
import { SettingForm } from "@shared/school/entities/setting-form.entity"
import { SettingSchool } from "@shared/school/entities/setting-school.entity"

@Module({
	imports: [TypeOrmModule.forFeature([Setting, SettingSchool, SettingAnnc, SettingForm])],
	controllers: [
		AdminSchoolController,
		AdminAnnouncementController,
		AdminSettingFormController,
		AdminSystemSettingController,
	],
	providers: [AdminSchoolService, AdminAnnouncementService, AdminSettingFormService, AdminSystemSettingService],
})
export class SettingAdminModule {}
