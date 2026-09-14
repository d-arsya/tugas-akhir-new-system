import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import { Roles } from "../../../core/auth/decorators/roles.decorator"
import { JwtAuthGuard } from "../../../core/auth/guards/jwt-auth.guard"
import { RolesGuard } from "../../../core/auth/guards/roles.guard"
import { ApiResponseWrapped } from "../../../core/decorators/api-response-wrapped.decorator"
import { IpBanService } from "../../../core/ip-ban/ip-ban.service"
import type { CreateIpBanDto } from "../dto/ip-ban.dto"
import type { PaginationQueryDto } from "../../../core/dto/pagination-query.dto"

import { IpBanResponseDto } from "../dto/ip-ban.dto"
import { AdminMessageResponseDto } from "../dto/admin-response.dto"

@ApiTags("Admin — IP Ban Management")
@Controller("admin/ip-bans")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin")
@ApiBearerAuth("JWT-Auth")
export class AdminIpBanController {
	constructor(private readonly ipBanService: IpBanService) {}

	@Get()
	@ApiOperation({ summary: "Daftar IP yang diblokir" })
	@ApiResponseWrapped({ status: 200, description: "List banned IPs", type: IpBanResponseDto, isPaginated: true })
	async findAll(@Query() query: PaginationQueryDto) {
		return this.ipBanService.findAll(query)
	}

	@Post()
	@ApiOperation({ summary: "Blokir IP baru" })
	@ApiResponseWrapped({ status: 201, description: "IP berhasil diblokir", type: IpBanResponseDto })
	async ban(@Body() dto: CreateIpBanDto) {
		return this.ipBanService.ban(dto.ipAddress)
	}

	@Delete(":ip")
	@ApiOperation({ summary: "Buka blokir IP" })
	@ApiResponseWrapped({ status: 200, description: "IP berhasil dibuka blokirnya", type: AdminMessageResponseDto })
	async unban(@Param("ip") ip: string) {
		await this.ipBanService.unban(ip)
		return { success: true, message: `IP ${ip} berhasil dibuka dari daftar blokir.` }
	}
}

