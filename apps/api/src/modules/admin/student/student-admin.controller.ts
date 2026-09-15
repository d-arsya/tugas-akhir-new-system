import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger"
import { Roles } from "@core/auth/decorators/roles.decorator"
import { JwtAuthGuard } from "@core/auth/guards/jwt-auth.guard"
import { RolesGuard } from "@core/auth/guards/roles.guard"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import { StudentAdminService } from "@admin/student/student-admin.service"
import {
	StudentFilterDto,
	UpdateStudentGradeDto,
	UpdateStudentMajorDto,
	UpdateStudentSubGradeDto,
	UpdateStudentStatusDto,
	BulkStudentPromotionDto,
	BulkStudentRetentionDto,
	BulkStudentGraduationDto,
	BulkStudentDropoutDto,
	CreateStudentManualDto,
	StudentCapabilityDto,
	StudentGradeResponseDto,
	StudentCapabilityResponseDto,
} from "@admin/dto/student-admin.dto"
import { AcademicYearResponseDto, GradeResponseDto } from "@admin/dto/academic.dto"
import { AdminMessageResponseDto } from "@admin/dto/admin-response.dto"

@ApiTags("Admin — Student Management")
@Controller("admin/students")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin", "Admin")
@ApiBearerAuth("JWT-Auth")
export class StudentAdminController {
	constructor(private readonly studentAdminService: StudentAdminService) {}

	@Get("academic-years")
	@ApiOperation({ summary: "Daftar tahun akademik untuk filter santri" })
	@ApiResponseWrapped({ status: 200, description: "List tahun akademik", type: AcademicYearResponseDto, isArray: true })
	async getAcademicYears() {
		return this.studentAdminService.getAcademicYears()
	}

	@Get(":academicYearId/grades")
	@ApiOperation({ summary: "Daftar tingkat/kelas pada tahun akademik" })
	@ApiResponseWrapped({ status: 200, description: "List tingkat/kelas", type: GradeResponseDto, isArray: true })
	async getGradesForAcademicYear(@Param("academicYearId", ParseIntPipe) academicYearId: number) {
		return this.studentAdminService.getGradesForAcademicYear(academicYearId)
	}

	@Get(":academicYearId/grades/:gradeId/download")
	@ApiOperation({ summary: "Export daftar santri per kelas" })
	@ApiQuery({ name: "levelId", required: false, type: Number })
	@ApiResponseWrapped({
		status: 200,
		description: "Data export santri",
		type: StudentGradeResponseDto,
		isArray: true,
	})
	async exportStudents(
		@Param("academicYearId", ParseIntPipe) academicYearId: number,
		@Param("gradeId", ParseIntPipe) gradeId: number,
		@Query("levelId") levelId?: number,
	) {
		return this.studentAdminService.exportStudents(academicYearId, gradeId, levelId ? Number(levelId) : undefined)
	}

	@Get(":academicYearId/grades/:gradeId/levels/:levelId")
	@ApiOperation({ summary: "Daftar santri berdasarkan kelas dan jenjang" })
	@ApiResponseWrapped({
		status: 200,
		description: "Daftar santri terpaginasi",
		type: StudentGradeResponseDto,
		isPaginated: true,
	})
	async findStudentsByGradeAndLevel(
		@Param("academicYearId", ParseIntPipe) academicYearId: number,
		@Param("gradeId", ParseIntPipe) gradeId: number,
		@Param("levelId", ParseIntPipe) levelId: number,
		@Query() query: StudentFilterDto,
	) {
		return this.studentAdminService.findStudentsByGradeAndLevel(academicYearId, gradeId, levelId, query)
	}

	@Get(":studentGradeId")
	@ApiOperation({ summary: "Detail data santri" })
	@ApiResponseWrapped({ status: 200, description: "Detail santri", type: StudentGradeResponseDto })
	async findStudentGradeById(@Param("studentGradeId", ParseIntPipe) studentGradeId: number) {
		return this.studentAdminService.findStudentGradeById(studentGradeId)
	}

	@Patch(":studentGradeId")
	@ApiOperation({ summary: "Update data profil santri" })
	@ApiResponseWrapped({ status: 200, description: "Profil santri diupdate", type: StudentGradeResponseDto })
	async updateStudentGrade(
		@Param("studentGradeId", ParseIntPipe) studentGradeId: number,
		@Body() dto: UpdateStudentGradeDto,
	) {
		return this.studentAdminService.updateStudentGrade(studentGradeId, dto)
	}

