import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import { Roles } from "../../../core/auth/decorators/roles.decorator"
import { JwtAuthGuard } from "../../../core/auth/guards/jwt-auth.guard"
import { RolesGuard } from "../../../core/auth/guards/roles.guard"
import { ApiResponseWrapped } from "../../../core/decorators/api-response-wrapped.decorator"
import { LevelService } from "../services/level.service"
import {
	CreateLevelDto,
	LinkLevelAcademicYearDto,
	UpdateLevelDto,
	LevelResponseDto,
	LevelListResponseDto,
	LevelAcademicYearResponseDto,
} from "../dto/academic.dto"
import { AdminMessageResponseDto } from "../dto/admin-response.dto"

@ApiTags("Admin — Academic Structure: Level")
@Controller("admin/levels")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin", "Admin")
@ApiBearerAuth("JWT-Auth")
export class LevelController {
	constructor(private readonly levelService: LevelService) {}

	@Get()
	@ApiOperation({ summary: "Daftar jenjang pendidikan" })
	@ApiResponseWrapped({ status: 200, description: "List jenjang", type: LevelResponseDto, isArray: true })
	async findAll() {
		return this.levelService.findAll()
	}

	@Get("list")
	@ApiOperation({ summary: "Daftar ringkas jenjang pendidikan untuk dropdown" })
	@ApiResponseWrapped({ status: 200, description: "List ringkas jenjang", type: LevelListResponseDto, isArray: true })
	async getList() {
		return this.levelService.getList()
	}

	@Get(":id")
	@ApiOperation({ summary: "Detail jenjang pendidikan" })
	@ApiResponseWrapped({ status: 200, description: "Detail jenjang", type: LevelResponseDto })
	async findOne(@Param("id", ParseIntPipe) id: number) {
		return this.levelService.findOne(id)
	}

	@Post()
	@ApiOperation({ summary: "Tambah jenjang pendidikan baru" })
	@ApiResponseWrapped({ status: 201, description: "Jenjang dibuat", type: LevelResponseDto })
	async create(@Body() dto: CreateLevelDto) {
		return this.levelService.create(dto)
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update jenjang pendidikan" })
	@ApiResponseWrapped({ status: 200, description: "Jenjang diupdate", type: LevelResponseDto })
	async update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateLevelDto) {
		return this.levelService.update(id, dto)
	}

	@Post(":id/academic-years")
	@ApiOperation({ summary: "Hubungkan jenjang dengan tahun akademik & set kuota" })
	@ApiResponseWrapped({ status: 200, description: "Kuota jenjang berhasil disimpan", type: LevelAcademicYearResponseDto })
	async linkAcademicYear(@Param("id", ParseIntPipe) id: number, @Body() dto: LinkLevelAcademicYearDto) {
		return this.levelService.linkAcademicYear(id, dto)
	}

	@Delete(":id")
	@ApiOperation({ summary: "Hapus jenjang pendidikan" })
	@ApiResponseWrapped({ status: 200, description: "Jenjang dihapus", type: AdminMessageResponseDto })
	async remove(@Param("id", ParseIntPipe) id: number) {
		return this.levelService.remove(id)
	}
}
