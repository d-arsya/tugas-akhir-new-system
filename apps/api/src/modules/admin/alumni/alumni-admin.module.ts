import { Module } from "@nestjs/common"

import { AlumniAdminController } from "@admin/alumni/alumni-admin.controller"
import { AlumniAdminService } from "@admin/alumni/alumni-admin.service"
import { AlumniWriteService } from "@admin/alumni/alumni-write.service"

@Module({
	controllers: [AlumniAdminController],
	providers: [AlumniAdminService, AlumniWriteService],
})
export class AlumniAdminModule {}
