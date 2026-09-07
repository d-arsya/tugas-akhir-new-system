import { Module } from "@nestjs/common"
import { JwtModule } from "@nestjs/jwt"
import { TypeOrmModule } from "@nestjs/typeorm"
import { MailerModule } from "../core/mailer/mailer.module"
import { StorageModule } from "../core/storage/storage.module"
import { EwalletModule } from "../ewallet/ewallet.module"
import { SantriAuthController } from "./auth/santri-auth.controller"
import { SantriAuthService } from "./auth/santri-auth.service"
import { SettingSchool } from "./entities/setting-school.entity"
import { StudentGrade } from "./entities/student-grade.entity"
import { StudentInvoiceTransaction } from "./entities/student-invoice-transaction.entity"
import { StudentInvoice } from "./entities/student-invoice.entity"
import { StudentPasswordReset } from "./entities/student-password-reset.entity"
import { StudentTransaction } from "./entities/student-transaction.entity"
import { Student } from "./entities/student.entity"
import { TwoFactorStudent } from "./entities/two-factor-student.entity"
import { SantriEwalletTransactionController } from "./ewallet/santri-ewallet-transaction.controller"
import { SantriEwalletTransactionService } from "./ewallet/santri-ewallet-transaction.service"
import { SantriEwalletController } from "./ewallet/santri-ewallet.controller"
import { SantriEwalletService } from "./ewallet/santri-ewallet.service"
import { ActiveStudentGuard } from "./guards/active-student.guard"
import { EwalletPinGuard } from "./guards/ewallet-pin.guard"
import { NoEwalletGuard } from "./guards/no-ewallet.guard"
import { SantriJwtAuthGuard } from "./guards/santri-jwt-auth.guard"
import { SantriJwtRefreshGuard } from "./guards/santri-jwt-refresh.guard"
import { PaymentHistoryController } from "./payment-history/payment-history.controller"
import { PaymentHistoryService } from "./payment-history/payment-history.service"
import { ProfileController } from "./profile/profile.controller"
import { ProfileService } from "./profile/profile.service"
import { SettingController } from "./setting/setting.controller"
import { SettingService } from "./setting/setting.service"

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Student,
			TwoFactorStudent,
			StudentPasswordReset,
			StudentGrade,
			StudentInvoice,
			StudentTransaction,
			StudentInvoiceTransaction,
			SettingSchool,
		]),
		JwtModule.register({}),
		EwalletModule,
		StorageModule,
		MailerModule,
	],
	controllers: [
		SantriAuthController,
		SantriEwalletController,
		SantriEwalletTransactionController,
		PaymentHistoryController,
		ProfileController,
		SettingController,
	],
	providers: [
		SantriAuthService,
		SantriEwalletService,
		SantriEwalletTransactionService,
		PaymentHistoryService,
		ProfileService,
		SettingService,
		ActiveStudentGuard,
		SantriJwtAuthGuard,
		SantriJwtRefreshGuard,
		EwalletPinGuard,
		NoEwalletGuard,
	],
	exports: [
		TypeOrmModule,
		SantriAuthService,
		SantriEwalletService,
		SantriEwalletTransactionService,
		PaymentHistoryService,
		ProfileService,
		SettingService,
	],
})
export class SantriModule {}
