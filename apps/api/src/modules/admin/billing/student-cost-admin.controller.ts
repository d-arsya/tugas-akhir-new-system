import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"

import { Roles } from "@core/auth/decorators/roles.decorator"
import { RolesGuard } from "@core/auth/guards/roles.guard"
import { JwtAuthGuard } from "@core/auth/guards/jwt-auth.guard"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import { AdminMessageResponseDto } from "@admin/common/admin-response.dto"
import {
	StudentCostAccountPageDto,
	StudentCostAppliedDto,
	StudentCostGradeRowDto,
	StudentCostTermDetailDto,
	StudentCostTermWriteDto,
	StudentCostYearRowDto,
} from "@admin/billing/dto/student-cost-admin.dto"
import {
	StudentCostAdminService,
	type StudentCostAccountPage,
	type StudentCostGradeRow,
	type StudentCostTermDetail,
	type StudentCostYearRow,
} from "@admin/billing/student-cost-admin.service"

// Legacy `StudentCostTermController` — a four-level drill-down: academic year → grade →
// accountancy items → one item's cost term.
@ApiTags("Admin — Biaya Santri")
@ApiBearerAuth("JWT-Auth")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin", "Bendahara")
@Controller("admin/student-costs")
export class StudentCostAdminController {
	constructor(private readonly studentCostAdminService: StudentCostAdminService) {}

	// Declared before ":academicYearId" so the literal segment wins
	@Get("academic-years")
	@ApiOperation({ summary: "Level 1 — pilih tahun ajaran" })
	@ApiResponseWrapped({ status: 200, description: "Tahun ajaran", type: StudentCostYearRowDto, isArray: true })
	async findYears(): Promise<StudentCostYearRow[]> {
		return this.studentCostAdminService.findYears()
	}

	@Get(":academicYearId/grades")
	@ApiOperation({ summary: "Level 2 — pilih kelas" })
	@ApiResponseWrapped({ status: 200, description: "Kelas", type: StudentCostGradeRowDto, isArray: true })
	async findGrades(
		@Param("academicYearId", ParseIntPipe) academicYearId: number,
	): Promise<StudentCostGradeRow[]> {
		return this.studentCostAdminService.findGrades(academicYearId)
	}

	@Get(":academicYearId/grades/:gradeId/accounts")
	@ApiOperation({ summary: "Level 3 — item biaya untuk satu tahun ajaran dan kelas" })
	@ApiResponseWrapped({ status: 200, description: "Item biaya", type: StudentCostAccountPageDto })
	async findAccounts(
		@Param("academicYearId", ParseIntPipe) academicYearId: number,
		@Param("gradeId", ParseIntPipe) gradeId: number,
	): Promise<StudentCostAccountPage> {
		return this.studentCostAdminService.findAccounts(academicYearId, gradeId)
	}

	@Patch(":academicYearId/grades/:gradeId/applied")
	@ApiOperation({ summary: "Terapkan item yang dicentang ke kesanggupan" })
	@ApiResponseWrapped({ status: 200, description: "Item biaya disesuaikan", type: AdminMessageResponseDto })
	async apply(
		@Param("academicYearId", ParseIntPipe) academicYearId: number,
		@Param("gradeId", ParseIntPipe) gradeId: number,
		@Body() dto: StudentCostAppliedDto,
	): Promise<{ message: string }> {
		return this.studentCostAdminService.apply(academicYearId, gradeId, dto)
	}

	@Get(":academicYearId/grades/:gradeId/accountancy/:accountancyId")
	@ApiOperation({ summary: "Level 4 — form biaya; `term` null berarti belum ada data" })
	@ApiResponseWrapped({ status: 200, description: "Detail biaya", type: StudentCostTermDetailDto })
	@ApiResponse({ status: 404, description: "Tahun ajaran, kelas atau akun tidak ditemukan" })
	async findTerm(
		@Param("academicYearId", ParseIntPipe) academicYearId: number,
		@Param("gradeId", ParseIntPipe) gradeId: number,
		@Param("accountancyId", ParseIntPipe) accountancyId: number,
	): Promise<StudentCostTermDetail> {
		return this.studentCostAdminService.findTerm(academicYearId, gradeId, accountancyId)
	}

	@Post(":academicYearId/grades/:gradeId/accountancy/:accountancyId")
	// Legacy answers 200, and its message reads "diupdate" even on create — verbatim
	@HttpCode(200)
	@ApiOperation({ summary: "Simpan biaya baru untuk satu akun" })
	@ApiResponseWrapped({ status: 200, description: "Data berhasil diupdate", type: AdminMessageResponseDto })
	async createTerm(
		@Param("academicYearId", ParseIntPipe) academicYearId: number,
		@Param("gradeId", ParseIntPipe) gradeId: number,
		@Param("accountancyId", ParseIntPipe) accountancyId: number,
		@Body() dto: StudentCostTermWriteDto,
	): Promise<{ message: string }> {
		return this.studentCostAdminService.createTerm(academicYearId, gradeId, accountancyId, dto)
	}

	@Patch(":academicYearId/grades/:gradeId/accountancy/:accountancyId")
	@ApiOperation({ summary: "Update biaya satu akun" })
	@ApiResponseWrapped({ status: 200, description: "Data berhasil diupdate", type: AdminMessageResponseDto })
	async updateTerm(
		@Param("academicYearId", ParseIntPipe) academicYearId: number,
		@Param("gradeId", ParseIntPipe) gradeId: number,
		@Param("accountancyId", ParseIntPipe) accountancyId: number,
		@Body() dto: StudentCostTermWriteDto,
	): Promise<{ message: string }> {
		return this.studentCostAdminService.updateTerm(academicYearId, gradeId, accountancyId, dto)
	}
}
