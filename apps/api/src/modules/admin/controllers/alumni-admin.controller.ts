import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Query, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import { Roles } from "../../../core/auth/decorators/roles.decorator"
import { JwtAuthGuard } from "../../../core/auth/guards/jwt-auth.guard"
import { RolesGuard } from "../../../core/auth/guards/roles.guard"
import { ApiResponseWrapped } from "../../../core/decorators/api-response-wrapped.decorator"
import { AlumniAdminService } from "../services/alumni-admin.service"
import {
	AlumniFilterDto,
	UpdateAlumniDto,
	AlumniResponseDto,
	AlumniYearGroupResponseDto,
} from "../dto/alumni-admin.dto"
import { AdminMessageResponseDto } from "../dto/admin-response.dto"

@ApiTags("Admin — Alumni Management")
@Controller("admin/alumni")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin", "Admin")
@ApiBearerAuth("JWT-Auth")
export class AlumniAdminController {
	constructor(private readonly alumniAdminService: AlumniAdminService) {}

	@Get()
	@ApiOperation({ summary: "Daftar alumni terkelompok per tahun kelulusan" })
	@ApiResponseWrapped({ status: 200, description: "List kelulusan alumni", type: AlumniYearGroupResponseDto, isArray: true })
	async getGroupedByGraduationYear() {
		return this.alumniAdminService.getGroupedByGraduationYear()
	}

	@Get("archive")
	@ApiOperation({ summary: "Daftar arsip tahun kelulusan alumni" })
	@ApiResponseWrapped({ status: 200, description: "Arsip kelulusan alumni", type: AlumniYearGroupResponseDto, isArray: true })
	async getArchiveYears() {
		return this.alumniAdminService.getArchiveYears()
	}

	@Get(":graduationYear")
	@ApiOperation({ summary: "Daftar alumni per tahun kelulusan" })
	@ApiResponseWrapped({ status: 200, description: "List alumni terpaginasi", type: AlumniResponseDto, isPaginated: true })
	async findByGraduationYear(
		@Param("graduationYear") graduationYear: string,
		@Query() query: AlumniFilterDto,
	) {
		return this.alumniAdminService.findByGraduationYear(graduationYear, query)
	}

	@Get(":graduationYear/download")
	@ApiOperation({ summary: "Export daftar alumni per tahun kelulusan" })
	@ApiResponseWrapped({ status: 200, description: "Data export alumni", type: AlumniResponseDto, isArray: true })
	async exportByGraduationYear(@Param("graduationYear") graduationYear: string) {
		return this.alumniAdminService.exportByGraduationYear(graduationYear)
	}

	@Get("detail/:alumniId")
	@ApiOperation({ summary: "Detail data alumni" })
	@ApiResponseWrapped({ status: 200, description: "Detail alumni", type: AlumniResponseDto })
	async findOne(@Param("alumniId", ParseIntPipe) alumniId: number) {
		return this.alumniAdminService.findOne(alumniId)
	}

	@Patch(":alumniId")
	@ApiOperation({ summary: "Update data alumni" })
	@ApiResponseWrapped({ status: 200, description: "Data alumni diupdate", type: AlumniResponseDto })
	async update(@Param("alumniId", ParseIntPipe) alumniId: number, @Body() dto: UpdateAlumniDto) {
		return this.alumniAdminService.update(alumniId, dto)
	}

	@Delete("by-graduation-year/:graduationYear")
	@Roles("Superadmin")
	@ApiOperation({ summary: "Hapus masal alumni per tahun kelulusan (Superadmin Only)" })
	@ApiResponseWrapped({ status: 200, description: "Alumni angkatan dihapus", type: AdminMessageResponseDto })
	async removeByGraduationYear(@Param("graduationYear") graduationYear: string) {
		return this.alumniAdminService.removeByGraduationYear(graduationYear)
	}

	@Delete(":alumniId")
	@Roles("Superadmin")
	@ApiOperation({ summary: "Hapus satu data alumni (Superadmin Only)" })
	@ApiResponseWrapped({ status: 200, description: "Data alumni dihapus", type: AdminMessageResponseDto })
	async removeOne(@Param("alumniId", ParseIntPipe) alumniId: number) {
		return this.alumniAdminService.removeOne(alumniId)
	}
}
