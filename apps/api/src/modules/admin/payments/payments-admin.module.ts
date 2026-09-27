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
import { StudentGrade } from "@santri/entities/student-grade.entity"
import { StudentInvoiceTransaction } from "@santri/entities/student-invoice-transaction.entity"
import { StudentInvoice } from "@santri/entities/student-invoice.entity"
import { StudentTransaction } from "@santri/entities/student-transaction.entity"
import { Student } from "@santri/entities/student.entity"
import { District } from "@shared/location/entities/district.entity"
import { Province } from "@shared/location/entities/province.entity"
import { Regency } from "@shared/location/entities/regency.entity"
import { AcademicYear } from "@shared/master/entities/academic-year.entity"
import { Level } from "@shared/master/entities/level.entity"
import { SettingSchool } from "@shared/school/entities/setting-school.entity"

@Module({
	imports: [
		TypeOrmModule.forFeature([
			StudentInvoice,
			StudentTransaction,
			StudentInvoiceTransaction,
			StudentGrade,
			Student,
			Accountancy,
			Level,
			AcademicYear,
			SettingSchool,
			District,
			Regency,
			Province,
		]),
	],
	controllers: [InvoiceAdminController, PaymentAdminController, TransactionAdminController],
	providers: [InvoiceAdminService, PaymentAdminService, TransactionAdminService, InvoiceDueDateScheduler],
})
export class PaymentsAdminModule {}
