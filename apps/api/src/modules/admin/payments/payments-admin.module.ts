import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"

import { InvoiceAdminController } from "@admin/payments/invoice-admin.controller"
import { InvoiceAdminService } from "@admin/payments/invoice-admin.service"
import { InvoiceDueDateScheduler } from "@admin/payments/invoice-duedate.scheduler"
import { PaymentAdminController } from "@admin/payments/payment-admin.controller"
import { PaymentAdminService } from "@admin/payments/payment-admin.service"
import { TransactionAdminController } from "@admin/payments/transaction-admin.controller"
import { TransactionAdminService } from "@admin/payments/transaction-admin.service"
import { Accountancy } from "@admin/common/entities/accountancy.entity"
import { StudentInvoiceTransaction } from "@santri/entities/student-invoice-transaction.entity"
import { StudentInvoice } from "@santri/entities/student-invoice.entity"
import { StudentTransaction } from "@santri/entities/student-transaction.entity"

@Module({
	imports: [TypeOrmModule.forFeature([StudentInvoice, StudentTransaction, StudentInvoiceTransaction, Accountancy])],
	controllers: [InvoiceAdminController, PaymentAdminController, TransactionAdminController],
	providers: [InvoiceAdminService, PaymentAdminService, TransactionAdminService, InvoiceDueDateScheduler],
})
export class PaymentsAdminModule {}
