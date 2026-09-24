import { Controller, Get, Param, ParseIntPipe, Res, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import type { Response } from "express"
import type {
	CapabilityAcademicYearRow,
	CapabilityGradeRow,
	CapabilityHistoryRow,
	CapabilityItemPage,
	CapabilityItemRow,
	CapabilityStudentPage,
	CapabilityStudentRow,
} from "@roja/types"

import { Roles } from "@core/auth/decorators/roles.decorator"
import { JwtAuthGuard } from "@core/auth/guards/jwt-auth.guard"
import { RolesGuard } from "@core/auth/guards/roles.guard"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import {
	CapabilityAcademicYearRowDto,
	CapabilityGradeRowDto,
	CapabilityHistoryRowDto,
	CapabilityItemPageDto,
	CapabilityItemRowDto,
	CapabilityStudentPageDto,
	CapabilityStudentRowDto,
} from "@admin/dto/capability-admin.dto"
import { CapabilityAdminService } from "@admin/capabilities/capability-admin.service"

// Legacy `StudentCapabilityController` (read half) plus the two agreement documents — routes 1-6,
// 14-15, 18-21. Legacy gated all 23 Kesanggupan routes with the `asBendahara` middleware:
// superadmin or bendahara only, narrower than Data Master.
//
// **Route order matters.** The literal `academic-years/…` and `students/…` forms are declared
// before the `:capabilityId/…` ones, or `/academic-years/4/grades/1/students` would be read as
// capability "academic-years" (see the note at `invoice-admin.controller.ts:46`). The sibling
// controllers are safe by construction: `CapabilityMassController`'s paths all start with the
// literal `academic-years`, and `CapabilitySingleController` applies the same ordering internally
// and shares no verb+path with this one.
@ApiTags("Admin — Kesanggupan")
@ApiBearerAuth("JWT-Auth")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin", "Bendahara")
@Controller("admin/student-capabilities")
export class CapabilityAdminController {
	constructor(private readonly capabilityAdminService: CapabilityAdminService) {}

	@Get()
	@ApiOperation({ summary: "Level 1 — daftar tahun ajaran" })
	@ApiResponseWrapped({ status: 200, description: "Tahun ajaran", type: CapabilityAcademicYearRowDto, isArray: true })
	async findAcademicYears(): Promise<CapabilityAcademicYearRow[]> {
		return this.capabilityAdminService.findAcademicYears()
	}

	@Get("academic-years/:academicYearId/grades")
	@ApiOperation({ summary: "Level 2 — kelas pada satu tahun ajaran" })
	@ApiResponseWrapped({ status: 200, description: "Daftar kelas", type: CapabilityGradeRowDto, isArray: true })
	@ApiResponse({ status: 404, description: "Tahun ajaran tidak ditemukan" })
	async findGrades(
		@Param("academicYearId", ParseIntPipe) academicYearId: number,
	): Promise<CapabilityGradeRow[]> {
		return this.capabilityAdminService.findGrades(academicYearId)
	}

	/**
	 * Level 3. Legacy's `@capability` answers a missing master biaya with
	 * `redirect()->route('studentCapability.grade')`, which an XHR client cannot act on; the same
	 * refusal arrives here as 422 carrying the modal's own copy.
	 */
	@Get("academic-years/:academicYearId/grades/:gradeId/students")
	@ApiOperation({ summary: "Level 3 — santri pada satu kelas" })
	@ApiResponseWrapped({ status: 200, description: "Daftar santri", type: CapabilityStudentRowDto, isArray: true })
	@ApiResponse({ status: 422, description: "Master biaya belum ditentukan!" })
	async findStudents(
		@Param("academicYearId", ParseIntPipe) academicYearId: number,
		@Param("gradeId", ParseIntPipe) gradeId: number,
	): Promise<CapabilityStudentRow[]> {
		return this.capabilityAdminService.findStudents(academicYearId, gradeId)
	}

	// Declared before ":capabilityId/students/:studentGradeId" so the literal segment wins
	@Get("students/:studentGradeId/history")
	@ApiOperation({ summary: "Level 4 — riwayat kesanggupan satu santri" })
	@ApiResponseWrapped({ status: 200, description: "Riwayat kesanggupan", type: CapabilityHistoryRowDto, isArray: true })
	@ApiResponse({ status: 404, description: "Santri tidak ditemukan" })
	async findHistory(
		@Param("studentGradeId", ParseIntPipe) studentGradeId: number,
	): Promise<CapabilityHistoryRow[]> {
		return this.capabilityAdminService.findHistory(studentGradeId)
	}

	@Get("students/:studentGradeId")
	@ApiOperation({ summary: "Level 4 — halaman satu santri" })
	@ApiResponseWrapped({ status: 200, description: "Halaman santri", type: CapabilityStudentPageDto })
	@ApiResponse({ status: 404, description: "Santri tidak ditemukan" })
	async findStudentPage(
		@Param("studentGradeId", ParseIntPipe) studentGradeId: number,
	): Promise<CapabilityStudentPage> {
		return this.capabilityAdminService.findStudentPage(studentGradeId)
	}

	@Get(":capabilityId/students/:studentGradeId/items")
	@ApiOperation({ summary: "Level 5 — item kesanggupan" })
	@ApiResponseWrapped({ status: 200, description: "Item kesanggupan", type: CapabilityItemRowDto, isArray: true })
	@ApiResponse({ status: 404, description: "Kesanggupan tidak ditemukan untuk santri ini" })
	async findItems(
		@Param("capabilityId", ParseIntPipe) capabilityId: number,
		@Param("studentGradeId", ParseIntPipe) studentGradeId: number,
	): Promise<CapabilityItemRow[]> {
		return this.capabilityAdminService.findItems(capabilityId, studentGradeId)
	}

	/**
	 * `@print` (882-897) — `resources/views/print/capability.blade.php`, opened with
	 * `target="_blank"` and printing itself on load.
	 *
	 * Rendered inline rather than as an attachment, which is what makes the new tab show the sheet
	 * instead of saving it. The link carries no Authorization header, so this route is reached with
	 * the `access_token` cookie the JWT strategy also accepts.
	 */
	@Get(":capabilityId/students/:studentGradeId/print")
	@ApiOperation({ summary: "Cetak lembar kesanggupan" })
	async print(
		@Param("capabilityId", ParseIntPipe) capabilityId: number,
		@Param("studentGradeId", ParseIntPipe) studentGradeId: number,
		@Res() res: Response,
	): Promise<void> {
		const { body, contentType } = await this.capabilityAdminService.print(capabilityId, studentGradeId)
		res.setHeader("Content-Type", contentType)
		res.send(body)
	}

	/**
	 * `@downloadPDF` (900-926). Served with `@Res()`, so the wrapping response interceptor is
	 * bypassed and the PDF reaches the browser as a file.
	 *
	 * The filename is legacy's `"Kesanggupan - {$studentGrade->fullname}.pdf"`, already stripped of
	 * the characters that would break this header (`capability-format.ts`). What is left can still
	 * hold non-ASCII, which RFC 6266's quoted form cannot carry, so that form is reduced to a
	 * fallback for old clients and `filename*` carries the real name.
	 */
	@Get(":capabilityId/students/:studentGradeId/download")
	@ApiOperation({ summary: "Unduh lembar kesanggupan" })
	async download(
		@Param("capabilityId", ParseIntPipe) capabilityId: number,
		@Param("studentGradeId", ParseIntPipe) studentGradeId: number,
		@Res() res: Response,
	): Promise<void> {
		const { body, fileName, contentType } = await this.capabilityAdminService.download(capabilityId, studentGradeId)
		res.setHeader("Content-Type", contentType)
		res.setHeader("Content-Length", body.length)
		res.setHeader(
			"Content-Disposition",
			`attachment; filename="${fileName.replace(/[^ -~]/g, "_")}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
		)
		res.end(body)
	}

	@Get(":capabilityId/students/:studentGradeId")
	@ApiOperation({ summary: "Level 5 — halaman item kesanggupan" })
	@ApiResponseWrapped({ status: 200, description: "Halaman item kesanggupan", type: CapabilityItemPageDto })
	@ApiResponse({ status: 404, description: "Kesanggupan tidak ditemukan untuk santri ini" })
	async findItemPage(
		@Param("capabilityId", ParseIntPipe) capabilityId: number,
		@Param("studentGradeId", ParseIntPipe) studentGradeId: number,
	): Promise<CapabilityItemPage> {
		return this.capabilityAdminService.findItemPage(capabilityId, studentGradeId)
	}
}
