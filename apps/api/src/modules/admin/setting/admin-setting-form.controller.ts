import { Body, Controller, Get, Param, ParseIntPipe, Patch, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"

import { Roles } from "@core/auth/decorators/roles.decorator"
import { RolesGuard } from "@core/auth/guards/roles.guard"
import { JwtAuthGuard } from "@core/auth/guards/jwt-auth.guard"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import {
	SettingFormGroupsResponseDto,
	SettingFormPatchDto,
	SettingFormPatchResultDto,
} from "@admin/setting/dto/admin-setting-form.dto"
import {
	AdminSettingFormService,
	type SettingFormPatchResult,
} from "@admin/setting/admin-setting-form.service"
import type { SettingFormGroups } from "@admin/setting/setting-form-groups"

// WS-C: legacy SettingFormController
// Legacy had no role middleware here; the port gates it to the two roles the sidebar shows it to.
@ApiTags("Admin — Form Data Santri")
@ApiBearerAuth("JWT-Auth")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin", "Admin")
@Controller("admin/settings/forms")
export class AdminSettingFormController {
	constructor(private readonly settingFormService: AdminSettingFormService) {}

	@Get()
	@ApiOperation({ summary: "Form Data Santri — seluruh kolom form PSB per tab" })
	@ApiResponseWrapped({ status: 200, description: "Kolom form PSB", type: SettingFormGroupsResponseDto })
	async getForms(): Promise<SettingFormGroups> {
		return this.settingFormService.getGroups()
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update satu kolom form (status, visibility, keterangan, required)" })
	@ApiResponseWrapped({ status: 200, description: "Kolom form diupdate", type: SettingFormPatchResultDto })
	async updateForm(
		@Param("id", ParseIntPipe) id: number,
		@Body() dto: SettingFormPatchDto,
	): Promise<SettingFormPatchResult> {
		return this.settingFormService.update(id, dto)
	}
}
