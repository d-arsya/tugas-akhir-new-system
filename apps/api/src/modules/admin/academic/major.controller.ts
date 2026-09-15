import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger"
import { Roles } from "@core/auth/decorators/roles.decorator"
import { JwtAuthGuard } from "@core/auth/guards/jwt-auth.guard"
import { RolesGuard } from "@core/auth/guards/roles.guard"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import { MajorService } from "@admin/academic/major.service"
import { CreateMajorDto, UpdateMajorDto, MajorResponseDto } from "@admin/dto/academic.dto"
import { AdminMessageResponseDto } from "@admin/dto/admin-response.dto"

@ApiTags("Admin — Academic Structure: Major")
@Controller("admin/majors")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin", "Admin")
@ApiBearerAuth("JWT-Auth")
export class MajorController {
	constructor(private readonly majorService: MajorService) {}

	@Get()
	@ApiOperation({ summary: "Daftar jurusan (dapat difilter per level)" })
	@ApiQuery({ name: "levelId", required: false, type: Number })
	@ApiResponseWrapped({ status: 200, description: "List jurusan", type: MajorResponseDto, isArray: true })
	async findAll(@Query("levelId") levelId?: number) {
		return this.majorService.findAll(levelId ? Number(levelId) : undefined)
	}

	@Get("by-level/:levelId")
	@ApiOperation({ summary: "Daftar jurusan berdasarkan jenjang/level untuk dropdown" })
	@ApiResponseWrapped({ status: 200, description: "List jurusan per jenjang", type: MajorResponseDto, isArray: true })
	async findByLevel(@Param("levelId", ParseIntPipe) levelId: number) {
		return this.majorService.findByLevel(levelId)
	}

	@Get(":id")
	@ApiOperation({ summary: "Detail jurusan" })
	@ApiResponseWrapped({ status: 200, description: "Detail jurusan", type: MajorResponseDto })
	async findOne(@Param("id", ParseIntPipe) id: number) {
		return this.majorService.findOne(id)
	}

	@Post()
	@ApiOperation({ summary: "Tambah jurusan baru" })
	@ApiResponseWrapped({ status: 201, description: "Jurusan dibuat", type: MajorResponseDto })
	async create(@Body() dto: CreateMajorDto) {
		return this.majorService.create(dto)
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update jurusan" })
	@ApiResponseWrapped({ status: 200, description: "Jurusan diupdate", type: MajorResponseDto })
	async update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateMajorDto) {
		return this.majorService.update(id, dto)
	}

	@Delete(":id")
	@ApiOperation({ summary: "Hapus jurusan" })
	@ApiResponseWrapped({ status: 200, description: "Jurusan dihapus", type: AdminMessageResponseDto })
	async remove(@Param("id", ParseIntPipe) id: number) {
		return this.majorService.remove(id)
	}
}
