import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"

import { StudentAdminController } from "@admin/student/student-admin.controller"
import { StudentAdminService } from "@admin/student/student-admin.service"
import { Alumni } from "@admin/common/entities/alumni.entity"
import { SettingForm } from "@psb/entities/setting-form.entity"
import { Student } from "@santri/entities/student.entity"
import { StudentCapability } from "@santri/entities/student-capability.entity"
import { StudentGrade } from "@santri/entities/student-grade.entity"
import { AcademicYear } from "@shared/master/entities/academic-year.entity"
import { Grade } from "@shared/master/entities/grade.entity"
import { Level } from "@shared/master/entities/level.entity"
import { Major } from "@shared/master/entities/major.entity"
import { SubGrade } from "@shared/master/entities/sub-grade.entity"

@Module({
	imports: [
		TypeOrmModule.forFeature([
			AcademicYear,
			Level,
			Grade,
			SubGrade,
			Major,
			StudentGrade,
			Student,
			StudentCapability,
			Alumni,
			SettingForm,
		]),
	],
	controllers: [StudentAdminController],
	providers: [StudentAdminService],
})
export class StudentAdminModule {}
