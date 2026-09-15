import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import { Roles } from "@core/auth/decorators/roles.decorator"
import { JwtAuthGuard } from "@core/auth/guards/jwt-auth.guard"
import { RolesGuard } from "@core/auth/guards/roles.guard"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import { SubGradeService } from "@admin/academic/sub-grade.service"
import { CreateSubGradeDto, UpdateSubGradeDto, SubGradeResponseDto } from "@admin/dto/academic.dto"
import { AdminMessageResponseDto } from "@admin/dto/admin-response.dto"

@ApiTags("Admin — Academic Structure: Sub-Grade")
@Controller("admin/sub-grades")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin", "Admin")
@ApiBearerAuth("JWT-Auth")
export class SubGradeController {
	constructor(private readonly subGradeService: SubGradeService) {}

	@Get()
	@ApiOperation({ summary: "Daftar sub-kelas" })
	@ApiResponseWrapped({ status: 200, description: "List sub-kelas", type: SubGradeResponseDto, isArray: true })
	async findAll() {
		return this.subGradeService.findAll()
	}

	@Get(":id")
	@ApiOperation({ summary: "Detail sub-kelas" })
	@ApiResponseWrapped({ status: 200, description: "Detail sub-kelas", type: SubGradeResponseDto })
	async findOne(@Param("id", ParseIntPipe) id: number) {
		return this.subGradeService.findOne(id)
	}

	@Post()
	@ApiOperation({ summary: "Tambah sub-kelas baru" })
	@ApiResponseWrapped({ status: 201, description: "Sub-kelas dibuat", type: SubGradeResponseDto })
	async create(@Body() dto: CreateSubGradeDto) {
		return this.subGradeService.create(dto)
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update sub-kelas" })
	@ApiResponseWrapped({ status: 200, description: "Sub-kelas diupdate", type: SubGradeResponseDto })
	async update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateSubGradeDto) {
		return this.subGradeService.update(id, dto)
	}

	@Delete(":id")
	@ApiOperation({ summary: "Hapus sub-kelas" })
	@ApiResponseWrapped({ status: 200, description: "Sub-kelas dihapus", type: AdminMessageResponseDto })
	async remove(@Param("id", ParseIntPipe) id: number) {
		return this.subGradeService.remove(id)
	}
}
