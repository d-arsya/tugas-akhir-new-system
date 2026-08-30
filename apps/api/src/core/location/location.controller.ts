import { Controller, Get, Query } from "@nestjs/common"
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger"
import { Public } from "../auth/decorators/public.decorator"
import { LocationService } from "./location.service"
import { ApiResponseWrapped } from "../decorators/api-response-wrapped.decorator"
import { DistrictResponseDto, ProvinceResponseDto, RegencyResponseDto } from "./dto/location-response.dto"

@ApiTags("Foundation — Location")
@Controller("location")
@Public()
export class LocationController {
	constructor(private readonly locationService: LocationService) {}

	@Get("provinces")
	@ApiOperation({ summary: "Ambil daftar seluruh provinsi di Indonesia" })
	@ApiResponseWrapped({ status: 200, description: "Daftar provinsi berhasil dimuat", type: ProvinceResponseDto, isArray: true })
	async getProvinces(): Promise<ProvinceResponseDto[]> {
		const provinces = await this.locationService.findAllProvinces()
		return provinces.map((p) => ({
			id: p.id,
			name: p.name ?? undefined,
		}))
	}

	@Get("regencies")
	@ApiOperation({ summary: "Ambil daftar kabupaten/kota berdasarkan ID provinsi" })
	@ApiQuery({ name: "province_id", required: true, description: "ID Provinsi (cth: 33)" })
	@ApiResponseWrapped({ status: 200, description: "Daftar kabupaten/kota berhasil dimuat", type: RegencyResponseDto, isArray: true })
	async getRegencies(@Query("province_id") provinceId: string): Promise<RegencyResponseDto[]> {
		const regencies = await this.locationService.findRegenciesByProvince(Number(provinceId))
		return regencies.map((r) => ({
			id: r.id,
			provinceId: r.provinceId,
			name: r.name ?? undefined,
		}))
	}

	@Get("districts")
	@ApiOperation({ summary: "Ambil daftar kecamatan berdasarkan ID kabupaten/kota" })
	@ApiQuery({ name: "regency_id", required: true, description: "ID Kabupaten/Kota (cth: 3311)" })
	@ApiResponseWrapped({ status: 200, description: "Daftar kecamatan berhasil dimuat", type: DistrictResponseDto, isArray: true })
	async getDistricts(@Query("regency_id") regencyId: string): Promise<DistrictResponseDto[]> {
		const districts = await this.locationService.findDistrictsByRegency(Number(regencyId))
		return districts.map((d) => ({
			id: d.id,
			regencyId: d.regencyId,
			name: d.name ?? undefined,
		}))
	}
}
