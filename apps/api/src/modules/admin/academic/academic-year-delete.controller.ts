import { Controller, Delete, Get, Param, ParseIntPipe, Patch, Query, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger"

import { Roles } from "@core/auth/decorators/roles.decorator"
import { RolesGuard } from "@core/auth/guards/roles.guard"
import { JwtAuthGuard } from "@core/auth/guards/jwt-auth.guard"
import { DestructiveGuard } from "@core/auth/guards/destructive.guard"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import { AcademicYearDeleteStepDto, AdminRedirectResultDto } from "@admin/dto/academic-year-admin.dto"
import type { AcademicYearDeleteTarget } from "@admin/academic/academic-year-admin.service"
import {
	AcademicYearDeleteService,
	type AcademicYearDeleteStep,
	type AdminRedirectResult,
} from "@admin/academic/academic-year-delete.service"

// Legacy `AcademicYearController` delete flow. Each step is a full page in legacy, and the
// server picks the next one — so the mutations answer `{message, redirect}` and the client
// navigates immediately, exactly like `academic-year/delegate-ajax.js`.
@ApiTags("Admin — Tahun Ajaran")
@ApiBearerAuth("JWT-Auth")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin", "Admin")
@Controller("admin/academic-years")
export class AcademicYearDeleteController {
	constructor(private readonly academicYearDeleteService: AcademicYearDeleteService) {}

	@Get(":id/delete-step")
	@ApiOperation({ summary: "Data untuk halaman hapus / delegasi tahun ajaran" })
	@ApiQuery({ name: "step", enum: ["delete", "delegate-registrant", "delegate-student", "delegate-alumni"] })
	@ApiResponseWrapped({ status: 200, description: "Langkah hapus", type: AcademicYearDeleteStepDto })
	@ApiResponse({ status: 404, description: "Tahun ajaran tidak ditemukan" })
	async findStep(
		@Param("id", ParseIntPipe) id: number,
		@Query("step") step: AcademicYearDeleteTarget,
	): Promise<AcademicYearDeleteStep> {
		return this.academicYearDeleteService.findStep(id, step)
	}

	@Delete(":id")
	@UseGuards(DestructiveGuard)
	@ApiOperation({ summary: "Hapus tahun ajaran" })
	@ApiResponseWrapped({ status: 200, description: "Tahun ajaran berhasil dihapus", type: AdminRedirectResultDto })
	async remove(@Param("id", ParseIntPipe) id: number): Promise<AdminRedirectResult> {
		return this.academicYearDeleteService.remove(id)
	}

	@Patch(":id/delegate-registrant")
	@UseGuards(DestructiveGuard)
	@ApiOperation({ summary: "Pindahkan pendaftar ke Archive, lalu lanjut ke langkah berikutnya" })
	@ApiResponseWrapped({ status: 200, description: "Data PSB didistribusikan", type: AdminRedirectResultDto })
	async delegateRegistrant(@Param("id", ParseIntPipe) id: number): Promise<AdminRedirectResult> {
		return this.academicYearDeleteService.delegateRegistrant(id)
	}

	@Patch(":id/delegate-student")
	@UseGuards(DestructiveGuard)
	@ApiOperation({ summary: "Pindahkan santri ke Archive, lalu lanjut ke langkah berikutnya" })
	@ApiResponseWrapped({ status: 200, description: "Data Santri didistribusikan", type: AdminRedirectResultDto })
	async delegateStudent(@Param("id", ParseIntPipe) id: number): Promise<AdminRedirectResult> {
		return this.academicYearDeleteService.delegateStudent(id)
	}

	@Patch(":id/delegate-alumni")
	@UseGuards(DestructiveGuard)
	@ApiOperation({ summary: "Pindahkan alumni ke Archive, lalu hapus tahun ajaran" })
	@ApiResponseWrapped({ status: 200, description: "Data Alumni didistribusikan", type: AdminRedirectResultDto })
	async delegateAlumni(@Param("id", ParseIntPipe) id: number): Promise<AdminRedirectResult> {
		return this.academicYearDeleteService.delegateAlumni(id)
	}
}
