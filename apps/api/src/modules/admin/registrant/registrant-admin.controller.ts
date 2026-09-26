import { BadRequestException, Controller, Delete, Inject, Get, Param, ParseIntPipe, Query, Res, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import type { Response } from "express"

import type {
	AdminMessageResult,
	AdminRegistrantAcademicYearPage,
	AdminRegistrantAcademicYearRow,
	AdminRegistrantDetail,
	AdminRegistrantExportStatus,
	AdminRegistrantListTab,
	AdminRegistrantRow,
} from "@roja/types"

import { Roles } from "../../../core/auth/decorators/roles.decorator"
import { DestructiveGuard } from "../../../core/auth/guards/destructive.guard"
import { JwtAuthGuard } from "../../../core/auth/guards/jwt-auth.guard"
import { RolesGuard } from "../../../core/auth/guards/roles.guard"

import { RegistrantAdminService } from "./registrant-admin.service"

// Legacy `RegistrantController` (Akademik → PSB), behind legacy `asAdmin`: Superadmin | Admin.
// Owned by workstream AK-P. The literal `academic-years/…` routes come before `:registrantId`;
// the create / update / status routes live in `RegistrantFormController`, registered first.

const TABS: readonly AdminRegistrantListTab[] = ["new", "approved", "rejected"]
const EXPORT_STATUSES: readonly AdminRegistrantExportStatus[] = ["", "wait", "approve", "reject"]

@ApiTags("Admin — Akademik PSB")
@ApiBearerAuth("JWT-Auth")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin", "Admin")
@Controller("admin/registrants")
export class RegistrantAdminController {
	constructor(@Inject(RegistrantAdminService) private readonly registrantAdminService: RegistrantAdminService) {}

	@Get()
	@ApiOperation({ summary: "Data PSB — pilih tahun ajaran (academicYearList)" })
	async findAcademicYears(): Promise<AdminRegistrantAcademicYearRow[]> {
		return this.registrantAdminService.findAcademicYears()
	}

	@Get("academic-years/:academicYearId")
	@ApiOperation({ summary: "Data PSB satu tahun ajaran — judul dan jumlah per tab (showAcademicYear)" })
	async findAcademicYearPage(@Param("academicYearId", ParseIntPipe) academicYearId: number): Promise<AdminRegistrantAcademicYearPage> {
		return this.registrantAdminService.findAcademicYearPage(academicYearId)
	}

	@Get("academic-years/:academicYearId/export")
	@ApiOperation({ summary: "Export PSB (download/{approval_status?})" })
	async export(
		@Param("academicYearId", ParseIntPipe) academicYearId: number,
		@Query("status") status: string | undefined,
		@Res() res: Response,
	): Promise<void> {
		const key = (status ?? "") as AdminRegistrantExportStatus
		if (!EXPORT_STATUSES.includes(key)) throw new BadRequestException("Status tidak valid")
		const { body, fileName } = await this.registrantAdminService.exportRows(academicYearId, key)
		res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
		res.setHeader("Content-Length", body.length)
		res.setHeader(
			"Content-Disposition",
			`attachment; filename="${fileName.replace(/[^ -~]/g, "_")}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
		)
		res.end(body)
	}

	@Get("academic-years/:academicYearId/:tab")
	@ApiOperation({ summary: "Daftar PSB baru / diterima / tidak diterima" })
	async findRows(
		@Param("academicYearId", ParseIntPipe) academicYearId: number,
		@Param("tab") tab: string,
	): Promise<AdminRegistrantRow[]> {
		if (!TABS.includes(tab as AdminRegistrantListTab)) throw new BadRequestException("Tab tidak valid")
		return this.registrantAdminService.findRows(academicYearId, tab as AdminRegistrantListTab)
	}

	/** `print(Registrant)` — opened `target="_blank"`, so it authenticates with the `access_token` cookie. */
	@Get(":registrantId/print")
	@ApiOperation({ summary: "Cetak data pendaftar" })
	async print(@Param("registrantId", ParseIntPipe) registrantId: number, @Res() res: Response): Promise<void> {
		const html = await this.registrantAdminService.print(registrantId)
		res.setHeader("Content-Type", "text/html; charset=utf-8")
		res.send(html)
	}

	@Get(":registrantId")
	@ApiOperation({ summary: "Detail PSB (edit)" })
	async findDetail(@Param("registrantId", ParseIntPipe) registrantId: number): Promise<AdminRegistrantDetail> {
		return this.registrantAdminService.findDetail(registrantId)
	}

	@Delete(":registrantId")
	@UseGuards(DestructiveGuard)
	@ApiOperation({ summary: "Hapus pendaftar (destroy)" })
	async remove(@Param("registrantId", ParseIntPipe) registrantId: number): Promise<AdminMessageResult> {
		return this.registrantAdminService.remove(registrantId)
	}
}
