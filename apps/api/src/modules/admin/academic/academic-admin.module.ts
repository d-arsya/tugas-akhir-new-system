import { Module } from "@nestjs/common"

import { AcademicYearAdminController } from "@admin/academic/academic-year-admin.controller"
import { AcademicYearAdminService } from "@admin/academic/academic-year-admin.service"
import { AcademicYearDeleteController } from "@admin/academic/academic-year-delete.controller"
import { AcademicYearDeleteService } from "@admin/academic/academic-year-delete.service"
import { GradeAdminController } from "@admin/academic/grade-admin.controller"
import { GradeAdminService } from "@admin/academic/grade-admin.service"
import { LevelAdminController } from "@admin/academic/level-admin.controller"
import { LevelAdminService } from "@admin/academic/level-admin.service"
import { MajorAdminController } from "@admin/academic/major-admin.controller"
import { MajorAdminService } from "@admin/academic/major-admin.service"
import { SubGradeAdminController } from "@admin/academic/sub-grade-admin.controller"
import { SubGradeAdminService } from "@admin/academic/sub-grade-admin.service"

@Module({
	controllers: [
		AcademicYearAdminController,
		AcademicYearDeleteController,
		LevelAdminController,
		MajorAdminController,
		GradeAdminController,
		SubGradeAdminController,
	],
	providers: [
		AcademicYearAdminService,
		AcademicYearDeleteService,
		LevelAdminService,
		MajorAdminService,
		GradeAdminService,
		SubGradeAdminService,
	],
})
export class AcademicAdminModule {}
