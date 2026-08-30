import { Controller, Get, Query } from "@nestjs/common"
import { Public } from "../auth/decorators/public.decorator"
import { LocationService } from "./location.service"
import type { District } from "./entities/district.entity"
import type { Province } from "./entities/province.entity"
import type { Regency } from "./entities/regency.entity"

@Controller("location")
@Public()
export class LocationController {
	constructor(private readonly locationService: LocationService) {}

	@Get("provinces")
	getProvinces(): Promise<Province[]> {
		return this.locationService.findAllProvinces()
	}

	@Get("regencies")
	getRegencies(@Query("province_id") provinceId: string): Promise<Regency[]> {
		return this.locationService.findRegenciesByProvince(Number(provinceId))
	}

	@Get("districts")
	getDistricts(@Query("regency_id") regencyId: string): Promise<District[]> {
		return this.locationService.findDistrictsByRegency(Number(regencyId))
	}
}
