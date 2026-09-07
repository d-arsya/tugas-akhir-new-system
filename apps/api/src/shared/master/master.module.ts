import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AcademicYear } from "@shared/master/entities/academic-year.entity"
import { Level } from "@shared/master/entities/level.entity"

@Module({
	imports: [TypeOrmModule.forFeature([AcademicYear, Level])],
	exports: [TypeOrmModule],
})
export class MasterModule {}
