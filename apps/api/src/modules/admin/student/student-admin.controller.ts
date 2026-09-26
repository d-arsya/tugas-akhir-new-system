import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Res,
	UploadedFiles,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common"
import { FileFieldsInterceptor } from "@nestjs/platform-express"
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger"
import type { Response } from "express"
import type {
	AdminStudentAcademicYear,
	AdminStudentCreated,
	AdminStudentDetail,
	AdminStudentGradeRow,
	AdminStudentOptions,
	AdminStudentRosterPage,
	AdminStudentRosterRow,
	AdminStudentYearRow,
	SocietyStepKey,
} from "@roja/types"

import { Roles } from "../../../core/auth/decorators/roles.decorator"
import { DestructiveGuard } from "../../../core/auth/guards/destructive.guard"
import { JwtAuthGuard } from "../../../core/auth/guards/jwt-auth.guard"
import { RolesGuard } from "../../../core/auth/guards/roles.guard"
import { readSocietyMultipart, type SocietyUpload } from "../../../shared/society/society-rules"

// Nest reads the DTO classes and the injected service at runtime (decorator metadata), so these stay value imports
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import {
	AdminStudentDropoutBodyDto,
	AdminStudentIdsBodyDto,
	AdminStudentMajorBodyDto,
	AdminStudentStatusBodyDto,
	AdminStudentSubGradeBodyDto,
	AdminStudentStepCheckBodyDto,
} from "./student-admin.dto"
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { StudentAdminService } from "./student-admin.service"

const XLSX_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
const STEPS: readonly SocietyStepKey[] = ["personal", "identity", "family", "guardian"]
/** `attach_*` inputs of the attachment step / tab */
const UPLOAD_FIELDS = FileFieldsInterceptor(
	["attach_certificate", "attach_photo", "attach_family_card", "attach_ksp", "attach_kip", "attach_report_card", "attach_birth_certificate"].map(
		(name) => ({ name, maxCount: 1 }),
	),
)

type Uploads = Record<string, SocietyUpload[] | undefined> | undefined
type Message = { message: string }

// Legacy `StudentController` (Akademik → Santri), behind legacy `asAdmin`: Superadmin | Admin.
// Owned by workstream AK-S. Literal routes come before the `:studentGradeId` ones; every delete also
// takes `DestructiveGuard`.
@ApiTags("Admin — Akademik Santri")
@ApiBearerAuth("JWT-Auth")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin", "Admin")
@Controller("admin/students")
export class StudentAdminController {
	constructor(private readonly studentAdminService: StudentAdminService) {}

	@Get("academic-years")
	@ApiOperation({ summary: "Daftar tahun ajaran (academicYearList)" })
	findYears(): Promise<AdminStudentYearRow[]> {
		return this.studentAdminService.findYears()
	}

	@Get("academic-years/:academicYearId")
	@ApiOperation({ summary: "Satu tahun ajaran (judul halaman kelas)" })
	findYear(@Param("academicYearId", ParseIntPipe) academicYearId: number): Promise<AdminStudentAcademicYear> {
		return this.studentAdminService.findYear(academicYearId)
	}

	@Get("academic-years/:academicYearId/grades")
	@ApiOperation({ summary: "Daftar kelas pada tahun ajaran (gradeList)" })
	findGrades(@Param("academicYearId", ParseIntPipe) academicYearId: number): Promise<AdminStudentGradeRow[]> {
		return this.studentAdminService.findGrades(academicYearId)
	}

	@Delete("academic-years/:academicYearId/grades/:grade")
	@UseGuards(DestructiveGuard)
	@ApiOperation({ summary: "Hapus santri aktif satu kelas (deleteStudentByGrade)" })
	async destroyByGrade(
		@Param("academicYearId", ParseIntPipe) academicYearId: number,
		@Param("grade", ParseIntPipe) grade: number,
	): Promise<Message> {
		return { message: await this.studentAdminService.destroyByGrade(academicYearId, grade) }
	}

	@Get("academic-years/:academicYearId/grades/:grade/levels/:levelId")
	@ApiOperation({ summary: "Data halaman daftar santri satu kelas (students)" })
	findRosterPage(
		@Param("academicYearId", ParseIntPipe) academicYearId: number,
		@Param("grade", ParseIntPipe) grade: number,
		@Param("levelId", ParseIntPipe) levelId: number,
	): Promise<AdminStudentRosterPage> {
		return this.studentAdminService.findRosterPage(academicYearId, grade, levelId)
	}

	@Get("academic-years/:academicYearId/grades/:grade/levels/:levelId/students")
	@ApiOperation({ summary: "Daftar santri satu kelas (studentList)" })
	findRoster(
		@Param("academicYearId", ParseIntPipe) academicYearId: number,
		@Param("grade", ParseIntPipe) grade: number,
		@Param("levelId", ParseIntPipe) levelId: number,
	): Promise<AdminStudentRosterRow[]> {
		return this.studentAdminService.findRoster(academicYearId, grade, levelId)
	}

