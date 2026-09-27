import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"

import { AlumniAdminController } from "@admin/alumni/alumni-admin.controller"
import { AlumniAdminService } from "@admin/alumni/alumni-admin.service"
import { AlumniWriteService } from "@admin/alumni/alumni-write.service"
import { Alumni } from "@admin/common/entities/alumni.entity"
import { SettingForm } from "@psb/entities/setting-form.entity"
import { Student } from "@santri/entities/student.entity"
import { StudentGrade } from "@santri/entities/student-grade.entity"
import { Province } from "@shared/location/entities/province.entity"
import { Regency } from "@shared/location/entities/regency.entity"
import { AcademicYear } from "@shared/master/entities/academic-year.entity"

@Module({
	imports: [TypeOrmModule.forFeature([SettingForm, Alumni, AcademicYear, Province, Regency, StudentGrade, Student])],
	controllers: [AlumniAdminController],
	providers: [AlumniAdminService, AlumniWriteService],
})
export class AlumniAdminModule {}
