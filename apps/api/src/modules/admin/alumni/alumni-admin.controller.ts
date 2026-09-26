import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Res, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common"
import { FileFieldsInterceptor } from "@nestjs/platform-express"
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiProduces, ApiTags } from "@nestjs/swagger"
import type { Response } from "express"

import type { AdminAlumniDetail, AdminAlumniList, AdminAlumniMessage, AdminAlumniYearRow } from "@roja/types"

import { Roles } from "../../../core/auth/decorators/roles.decorator"
import { DestructiveGuard } from "../../../core/auth/guards/destructive.guard"
import { JwtAuthGuard } from "../../../core/auth/guards/jwt-auth.guard"
import { RolesGuard } from "../../../core/auth/guards/roles.guard"
import type { SocietyUpload } from "../../../shared/society/society-rules"

// Nest DI reads constructor parameter types at runtime (emitDecoratorMetadata), so these stay value imports
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { AlumniAdminService } from "./alumni-admin.service"
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { AlumniWriteService } from "./alumni-write.service"

const XLSX_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

// `name` of every attachment input on the alumni attachment tab
const ATTACHMENT_FIELDS = [
	"attach_certificate",
	"attach_photo",
	"attach_family_card",
	"attach_ksp",
	"attach_kip",
	"attach_report_card",
	"attach_birth_certificate",
].map((name) => ({ name, maxCount: 1 }))

// Legacy `AlumniController` (Akademik → Alumni, `L/routes/web.php:264-289`), behind legacy `asAdmin`:
// Superadmin | Admin. Owned by workstream AK-A. Literal routes come before the `:alumniId` ones; every delete
// also takes `DestructiveGuard`. Imports (`import`, `exportTemplate`, `delete-failed-data`) are not ported.
@ApiTags("Admin — Akademik Alumni")
@ApiBearerAuth("JWT-Auth")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin", "Admin")
@Controller("admin/alumni")
export class AlumniAdminController {
	constructor(
		private readonly alumniAdminService: AlumniAdminService,
		private readonly alumniWriteService: AlumniWriteService,
	) {}

	@Get("years")
	@ApiOperation({ summary: "Daftar tahun kelulusan (tab Alumni)" })
	async years(): Promise<AdminAlumniYearRow[]> {
		return this.alumniAdminService.years()
	}

	@Get("archive")
	@ApiOperation({ summary: "Alumni tahun ajaran Archive (tab Archive)" })
	async archive(): Promise<AdminAlumniList> {
		return this.alumniAdminService.archive()
	}

	@Get("graduation-years/:year")
	@ApiOperation({ summary: "Alumni per tahun kelulusan" })
	async byYear(@Param("year", ParseIntPipe) year: number): Promise<AdminAlumniList> {
		return this.alumniAdminService.byYear(year)
	}

	@Get("graduation-years/:year/export")
	@ApiOperation({ summary: "Export alumni per tahun kelulusan (xlsx)" })
	@ApiProduces(XLSX_TYPE)
	async export(@Param("year", ParseIntPipe) year: number, @Res() res: Response): Promise<void> {
		const file = await this.alumniAdminService.export(year)
		// Streams the workbook directly, bypassing the JSON TransformInterceptor
		res.setHeader("Content-Type", XLSX_TYPE)
		res.setHeader("Content-Disposition", `attachment; filename="${file.fileName}"; filename*=UTF-8''${encodeURIComponent(file.fileName)}`)
		res.send(file.buffer)
	}

	@Delete("graduation-years/:year")
	@UseGuards(DestructiveGuard)
	@ApiOperation({ summary: "Hapus semua alumni satu tahun kelulusan" })
	async destroyByYear(@Param("year", ParseIntPipe) year: number): Promise<AdminAlumniMessage> {
		return this.alumniWriteService.destroyByYear(year)
	}

	@Get(":alumniId")
	@ApiOperation({ summary: "Detail alumni" })
	async detail(@Param("alumniId", ParseIntPipe) alumniId: number): Promise<AdminAlumniDetail> {
		return this.alumniAdminService.detail(alumniId)
	}

	/**
	 * `print()` — `print/alumni.blade.php`, opened with `target="_blank"` and printing itself on load. The link
	 * carries no Authorization header, so it is reached with the `access_token` cookie the JWT strategy accepts.
	 */
	@Get(":alumniId/print")
	@ApiOperation({ summary: "Cetak detail alumni" })
	async print(@Param("alumniId", ParseIntPipe) alumniId: number, @Res() res: Response): Promise<void> {
		const html = await this.alumniAdminService.print(alumniId)
		res.setHeader("Content-Type", "text/html; charset=utf-8")
		res.send(html)
	}

	@Patch(":alumniId")
	@ApiOperation({ summary: "Simpan detail alumni" })
	@ApiConsumes("multipart/form-data")
	// No multer `limits`: the size rule answers with the legacy message on the field
	@UseInterceptors(FileFieldsInterceptor(ATTACHMENT_FIELDS))
	async update(
		@Param("alumniId", ParseIntPipe) alumniId: number,
		@Body() body: Record<string, unknown>,
		@UploadedFiles() files: Record<string, SocietyUpload[] | undefined> | undefined,
	): Promise<AdminAlumniMessage> {
		return this.alumniWriteService.update(alumniId, body, files)
	}

	@Delete(":alumniId")
	@UseGuards(DestructiveGuard)
	@ApiOperation({ summary: "Hapus alumni (santri diaktifkan kembali)" })
	async destroy(@Param("alumniId", ParseIntPipe) alumniId: number): Promise<AdminAlumniMessage> {
		return this.alumniWriteService.destroy(alumniId)
	}
}
