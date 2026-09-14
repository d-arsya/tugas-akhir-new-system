import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import { Roles } from "../../../core/auth/decorators/roles.decorator"
import { JwtAuthGuard } from "../../../core/auth/guards/jwt-auth.guard"
import { RolesGuard } from "../../../core/auth/guards/roles.guard"
import { ApiResponseWrapped } from "../../../core/decorators/api-response-wrapped.decorator"
import { BillingAdminService } from "../services/billing-admin.service"
import {
	CreateAccountancyDto,
	UpdateAccountancyDto,
	DelegateAccountancyChildrenDto,
	CreateCostTermDto,
	UpdateCostTermDto,
	BulkApplyCostTermDto,
	CreatePaymentTransactionDto,
	CancelTransactionDto,
	AccountancyResponseDto,
	CostTermResponseDto,
} from "../dto/billing-admin.dto"
import { AdminMessageResponseDto } from "../dto/admin-response.dto"

@ApiTags("Admin — Billing & Finance")
@Controller("admin/billing")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Superadmin", "Bendahara")
@ApiBearerAuth("JWT-Auth")
export class BillingAdminController {
	constructor(private readonly billingService: BillingAdminService) {}

	// Chart of Accounts
	@Get("accounts")
	@ApiOperation({ summary: "Get chart of accounts tree" })
	@ApiResponseWrapped({ status: 200, description: "Tree list akun", type: AccountancyResponseDto, isArray: true })
	async getAccountancyTree() {
		return this.billingService.getAccountancyTree()
	}

	@Post("accounts")
	@ApiOperation({ summary: "Tambah akun baru" })
	@ApiResponseWrapped({ status: 201, description: "Akun dibuat", type: AccountancyResponseDto })
	async createAccountancy(@Body() dto: CreateAccountancyDto) {
		return this.billingService.createAccountancy(dto)
	}

	@Patch("accounts/:id")
	@ApiOperation({ summary: "Update akun" })
	@ApiResponseWrapped({ status: 200, description: "Akun diupdate", type: AccountancyResponseDto })
	async updateAccountancy(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateAccountancyDto) {
		return this.billingService.updateAccountancy(id, dto)
	}

	@Delete("accounts/:id")
	@ApiOperation({ summary: "Hapus akun" })
	@ApiResponseWrapped({ status: 200, description: "Akun dihapus", type: AdminMessageResponseDto })
	async deleteAccountancy(@Param("id", ParseIntPipe) id: number) {
		return this.billingService.deleteAccountancy(id)
	}

	@Patch("accounts/:id/delegate-children")
	@ApiOperation({ summary: "Delegasikan sub-akun sebelum hapus" })
	@ApiResponseWrapped({ status: 200, description: "Sub-akun didelegasikan", type: AdminMessageResponseDto })
	async delegateChildren(@Param("id", ParseIntPipe) id: number, @Body() dto: DelegateAccountancyChildrenDto) {
		return this.billingService.delegateChildren(id, dto)
	}

	// Cost Terms per Class
	@Get("cost-terms/:academicYearId/:gradeId")
	@ApiOperation({ summary: "Daftar biaya per kelas" })
	@ApiResponseWrapped({ status: 200, description: "List biaya kelas", type: CostTermResponseDto, isArray: true })
	async getCostTerms(
		@Param("academicYearId", ParseIntPipe) academicYearId: number,
		@Param("gradeId", ParseIntPipe) gradeId: number,
	) {
		return this.billingService.getCostTerms(academicYearId, gradeId)
	}

	@Post("cost-terms/:academicYearId/:gradeId/:accountId")
	@ApiOperation({ summary: "Tambah biaya per kelas" })
	@ApiResponseWrapped({ status: 201, description: "Biaya kelas dibuat", type: CostTermResponseDto })
	async createCostTerm(
		@Param("academicYearId", ParseIntPipe) academicYearId: number,
		@Param("gradeId", ParseIntPipe) gradeId: number,
		@Param("accountId", ParseIntPipe) accountId: number,
		@Body() dto: CreateCostTermDto,
	) {
		return this.billingService.createCostTerm(academicYearId, gradeId, accountId, dto)
	}

