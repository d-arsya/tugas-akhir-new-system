import { Module } from "@nestjs/common"

import { StudentAdminController } from "@admin/student/student-admin.controller"
import { StudentAdminService } from "@admin/student/student-admin.service"

@Module({
	controllers: [StudentAdminController],
	providers: [StudentAdminService],
})
export class StudentAdminModule {}
