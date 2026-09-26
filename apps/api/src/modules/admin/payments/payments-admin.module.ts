import { Module } from "@nestjs/common"

import { InvoiceAdminController } from "@admin/payments/invoice-admin.controller"
import { InvoiceAdminService } from "@admin/payments/invoice-admin.service"
import { InvoiceDueDateScheduler } from "@admin/payments/invoice-duedate.scheduler"
import { PaymentAdminController } from "@admin/payments/payment-admin.controller"
import { PaymentAdminService } from "@admin/payments/payment-admin.service"
import { TransactionAdminController } from "@admin/payments/transaction-admin.controller"
import { TransactionAdminService } from "@admin/payments/transaction-admin.service"

@Module({
	controllers: [InvoiceAdminController, PaymentAdminController, TransactionAdminController],
	providers: [InvoiceAdminService, PaymentAdminService, TransactionAdminService, InvoiceDueDateScheduler],
})
export class PaymentsAdminModule {}
