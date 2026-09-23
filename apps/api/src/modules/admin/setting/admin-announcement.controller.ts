import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"

import { Roles } from "@core/auth/decorators/roles.decorator"
import { RolesGuard } from "@core/auth/guards/roles.guard"
import { JwtAuthGuard } from "@core/auth/guards/jwt-auth.guard"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import {
	AdminAnnouncementService,
	type SettingAnnouncement,
} from "@admin/setting/admin-announcement.service"
import {
	SettingAnnouncementDto,
	SettingAnnouncementUpdateDto,
} from "@admin/dto/admin-announcement.dto"
import { AdminMessageResponseDto } from "@admin/dto/admin-response.dto"

// WS-B: legacy SettingAnncsController
@ApiTags("Admin — Pengumuman PSB")
@ApiBearerAuth("JWT-Auth")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin", "Admin")
@Controller("admin/settings/announcement")
export class AdminAnnouncementController {
	constructor(private readonly adminAnnouncementService: AdminAnnouncementService) {}

	@Get()
	@ApiOperation({ summary: "Pengumuman PSB (teks pengumuman dan informasi daftar ulang)" })
	@ApiResponseWrapped({ status: 200, description: "Pengumuman PSB", type: SettingAnnouncementDto })
	async getAnnouncement(): Promise<SettingAnnouncement> {
		return this.adminAnnouncementService.getAnnouncement()
	}

	@Patch()
	@ApiOperation({ summary: "Ubah pengumuman PSB" })
	@ApiResponseWrapped({ status: 200, description: "Data berhasil diupdate", type: AdminMessageResponseDto })
	async updateAnnouncement(@Body() dto: SettingAnnouncementUpdateDto): Promise<{ message: string }> {
		return this.adminAnnouncementService.updateAnnouncement(dto)
	}
}