	@Patch("cost-terms/:academicYearId/:gradeId/:accountId")
	@ApiOperation({ summary: "Update biaya per kelas" })
	@ApiResponseWrapped({ status: 200, description: "Biaya kelas diupdate", type: CostTermResponseDto })
	async updateCostTerm(
		@Param("academicYearId", ParseIntPipe) academicYearId: number,
		@Param("gradeId", ParseIntPipe) gradeId: number,
		@Param("accountId", ParseIntPipe) accountId: number,
		@Body() dto: UpdateCostTermDto,
	) {
		return this.billingService.updateCostTerm(academicYearId, gradeId, accountId, dto)
	}

	@Post("cost-terms/:academicYearId/:gradeId/apply")
	@ApiOperation({ summary: "Terapkan (apply) biaya dan buat tagihan massal" })
	@ApiResponseWrapped({ status: 200, description: "Tagihan massal berhasil dibuat", type: AdminMessageResponseDto })
	async bulkApplyCostTerms(
		@Param("academicYearId", ParseIntPipe) academicYearId: number,
		@Param("gradeId", ParseIntPipe) gradeId: number,
		@Body() dto: BulkApplyCostTermDto,
	) {
		return this.billingService.bulkApplyCostTerms(academicYearId, gradeId, dto)
	}

	// Student Invoices & Transactions
	@Get("students/:studentGradeId/invoices")
	@ApiOperation({ summary: "Daftar invoice tagihan santri" })
	@ApiResponseWrapped({ status: 200, description: "List invoice santri", isArray: true })
	async getStudentInvoices(@Param("studentGradeId", ParseIntPipe) studentGradeId: number) {
		return this.billingService.getStudentInvoices(studentGradeId)
	}

	@Get("students/:studentGradeId/transactions")
	@ApiOperation({ summary: "Daftar transaksi pembayaran santri" })
	@ApiResponseWrapped({ status: 200, description: "List transaksi santri", isArray: true })
	async getStudentTransactions(@Param("studentGradeId", ParseIntPipe) studentGradeId: number) {
		return this.billingService.getStudentTransactions(studentGradeId)
	}

	@Post("students/:studentGradeId/transactions")
	@ApiOperation({ summary: "Proses pembayaran tagihan santri" })
	@ApiResponseWrapped({ status: 201, description: "Pembayaran berhasil dicatat" })
	async createPayment(
		@Param("studentGradeId", ParseIntPipe) studentGradeId: number,
		@Body() dto: CreatePaymentTransactionDto,
	) {
		return this.billingService.createPayment(studentGradeId, dto)
	}

	@Patch("transactions/:id/cancel")
	@ApiOperation({ summary: "Batalkan transaksi pembayaran" })
	@ApiResponseWrapped({ status: 200, description: "Transaksi berhasil dibatalkan", type: AdminMessageResponseDto })
	async cancelTransaction(@Param("id", ParseIntPipe) id: number, @Body() dto: CancelTransactionDto) {
		return this.billingService.cancelTransaction(id, dto)
	}

	// Reports
	@Get("reports/income")
	@ApiOperation({ summary: "Laporan penerimaan pembayaran" })
	@ApiResponseWrapped({ status: 200, description: "Detail laporan penerimaan", isArray: true })
	async getReportsIncome() {
		return this.billingService.getReportsIncome()
	}

	@Get("reports/arrears")
	@ApiOperation({ summary: "Laporan tunggakan santri" })
	@ApiResponseWrapped({ status: 200, description: "Detail laporan tunggakan", isArray: true })
	async getReportsArrears() {
		return this.billingService.getReportsArrears()
	}
}
