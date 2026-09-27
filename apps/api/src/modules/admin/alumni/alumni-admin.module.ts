import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"

import { AlumniAdminController } from "@admin/alumni/alumni-admin.controller"
import { AlumniAdminService } from "@admin/alumni/alumni-admin.service"
import { AlumniWriteService } from "@admin/alumni/alumni-write.service"
import { Alumni } from "@admin/common/entities/alumni.entity"
import { SettingForm } from "@psb/entities/setting-form.entity"

@Module({
	imports: [TypeOrmModule.forFeature([SettingForm, Alumni])],
	controllers: [AlumniAdminController],
	providers: [AlumniAdminService, AlumniWriteService],
})
export class AlumniAdminModule {}
