import { Body, Controller, Get, Patch, Res, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiProduces, ApiTags } from "@nestjs/swagger"
import type { Response } from "express"

import { Roles } from "@core/auth/decorators/roles.decorator"
import { RolesGuard } from "@core/auth/guards/roles.guard"
import { JwtAuthGuard } from "@core/auth/guards/jwt-auth.guard"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import { AdminMessageResponseDto } from "@admin/dto/admin-response.dto"
import {
	BackupFrequencyDto,
	SmtpConfigDto,
	SystemSettingResponseDto,
	TwoFactorDto,
} from "@admin/dto/admin-system-setting.dto"
import {
	AdminSystemSettingService,
	type SystemSetting,
} from "@admin/setting/admin-system-setting.service"

const TEXT_TYPE = "text/plain"

// WS-D: legacy SettingController (backup frequency, smtp, 2FA toggle, download)
@ApiTags("Admin — Sistem")
@ApiBearerAuth("JWT-Auth")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin")
@Controller("admin/settings/system")
export class AdminSystemSettingController {
	constructor(private readonly systemSettingService: AdminSystemSettingService) {}

	@Get()
	@ApiOperation({ summary: "Pengaturan sistem (backup, SMTP, two factor authentication)" })
	@ApiResponseWrapped({ status: 200, description: "Pengaturan sistem", type: SystemSettingResponseDto })
	async getSetting(): Promise<SystemSetting> {
		return this.systemSettingService.getSetting()
	}

	@Patch("backup-frequency")
	@ApiOperation({ summary: "Update frekuensi backup database" })
	@ApiResponseWrapped({ status: 200, description: "Data berhasil diupdate.", type: AdminMessageResponseDto })
	async updateBackupFrequency(@Body() body: BackupFrequencyDto): Promise<{ message: string }> {
		return this.systemSettingService.updateBackupFrequency(body.backupFrequency)
	}

	@Patch("smtp")
	@ApiOperation({ summary: "Update konfigurasi email (SMTP)" })
	@ApiResponseWrapped({ status: 200, description: "Data berhasil diupdate.", type: AdminMessageResponseDto })
	async updateSmtp(@Body() body: SmtpConfigDto): Promise<{ message: string }> {
		return this.systemSettingService.updateSmtp(body)
	}

	@Patch("two-factor")
	@ApiOperation({ summary: "Aktifkan / nonaktifkan two factor authentication" })
	@ApiResponseWrapped({ status: 200, description: "Data berhasil diupdate.", type: AdminMessageResponseDto })
	async updateTwoFactor(@Body() body: TwoFactorDto): Promise<{ message: string }> {
		return this.systemSettingService.updateTwoFactor(body.enabled2fa)
	}

	// Streams the file directly, bypassing the JSON TransformInterceptor
	@Get("database/download")
	@ApiOperation({ summary: "Download file backup database" })
	@ApiProduces(TEXT_TYPE)
	downloadDatabase(@Res() res: Response): void {
		const file = this.systemSettingService.buildDatabaseBackup()
		res.setHeader("Content-Type", TEXT_TYPE)
		res.setHeader(
			"Content-Disposition",
			`attachment; filename="${file.fileName}"; filename*=UTF-8''${encodeURIComponent(file.fileName)}`,
		)
		res.send(file.body)
	}
}
