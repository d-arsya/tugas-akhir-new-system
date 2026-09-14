import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger"
import { Roles } from "../../../core/auth/decorators/roles.decorator"
import { JwtAuthGuard } from "../../../core/auth/guards/jwt-auth.guard"
import { RolesGuard } from "../../../core/auth/guards/roles.guard"
import { ApiResponseWrapped } from "../../../core/decorators/api-response-wrapped.decorator"
import { GradeService } from "../services/grade.service"
import {
	CreateGradeDto,
	UpdateGradeDto,
	GradeResponseDto,
	GradeLevelResponseDto,
	LevelByGradeDto,
} from "../dto/academic.dto"
import { AdminMessageResponseDto } from "../dto/admin-response.dto"

@ApiTags("Admin — Academic Structure: Grade")
@Controller("admin/grades")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin", "Admin")
@ApiBearerAuth("JWT-Auth")
export class GradeController {
	constructor(private readonly gradeService: GradeService) {}

	@Get()
	@ApiOperation({ summary: "Daftar kelas (dapat difilter per level)" })
	@ApiQuery({ name: "levelId", required: false, type: Number })
	@ApiResponseWrapped({ status: 200, description: "List kelas", type: GradeResponseDto, isArray: true })
	async findAll(@Query("levelId") levelId?: number) {
		return this.gradeService.findAll(levelId ? Number(levelId) : undefined)
	}

	@Get(":id")
	@ApiOperation({ summary: "Detail kelas" })
	@ApiResponseWrapped({ status: 200, description: "Detail kelas", type: GradeResponseDto })
	async findOne(@Param("id", ParseIntPipe) id: number) {
		return this.gradeService.findOne(id)
	}

	@Post()
	@ApiOperation({ summary: "Tambah kelas baru" })
	@ApiResponseWrapped({ status: 201, description: "Kelas dibuat", type: GradeResponseDto })
	async create(@Body() dto: CreateGradeDto) {
		return this.gradeService.create(dto)
	}

	@Post("level-by-grade")
	@ApiOperation({ summary: "Cari data jenjang berdasarkan angka kelas" })
	@ApiResponseWrapped({ status: 200, description: "Data jenjang terkait", type: GradeLevelResponseDto })
	async getLevelByGrade(@Body() dto: LevelByGradeDto) {
		return this.gradeService.getLevelByGrade(dto.grade)
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update kelas" })
	@ApiResponseWrapped({ status: 200, description: "Kelas diupdate", type: GradeResponseDto })
	async update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateGradeDto) {
		return this.gradeService.update(id, dto)
	}

	@Delete(":id")
	@ApiOperation({ summary: "Hapus kelas" })
	@ApiResponseWrapped({ status: 200, description: "Kelas dihapus", type: AdminMessageResponseDto })
	async remove(@Param("id", ParseIntPipe) id: number) {
		return this.gradeService.remove(id)
	}
}
