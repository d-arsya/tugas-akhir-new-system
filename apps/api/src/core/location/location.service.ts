import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Province } from "./entities/province.entity"
import { Regency } from "./entities/regency.entity"
import { District } from "./entities/district.entity"
import { Village } from "./entities/village.entity"

@Injectable()
export class LocationService {
	constructor(
		@InjectRepository(Province)
		private readonly provinceRepository: Repository<Province>,
		@InjectRepository(Regency)
		private readonly regencyRepository: Repository<Regency>,
		@InjectRepository(District)
		private readonly districtRepository: Repository<District>,
		@InjectRepository(Village)
		private readonly villageRepository: Repository<Village>,
	) {}

	findAllProvinces(): Promise<Province[]> {
		return this.provinceRepository.find({ order: { name: "ASC" } })
	}

	findRegenciesByProvince(provinceId: number): Promise<Regency[]> {
		return this.regencyRepository.find({
			where: { provinceId },
			order: { name: "ASC" },
		})
	}

	findDistrictsByRegency(regencyId: number): Promise<District[]> {
		return this.districtRepository.find({
			where: { regencyId },
			order: { name: "ASC" },
		})
	}
  async findVillagesByDistrict(districtId: number, limit?: number): Promise<Village[]> {
    const take = limit ? Math.min(limit, 300) : 300;
    return this.villageRepository.find({
      where: { districtId },
      order: { name: 'ASC' },
      take,
    });
  }

}