	@Patch(":studentGradeId/major")
	@ApiOperation({ summary: "Update jurusan santri" })
	@ApiResponseWrapped({ status: 200, description: "Jurusan diupdate", type: StudentGradeResponseDto })
	async updateMajor(
		@Param("studentGradeId", ParseIntPipe) studentGradeId: number,
		@Body() dto: UpdateStudentMajorDto,
	) {
		return this.studentAdminService.updateMajor(studentGradeId, dto)
	}

	@Patch(":studentGradeId/sub-grade")
	@ApiOperation({ summary: "Update rombel / sub-grade santri" })
	@ApiResponseWrapped({ status: 200, description: "Sub-grade diupdate", type: StudentGradeResponseDto })
	async updateSubGrade(
		@Param("studentGradeId", ParseIntPipe) studentGradeId: number,
		@Body() dto: UpdateStudentSubGradeDto,
	) {
		return this.studentAdminService.updateSubGrade(studentGradeId, dto)
	}

	@Patch(":studentGradeId/status")
	@ApiOperation({ summary: "Update status santri" })
	@ApiResponseWrapped({ status: 200, description: "Status santri diupdate", type: StudentGradeResponseDto })
	async updateStatus(
		@Param("studentGradeId", ParseIntPipe) studentGradeId: number,
		@Body() dto: UpdateStudentStatusDto,
	) {
		return this.studentAdminService.updateStatus(studentGradeId, dto)
	}

	@Post("next-grades")
	@ApiOperation({ summary: "Kenaikan kelas secara masal (bulk promotion)" })
	@ApiResponseWrapped({ status: 200, description: "Proses kenaikan kelas berhasil", type: AdminMessageResponseDto })
	async bulkNextGrades(@Body() dto: BulkStudentPromotionDto) {
		return this.studentAdminService.bulkNextGrades(dto)
	}

	@Post("stay-grades")
	@ApiOperation({ summary: "Tinggal kelas secara masal (bulk retention)" })
	@ApiResponseWrapped({ status: 200, description: "Proses tinggal kelas berhasil", type: AdminMessageResponseDto })
	async bulkStayGrades(@Body() dto: BulkStudentRetentionDto) {
		return this.studentAdminService.bulkStayGrades(dto)
	}

	@Post("graduate")
	@ApiOperation({ summary: "Kelulusan santri secara masal (bulk graduation)" })
	@ApiResponseWrapped({ status: 200, description: "Proses kelulusan berhasil", type: AdminMessageResponseDto })
	async bulkGraduate(@Body() dto: BulkStudentGraduationDto) {
		return this.studentAdminService.bulkGraduate(dto)
	}

	@Post("dropout")
	@ApiOperation({ summary: "Keluarkan santri secara masal (bulk dropout)" })
	@ApiResponseWrapped({ status: 200, description: "Proses keluarkan santri berhasil", type: AdminMessageResponseDto })
	async bulkDropout(@Body() dto: BulkStudentDropoutDto) {
		return this.studentAdminService.bulkDropout(dto)
	}

	@Post("create")
	@ApiOperation({ summary: "Tambah santri baru secara manual" })
	@ApiResponseWrapped({ status: 201, description: "Santri berhasil dibuat", type: StudentGradeResponseDto })
	async createStudentManual(@Body() dto: CreateStudentManualDto) {
		return this.studentAdminService.createStudentManual(dto)
	}

	@Get(":studentGradeId/capability")
	@ApiOperation({ summary: "Ambil data kesanggupan biaya santri" })
	@ApiResponseWrapped({ status: 200, description: "Data kesanggupan biaya", type: StudentCapabilityResponseDto })
	async getCapability(@Param("studentGradeId", ParseIntPipe) studentGradeId: number) {
		return this.studentAdminService.getCapability(studentGradeId)
	}

	@Post(":studentGradeId/capability")
	@ApiOperation({ summary: "Simpan / update kesanggupan biaya santri" })
	@ApiResponseWrapped({ status: 200, description: "Kesanggupan biaya disimpan", type: StudentCapabilityResponseDto })
	async updateCapability(
		@Param("studentGradeId", ParseIntPipe) studentGradeId: number,
		@Body() dto: StudentCapabilityDto,
	) {
		return this.studentAdminService.updateCapability(studentGradeId, dto)
	}

	@Patch(":studentGradeId/capability/approve")
	@ApiOperation({ summary: "Setujui kesanggupan biaya santri" })
	@ApiResponseWrapped({
		status: 200,
		description: "Kesanggupan biaya disetujui",
		type: StudentCapabilityResponseDto,
	})
	async approveCapability(@Param("studentGradeId", ParseIntPipe) studentGradeId: number) {
		return this.studentAdminService.approveCapability(studentGradeId)
	}
}
