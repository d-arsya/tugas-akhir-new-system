import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import type {
	CapabilityItemRow,
	CapabilityMassPage,
	CapabilityMassResult,
	CapabilitySelectionResult,
} from "@roja/types"

import { Roles } from "@core/auth/decorators/roles.decorator"
import { JwtAuthGuard } from "@core/auth/guards/jwt-auth.guard"
import { RolesGuard } from "@core/auth/guards/roles.guard"
import {
	CapabilityMassQueryDto,
	CapabilityMassWriteDto,
	CapabilitySelectionDto,
} from "@admin/capabilities/dto/capability-mass.dto"
import { MassCapabilityService } from "@admin/capabilities/mass-capability.service"

// Legacy `StudentCapabilityController`, the bulk routes: `@storeToSession`, `@massCreate`,
// `@massCreateAccountList`, `@massStore`, `@massEdit`, `@massEditAccountList`, `@massUpdate`.
//
// All 23 legacy Kesanggupan routes sit behind the `asBendahara` middleware, so Admin and Kasir
// E-Wallet get 403 here — narrower than Data Master.
//
// Every path under this controller begins with the literal `academic-years`, so nothing here can
// be swallowed by the `:capabilityId` routes on the sibling controller; the sibling's own
// literal-before-param ordering still applies within it.
@ApiTags("Admin — Kesanggupan")
@ApiBearerAuth("JWT-Auth")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin", "Bendahara")
@Controller("admin/student-capabilities")
export class MassCapabilityController {
	constructor(private readonly massCapabilityService: MassCapabilityService) {}

	/**
	 * `@storeToSession`. Answers the redirect the level-3 page navigates to, with the tick list
	 * already in its query string — legacy parked it in one global session key instead, which is
	 * how two tabs could write santri A's amounts onto santri B.
	 */
	@Post("academic-years/:academicYearId/grades/:gradeId/selection")
	@ApiOperation({ summary: "Simpan santri yang dipilih dan tentukan halaman berikutnya" })
	@ApiResponse({ status: 201, description: "Tujuan redirect" })
	@ApiResponse({ status: 422, description: "Terdapat kesanggupan yang belum disepakati." })
	async storeSelection(
		@Param("academicYearId", ParseIntPipe) academicYearId: number,
		@Param("gradeId", ParseIntPipe) gradeId: number,
		@Body() body: CapabilitySelectionDto,
	): Promise<CapabilitySelectionResult> {
		return this.massCapabilityService.storeSelection(academicYearId, gradeId, body)
	}

	// Declared before "mass-create" so the literal "accounts" segment cannot be read as a suffix
	@Get("academic-years/:academicYearId/grades/:gradeId/mass-create/accounts")
	@ApiOperation({ summary: "Daftar akun pembayaran untuk buat kesanggupan masal" })
	@ApiResponse({ status: 200, description: "Daftar akun" })
	async findMassCreateAccounts(
		@Param("academicYearId", ParseIntPipe) academicYearId: number,
		@Param("gradeId", ParseIntPipe) gradeId: number,
	): Promise<CapabilityItemRow[]> {
		return this.massCapabilityService.findMassCreateAccounts(academicYearId, gradeId)
	}

	@Get("academic-years/:academicYearId/grades/:gradeId/mass-create")
	@ApiOperation({ summary: "Halaman buat kesanggupan masal" })
	@ApiResponse({ status: 200, description: "Halaman buat kesanggupan masal" })
	async findMassCreatePage(
		@Param("academicYearId", ParseIntPipe) academicYearId: number,
		@Param("gradeId", ParseIntPipe) gradeId: number,
		@Query() query: CapabilityMassQueryDto,
	): Promise<CapabilityMassPage> {
		return this.massCapabilityService.findMassCreatePage(academicYearId, gradeId, query.students)
	}

	/**
	 * `@massStore`. Creates an **approved** capability for every selected santri and publishes
	 * their invoices in the same request. The single-santri case never reaches here: legacy's form
	 * posts to `@store` instead and produces an unagreed capability with no invoices, and that
	 * flip is reproduced deliberately.
	 */
	@Post("academic-years/:academicYearId/grades/:gradeId/mass-create")
	@ApiOperation({ summary: "Buat kesanggupan secara masal" })
	@ApiResponse({ status: 201, description: "Data berhasil disimpan ke dalam basis data." })
	@ApiResponse({ status: 422, description: "Semua kesanggupan wajib untuk dipilih." })
	async massCreate(
		@Param("academicYearId", ParseIntPipe) academicYearId: number,
		@Param("gradeId", ParseIntPipe) gradeId: number,
		@Body() body: CapabilityMassWriteDto,
	): Promise<CapabilityMassResult> {
		return this.massCapabilityService.massCreate(academicYearId, gradeId, body)
	}

	@Get("academic-years/:academicYearId/grades/:gradeId/mass-edit/accounts")
	@ApiOperation({ summary: "Daftar akun pembayaran untuk ubah kesanggupan masal" })
	@ApiResponse({ status: 200, description: "Daftar akun" })
	async findMassEditAccounts(
		@Param("academicYearId", ParseIntPipe) academicYearId: number,
		@Param("gradeId", ParseIntPipe) gradeId: number,
		@Query() query: CapabilityMassQueryDto,
	): Promise<CapabilityItemRow[]> {
		return this.massCapabilityService.findMassEditAccounts(academicYearId, gradeId, query.students)
	}

	@Get("academic-years/:academicYearId/grades/:gradeId/mass-edit")
	@ApiOperation({ summary: "Halaman ubah kesanggupan masal" })
	@ApiResponse({ status: 200, description: "Halaman ubah kesanggupan masal" })
	async findMassEditPage(
		@Param("academicYearId", ParseIntPipe) academicYearId: number,
		@Param("gradeId", ParseIntPipe) gradeId: number,
		@Query() query: CapabilityMassQueryDto,
	): Promise<CapabilityMassPage> {
		return this.massCapabilityService.findMassEditPage(academicYearId, gradeId, query.students)
	}

	/**
	 * `@massUpdate`. Supersedes each santri's agreed capability with a new approved one and
	 * republishes. Legacy validated nothing here at all and dereferenced an unguarded `->first()`,
	 * so one capability-less santri 500'd a batch it had already half-written.
	 */
	@Post("academic-years/:academicYearId/grades/:gradeId/mass-edit")
	@ApiOperation({ summary: "Ubah kesanggupan secara masal" })
	@ApiResponse({ status: 201, description: "Data berhasil disimpan ke dalam basis data." })
	@ApiResponse({ status: 422, description: "Semua kesanggupan wajib untuk dipilih." })
	async massUpdate(
		@Param("academicYearId", ParseIntPipe) academicYearId: number,
		@Param("gradeId", ParseIntPipe) gradeId: number,
		@Body() body: CapabilityMassWriteDto,
	): Promise<CapabilityMassResult> {
		return this.massCapabilityService.massUpdate(academicYearId, gradeId, body)
	}
}
