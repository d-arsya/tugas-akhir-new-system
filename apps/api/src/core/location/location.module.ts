import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Province } from "./entities/province.entity"
import { Regency } from "./entities/regency.entity"
import { District } from "./entities/district.entity"
import { Village } from "./entities/village.entity"
import { LocationController } from "./location.controller"
import { LocationService } from "./location.service"

@Module({
	imports: [TypeOrmModule.forFeature([Province, Regency, District, Village])],
	controllers: [LocationController],
	providers: [LocationService],
	exports: [LocationService],
})
export class LocationModule {}
