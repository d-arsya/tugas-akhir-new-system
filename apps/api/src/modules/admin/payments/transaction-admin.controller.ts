import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import type { ServerTableResult, StudentTransactionDetail, StudentTransactionListRow } from "@roja/types"

import { Roles } from "@core/auth/decorators/roles.decorator"
import { JwtAuthGuard } from "@core/auth/guards/jwt-auth.guard"
import { RolesGuard } from "@core/auth/guards/roles.guard"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import {
	StudentTransactionDetailDto,
	StudentTransactionListQueryDto,
	StudentTransactionListRowDto,
} from "@admin/payments/dto/transaction-admin.dto"
import { TransactionAdminService } from "@admin/payments/transaction-admin.service"

// Legacy `StudentTransactionController` — Riwayat Transaksi.
// `routes/web.php:401-407`, inside the `asBendahara` group: Superadmin and Bendahara only.
@ApiTags("Admin — Riwayat Transaksi")
@ApiBearerAuth("JWT-Auth")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin", "Bendahara")
@Controller("admin/student-transactions")
export class TransactionAdminController {
	constructor(private readonly transactionAdminService: TransactionAdminService) {}

	@Get()
	@ApiOperation({ summary: "Riwayat pembayaran seluruh santri (server-side)" })
	@ApiResponseWrapped({
		status: 200,
		description: "Riwayat pembayaran",
		type: StudentTransactionListRowDto,
		isPaginated: true,
	})
	async findAll(@Query() query: StudentTransactionListQueryDto): Promise<ServerTableResult<StudentTransactionListRow>> {
		return this.transactionAdminService.findAll(query)
	}

	@Get(":transactionId")
	@ApiOperation({ summary: "Detail satu pembayaran" })
	@ApiResponseWrapped({ status: 200, description: "Detail pembayaran", type: StudentTransactionDetailDto })
	async findOne(@Param("transactionId", ParseIntPipe) transactionId: number): Promise<StudentTransactionDetail> {
		return this.transactionAdminService.findOne(transactionId)
	}
}
