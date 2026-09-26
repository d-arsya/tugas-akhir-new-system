import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"

import { StudentAdminController } from "@admin/student/student-admin.controller"
import { StudentAdminService } from "@admin/student/student-admin.service"
import { AcademicYear } from "@shared/master/entities/academic-year.entity"
import { Grade } from "@shared/master/entities/grade.entity"
import { Level } from "@shared/master/entities/level.entity"
import { Major } from "@shared/master/entities/major.entity"
import { SubGrade } from "@shared/master/entities/sub-grade.entity"

@Module({
	imports: [TypeOrmModule.forFeature([AcademicYear, Level, Grade, SubGrade, Major])],
	controllers: [StudentAdminController],
	providers: [StudentAdminService],
})
export class StudentAdminModule {}
