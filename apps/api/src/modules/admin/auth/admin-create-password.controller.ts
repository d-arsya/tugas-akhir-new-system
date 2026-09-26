import { Body, Controller, Get, Headers, HttpCode, Ip, Post, Query, Res } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import type { Response } from "express"

import { Public } from "@core/auth/decorators/public.decorator"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import { setAuthCookies } from "@admin/auth/admin-auth-cookies"
import { AdminCreatePasswordService, type CreatePasswordCheck } from "@admin/auth/admin-create-password.service"
import type { AdminAuthResult } from "@admin/auth/admin-auth.service"
import { AdminAuthResultDto } from "@admin/auth/dto/admin-auth.dto"
import {
	CreatePasswordCheckQueryDto,
	CreatePasswordCheckResponseDto,
	CreatePasswordDto,
} from "@admin/auth/dto/admin-create-password.dto"

// Legacy `Auth\CreatePasswordController` — guest routes, so every handler is `@Public()`
@ApiTags("Admin — Buat Password")
@Controller("admin/auth/create-password")
export class AdminCreatePasswordController {
	constructor(
		private readonly createPasswordService: AdminCreatePasswordService,
		private readonly configService: ConfigService,
	) {}

	@Public()
	@Get("check")
	@ApiOperation({ summary: "Cek token buat password dari email pengelola baru" })
	@ApiResponseWrapped({ status: 200, description: "Token valid", type: CreatePasswordCheckResponseDto })
	@ApiResponse({ status: 400, description: "Token tidak sah atau telah kadaluarsa" })
	async check(@Query() query: CreatePasswordCheckQueryDto): Promise<CreatePasswordCheck> {
		return this.createPasswordService.check(query.token, query.email)
	}

	@Public()
	@Post()
	// Same 200 as `login`, which the client already handles
	@HttpCode(200)
	@ApiOperation({ summary: "Simpan password baru lalu masuk ke aplikasi" })
	@ApiResponseWrapped({ status: 200, description: "Password berhasil disimpan", type: AdminAuthResultDto })
	@ApiResponse({ status: 400, description: "Token tidak sah atau validasi gagal" })
	async create(
		@Body() dto: CreatePasswordDto,
		@Ip() ip: string,
		@Headers("user-agent") userAgent: string,
		@Res({ passthrough: true }) response: Response,
	): Promise<AdminAuthResult> {
		const result = await this.createPasswordService.create(dto, ip, userAgent)
		if (result.accessToken) {
			setAuthCookies(response, this.configService, result.accessToken, result.refreshToken)
		}
		return result
	}
}
