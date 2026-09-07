import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Province } from "@shared/location/entities/province.entity"
import { Regency } from "@shared/location/entities/regency.entity"
import { District } from "@shared/location/entities/district.entity"
import { Village } from "@shared/location/entities/village.entity"
import { LocationController } from "@shared/location/location.controller"
import { LocationService } from "@shared/location/location.service"

@Module({
	imports: [TypeOrmModule.forFeature([Province, Regency, District, Village])],
	controllers: [LocationController],
	providers: [LocationService],
	exports: [LocationService],
})
export class LocationModule {}
