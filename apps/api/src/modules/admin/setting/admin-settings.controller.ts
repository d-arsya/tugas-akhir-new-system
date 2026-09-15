import { Body, Controller, Get, Param, ParseIntPipe, Patch, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import { Roles } from "@core/auth/decorators/roles.decorator"
import { JwtAuthGuard } from "@core/auth/guards/jwt-auth.guard"
import { RolesGuard } from "@core/auth/guards/roles.guard"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import { AdminSettingsService } from "@admin/setting/admin-settings.service"
import {
	UpdateAnnouncementDto,
	UpdateSchoolSettingDto,
	SettingSchoolResponseDto,
	SettingAnncResponseDto,
	SettingFormResponseDto,
	SettingAllResponseDto,
} from "@admin/dto/admin-setting.dto"

@ApiTags("Admin — Settings")
@Controller("admin/settings")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin")
@ApiBearerAuth("JWT-Auth")
export class AdminSettingsController {
	constructor(private readonly adminSettingsService: AdminSettingsService) {}

	@Get()
	@ApiOperation({ summary: "Get semua setting sistem dalam 1 response" })
	@ApiResponseWrapped({ status: 200, description: "Semua data setting", type: SettingAllResponseDto })
	async getAllSettings() {
		return this.adminSettingsService.getAllSettings()
	}

	@Get("school")
	@ApiOperation({ summary: "Get profil sekolah" })
	@ApiResponseWrapped({ status: 200, description: "Profil sekolah", type: SettingSchoolResponseDto })
	async getSchoolSetting() {
		return this.adminSettingsService.getSchoolSetting()
	}

	@Patch("school")
	@ApiOperation({ summary: "Update profil sekolah" })
	@ApiResponseWrapped({ status: 200, description: "Profil sekolah diupdate", type: SettingSchoolResponseDto })
	async updateSchoolSetting(@Body() dto: UpdateSchoolSettingDto) {
		return this.adminSettingsService.updateSchoolSetting(dto)
	}

	@Get("announcements")
	@ApiOperation({ summary: "Get pengumuman PSB" })
	@ApiResponseWrapped({ status: 200, description: "Pengumuman PSB", type: SettingAnncResponseDto, isArray: true })
	async getAnnouncement() {
		return this.adminSettingsService.getAnnouncement()
	}

	@Patch("announcements")
	@ApiOperation({ summary: "Update pengumuman PSB" })
	@ApiResponseWrapped({ status: 200, description: "Pengumuman diupdate", type: SettingAnncResponseDto })
	async updateAnnouncement(@Body() dto: UpdateAnnouncementDto) {
		return this.adminSettingsService.updateAnnouncement(dto)
	}

	@Get("forms")
	@ApiOperation({ summary: "Daftar konfigurasi form PSB" })
	@ApiResponseWrapped({ status: 200, description: "List form settings", type: SettingFormResponseDto, isArray: true })
	async getFormSettings() {
		return this.adminSettingsService.getFormSettings()
	}

	@Patch("forms/:id")
	@ApiOperation({ summary: "Update status buka/tutup form PSB" })
	@ApiResponseWrapped({ status: 200, description: "Status form diupdate", type: SettingFormResponseDto })
	async updateFormSetting(
		@Param("id", ParseIntPipe) id: number,
		@Body("status") status: boolean,
	) {
		return this.adminSettingsService.updateFormSetting(id, status)
	}
}
