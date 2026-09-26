import { Body, Controller, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import type { CapabilityPublishResult } from "@roja/types"

import { Roles } from "@core/auth/decorators/roles.decorator"
import { JwtAuthGuard } from "@core/auth/guards/jwt-auth.guard"
import { RolesGuard } from "@core/auth/guards/roles.guard"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import { AdminMessageResponseDto } from "@admin/common/admin-response.dto"
import { CapabilityPublishResultDto, CapabilityWriteDto } from "@admin/capabilities/dto/capability-publish.dto"
import { CapabilityPublishService } from "@admin/capabilities/capability-publish.service"

/** Legacy's own wording for both create paths, byte-for-byte (no full stop — legacy has none). */
const CREATED = "Kesanggupan baru berhasil dibuat"

// Legacy `StudentCapabilityController` routes 16 (`store`), 17 (`change`), 22 (`update`) and
// 23 (`publishInvoice`) — the single-santri writes. Legacy gated all 23 routes with `asBendahara`:
// superadmin or bendahara only, narrower than Data Master.
//
// **Route order matters.** The literal `students/…` forms are declared before the
// `:capabilityId/…` ones so `/students/12` cannot be read as capability 12 (see the note at
// `invoice-admin.controller.ts:46`).
@ApiTags("Admin — Kesanggupan")
@ApiBearerAuth("JWT-Auth")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin", "Bendahara")
@Controller("admin/student-capabilities")
export class CapabilitySingleController {
	constructor(private readonly capabilityPublishService: CapabilityPublishService) {}

	@Post("students/:studentGradeId")
	@ApiOperation({ summary: "Buat kesanggupan baru untuk satu santri (belum disepakati)" })
	@ApiResponseWrapped({ status: 201, description: CREATED, type: CapabilityPublishResultDto })
	@ApiResponse({ status: 404, description: "Santri tidak ditemukan" })
	async create(
		@Param("studentGradeId", ParseIntPipe) studentGradeId: number,
		@Body() body: CapabilityWriteDto,
	): Promise<CapabilityPublishResult> {
		return this.capabilityPublishService.create(studentGradeId, body)
	}

	@Post("students/:studentGradeId/change")
	@ApiOperation({ summary: "Ubah kesanggupan: salin yang telah disepakati menjadi draf baru" })
	@ApiResponseWrapped({ status: 201, description: CREATED, type: CapabilityPublishResultDto })
	@ApiResponse({ status: 422, description: "Santri belum memiliki kesanggupan yang disepakati" })
	async change(
		@Param("studentGradeId", ParseIntPipe) studentGradeId: number,
	): Promise<CapabilityPublishResult> {
		return this.capabilityPublishService.change(studentGradeId)
	}

	@Patch(":capabilityId/students/:studentGradeId")
	@ApiOperation({ summary: "Simpan catatan dan item kesanggupan yang belum disepakati" })
	@ApiResponseWrapped({ status: 200, description: "Data berhasil diupdate.", type: AdminMessageResponseDto })
	@ApiResponse({ status: 404, description: "Kesanggupan tidak ditemukan untuk santri ini" })
	async update(
		@Param("capabilityId", ParseIntPipe) capabilityId: number,
		@Param("studentGradeId", ParseIntPipe) studentGradeId: number,
		@Body() body: CapabilityWriteDto,
	): Promise<{ message: string }> {
		return this.capabilityPublishService.update(capabilityId, studentGradeId, body)
	}

	/**
	 * "Telah Disepakati". One press invalidates the santri's entire previous generation — paid
	 * invoices included — and writes a new one. That is legacy's behaviour and it is kept: there is
	 * no confirmation step and no destructive gate.
	 */
	@Post(":capabilityId/students/:studentGradeId/publish")
	@ApiOperation({ summary: "Sepakati kesanggupan dan buat tagihan santri" })
	@ApiResponseWrapped({
		status: 201,
		description: "Kesanggupan telah disepakati. Dan tagihan berhasil dibuat.",
		type: CapabilityPublishResultDto,
	})
	@ApiResponse({ status: 404, description: "Kesanggupan tidak ditemukan untuk santri ini" })
	@ApiResponse({ status: 422, description: "Silakan pilih minimal 1 kesanggupan." })
	async publish(
		@Param("capabilityId", ParseIntPipe) capabilityId: number,
		@Param("studentGradeId", ParseIntPipe) studentGradeId: number,
	): Promise<CapabilityPublishResult> {
		return this.capabilityPublishService.publish(capabilityId, studentGradeId)
	}
}