	@Get("academic-years/:academicYearId/grades/:grade/levels/:levelId/export")
	@ApiOperation({ summary: "Export santri satu kelas (xlsx)" })
	async export(
		@Param("academicYearId", ParseIntPipe) academicYearId: number,
		@Param("grade", ParseIntPipe) grade: number,
		@Param("levelId", ParseIntPipe) levelId: number,
		@Res() res: Response,
	): Promise<void> {
		const file = await this.studentAdminService.export(academicYearId, grade, levelId)
		res.setHeader("Content-Type", XLSX_TYPE)
		res.setHeader("Content-Disposition", `attachment; filename="${file.fileName}"; filename*=UTF-8''${encodeURIComponent(file.fileName)}`)
		res.send(file.buffer)
	}

	@Get("options")
	@ApiOperation({ summary: "Pilihan tahun ajaran, jenjang, kelas, subkelas dan jurusan" })
	findOptions(): Promise<AdminStudentOptions> {
		return this.studentAdminService.findOptions()
	}

	@Post("create/validate/:step")
	@HttpCode(200)
	@ApiOperation({ summary: "Validasi satu langkah wizard Tambah Santri" })
	validateStep(@Param("step") step: string, @Body() body: AdminStudentStepCheckBodyDto): Promise<Message> {
		const key = STEPS.find((candidate) => candidate === step)
		if (!key) throw new BadRequestException("Langkah tidak dikenal")
		return this.studentAdminService.validateStep(key, body.values, body.diseases)
	}

	@Post("create")
	@ApiOperation({ summary: "Simpan santri baru (langkah lampiran)" })
	@ApiConsumes("multipart/form-data")
	@UseInterceptors(UPLOAD_FIELDS)
	create(@Body() body: Record<string, unknown>, @UploadedFiles() files: Uploads): Promise<AdminStudentCreated> {
		return this.studentAdminService.create(readSocietyMultipart(body, files))
	}

	@Post("next-grades")
	@HttpCode(200)
	@ApiOperation({ summary: "Naik Kelas" })
	async nextGrades(@Body() body: AdminStudentIdsBodyDto): Promise<Message> {
		return { message: await this.studentAdminService.nextGrades(body.ids) }
	}

	@Post("stay-grades")
	@HttpCode(200)
	@ApiOperation({ summary: "Tinggal Kelas" })
	async stayGrades(@Body() body: AdminStudentIdsBodyDto): Promise<Message> {
		return { message: await this.studentAdminService.stayGrades(body.ids) }
	}

	@Post("graduate")
	@HttpCode(200)
	@ApiOperation({ summary: "Lulus (membuat data alumni)" })
	async graduate(@Body() body: AdminStudentIdsBodyDto): Promise<Message> {
		return { message: await this.studentAdminService.graduate(body.ids) }
	}

	@Post("dropout")
	@HttpCode(200)
	@ApiOperation({ summary: "Keluar" })
	async dropout(@Body() body: AdminStudentDropoutBodyDto): Promise<Message> {
		return { message: await this.studentAdminService.dropout(body.ids, body.dropoutNote) }
	}

	@Post("update-major")
	@HttpCode(200)
	@ApiOperation({ summary: "Ubah jurusan" })
	async updateMajor(@Body() body: AdminStudentMajorBodyDto): Promise<Message> {
		return { message: await this.studentAdminService.updateMajor(body.ids, body.major) }
	}

	@Post("update-sub-grade")
	@HttpCode(200)
	@ApiOperation({ summary: "Ubah subkelas" })
	async updateSubGrade(@Body() body: AdminStudentSubGradeBodyDto): Promise<Message> {
		return { message: await this.studentAdminService.updateSubGrade(body.ids, body.subGrade) }
	}

	@Post("update-status")
	@HttpCode(200)
	@ApiOperation({ summary: "Ubah status akun" })
	async updateStatus(@Body() body: AdminStudentStatusBodyDto): Promise<Message> {
		return { message: await this.studentAdminService.updateStatus(body.ids, body.isBlocked) }
	}

	/** `print:1098` — opened with `target="_blank"`; reached with the `access_token` cookie. */
	@Get(":studentGradeId/print")
	@ApiOperation({ summary: "Cetak data santri" })
	async print(@Param("studentGradeId", ParseIntPipe) studentGradeId: number, @Res() res: Response): Promise<void> {
		const html = await this.studentAdminService.print(studentGradeId)
		res.setHeader("Content-Type", "text/html; charset=utf-8")
		res.send(html)
	}

	@Get(":studentGradeId")
	@ApiOperation({ summary: "Detail santri (edit)" })
	findDetail(@Param("studentGradeId", ParseIntPipe) studentGradeId: number): Promise<AdminStudentDetail> {
		return this.studentAdminService.findDetail(studentGradeId)
	}

	@Patch(":studentGradeId")
	@ApiOperation({ summary: "Simpan detail santri" })
	@ApiConsumes("multipart/form-data")
	@UseInterceptors(UPLOAD_FIELDS)
	update(
		@Param("studentGradeId", ParseIntPipe) studentGradeId: number,
		@Body() body: Record<string, unknown>,
		@UploadedFiles() files: Uploads,
	): Promise<Message> {
		return this.studentAdminService.update(studentGradeId, readSocietyMultipart(body, files))
	}

	@Delete(":studentGradeId")
	@UseGuards(DestructiveGuard)
	@ApiOperation({ summary: "Hapus santri (satu baris kelas)" })
	async destroy(@Param("studentGradeId", ParseIntPipe) studentGradeId: number): Promise<Message> {
		return { message: await this.studentAdminService.destroy(studentGradeId) }
	}
}
