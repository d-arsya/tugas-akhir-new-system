import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AcademicYear } from "./entities/academic-year.entity"
import { Level } from "./entities/level.entity"
import { Grade } from "./entities/grade.entity"
import { SubGrade } from "./entities/sub-grade.entity"
import { Major } from "./entities/major.entity"
import { LevelAcademicYear } from "./entities/level-academic-year.entity"

@Module({
	imports: [
		TypeOrmModule.forFeature([
			AcademicYear,
			Level,
			Grade,
			SubGrade,
			Major,
			LevelAcademicYear,
		]),
	],
	exports: [TypeOrmModule],
})
export class MasterModule {}
