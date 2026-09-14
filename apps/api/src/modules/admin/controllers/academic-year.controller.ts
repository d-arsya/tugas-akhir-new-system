import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import { Roles } from "../../../core/auth/decorators/roles.decorator"
import { JwtAuthGuard } from "../../../core/auth/guards/jwt-auth.guard"
import { RolesGuard } from "../../../core/auth/guards/roles.guard"
import { ApiResponseWrapped } from "../../../core/decorators/api-response-wrapped.decorator"
import { AcademicYearService } from "../services/academic-year.service"
import type { CreateAcademicYearDto, DelegateAcademicYearDto, UpdateAcademicYearDto } from "../dto/academic.dto"
import type { PaginationQueryDto } from "../../../core/dto/pagination-query.dto"

import { AcademicYearResponseDto, LevelAcademicYearResponseDto } from "../dto/academic.dto"
import { AdminMessageResponseDto } from "../dto/admin-response.dto"

@ApiTags("Admin — Academic Structure: Academic Year")
@Controller("admin/academic-years")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin", "Admin")
@ApiBearerAuth("JWT-Auth")
export class AcademicYearController {
	constructor(private readonly academicYearService: AcademicYearService) {}

	@Get()
	@ApiOperation({ summary: "Daftar tahun akademik dengan paginasi" })
	@ApiResponseWrapped({ status: 200, description: "List tahun akademik", type: AcademicYearResponseDto, isPaginated: true })
	async findAll(@Query() query: PaginationQueryDto) {
		return this.academicYearService.findAll(query)
	}

	@Get(":id")
	@ApiOperation({ summary: "Detail tahun akademik" })
	@ApiResponseWrapped({ status: 200, description: "Detail tahun akademik", type: AcademicYearResponseDto })
	async findOne(@Param("id", ParseIntPipe) id: number) {
		return this.academicYearService.findOne(id)
	}

	@Post()
	@ApiOperation({ summary: "Tambah tahun akademik baru" })
	@ApiResponseWrapped({ status: 201, description: "Tahun akademik berhasil dibuat", type: AcademicYearResponseDto })
	async create(@Body() dto: CreateAcademicYearDto) {
		return this.academicYearService.create(dto)
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update tahun akademik" })
	@ApiResponseWrapped({ status: 200, description: "Tahun akademik berhasil diupdate", type: AcademicYearResponseDto })
	async update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateAcademicYearDto) {
		return this.academicYearService.update(id, dto)
	}

	@Patch(":id/set-current")
	@ApiOperation({ summary: "Setel tahun akademik aktif KBM saat ini" })
	@ApiResponseWrapped({ status: 200, description: "Tahun akademik aktif berhasil diubah", type: AcademicYearResponseDto })
	async setCurrent(@Param("id", ParseIntPipe) id: number) {
		return this.academicYearService.setCurrent(id)
	}

	@Delete(":id")
	@ApiOperation({ summary: "Hapus tahun akademik" })
	@ApiResponseWrapped({ status: 200, description: "Tahun akademik berhasil dihapus", type: AdminMessageResponseDto })
	async remove(@Param("id", ParseIntPipe) id: number) {
		return this.academicYearService.remove(id)
	}

	@Get(":id/levels")
	@ApiOperation({ summary: "Daftar jenjang yang terhubung pada tahun ajaran" })
	@ApiResponseWrapped({ status: 200, description: "List jenjang tahun ajaran", type: LevelAcademicYearResponseDto, isArray: true })
	async getLevels(@Param("id", ParseIntPipe) id: number) {
		return this.academicYearService.getLevels(id)
	}

	@Patch(":id/delegate-registrant")
	@ApiOperation({ summary: "Pindahkan data pendaftar ke tahun ajaran baru" })
	@ApiResponseWrapped({ status: 200, description: "Data pendaftar berhasil dipindahkan", type: AdminMessageResponseDto })
	async delegateRegistrant(@Param("id", ParseIntPipe) id: number, @Body() dto: DelegateAcademicYearDto) {
		return this.academicYearService.delegateRegistrant(id, dto)
	}

	@Patch(":id/delegate-student")
	@ApiOperation({ summary: "Pindahkan data santri aktif ke tahun ajaran baru" })
	@ApiResponseWrapped({ status: 200, description: "Data santri berhasil dialihkan", type: AdminMessageResponseDto })
	async delegateStudent(@Param("id", ParseIntPipe) id: number, @Body() dto: DelegateAcademicYearDto) {
		return this.academicYearService.delegateStudent(id, dto)
	}

	@Patch(":id/delegate-alumni")
	@ApiOperation({ summary: "Arsipkan alumni ke tahun ajaran baru" })
	@ApiResponseWrapped({ status: 200, description: "Data alumni berhasil diarsipkan", type: AdminMessageResponseDto })
	async delegateAlumni(@Param("id", ParseIntPipe) id: number, @Body() dto: DelegateAcademicYearDto) {
		return this.academicYearService.delegateAlumni(id, dto)
	}
}
