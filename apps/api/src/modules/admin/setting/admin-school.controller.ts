import { Body, Controller, Get, Patch, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common"
import { FileFieldsInterceptor } from "@nestjs/platform-express"
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger"

import { Roles } from "@core/auth/decorators/roles.decorator"
import { RolesGuard } from "@core/auth/guards/roles.guard"
import { JwtAuthGuard } from "@core/auth/guards/jwt-auth.guard"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import { AdminSchoolService, type AdminSchoolSetting } from "@admin/setting/admin-school.service"
import { AdminSchoolSettingDto } from "@admin/setting/dto/admin-school.dto"
import { AdminMessageResponseDto } from "@admin/common/admin-response.dto"

// WS-B: legacy SettingSchoolController
@ApiTags("Admin — Profil Pondok")
@ApiBearerAuth("JWT-Auth")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin", "Admin")
@Controller("admin/settings/school")
export class AdminSchoolController {
	constructor(private readonly adminSchoolService: AdminSchoolService) {}

	@Get()
	@ApiOperation({ summary: "Profil pondok (identitas, logo, favicon dan alamat)" })
	@ApiResponseWrapped({ status: 200, description: "Profil pondok", type: AdminSchoolSettingDto })
	async getSchool(): Promise<AdminSchoolSetting> {
		return this.adminSchoolService.getSchool()
	}

	@Patch()
	@ApiOperation({ summary: "Ubah profil pondok" })
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		schema: {
			type: "object",
			properties: {
				logo: { type: "string", format: "binary" },
				favicon: { type: "string", format: "binary" },
				name: { type: "string" },
				slogan: { type: "string" },
				phone: { type: "string" },
				fullAddress: { type: "string" },
				provinceId: { type: "string" },
				regencyId: { type: "string" },
				districtId: { type: "string" },
				emptyLogo: { type: "string" },
				emptyFavicon: { type: "string" },
			},
		},
	})
	@ApiResponseWrapped({ status: 200, description: "Data berhasil diupdate", type: AdminMessageResponseDto })
	// No multer `limits`: the size rule has to answer with the legacy Indonesian message on the field
	@UseInterceptors(
		FileFieldsInterceptor([
			{ name: "logo", maxCount: 1 },
			{ name: "favicon", maxCount: 1 },
		]),
	)
	async updateSchool(
		@Body() body: unknown,
		@UploadedFiles() files: { logo?: Express.Multer.File[]; favicon?: Express.Multer.File[] },
	): Promise<{ message: string }> {
		return this.adminSchoolService.updateSchool(body, {
			logo: files?.logo?.[0],
			favicon: files?.favicon?.[0],
		})
	}
}
