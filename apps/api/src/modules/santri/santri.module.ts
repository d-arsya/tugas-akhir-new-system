import { Module } from "@nestjs/common"
import { JwtModule } from "@nestjs/jwt"
import { TypeOrmModule } from "@nestjs/typeorm"
import { MailerModule } from "@core/mailer/mailer.module"
import { StorageModule } from "@core/storage/storage.module"
import { EwalletModule } from "@modules/ewallet/ewallet.module"
import { SantriAuthController } from "@santri/auth/santri-auth.controller"
import { SantriAuthService } from "@santri/auth/santri-auth.service"
import { SantriGoogleLoginService } from "@santri/auth/santri-google-login.service"
import { SantriPasswordResetService } from "@santri/auth/services/santri-password-reset.service"
import { SettingSchool } from "@shared/school/entities/setting-school.entity"
import { StudentGrade } from "@santri/entities/student-grade.entity"
import { StudentCapability } from "@santri/entities/student-capability.entity"
import { StudentCostCapability } from "@santri/entities/student-cost-capability.entity"
import { StudentInvoiceTransaction } from "@santri/entities/student-invoice-transaction.entity"
import { StudentInvoice } from "@santri/entities/student-invoice.entity"
import { StudentPasswordReset } from "@santri/entities/student-password-reset.entity"
import { StudentTransaction } from "@santri/entities/student-transaction.entity"
import { Student } from "@santri/entities/student.entity"
import { TwoFactorStudent } from "@santri/entities/two-factor-student.entity"
import { SantriEwalletTransactionController } from "@santri/ewallet/santri-ewallet-transaction.controller"
import { SantriEwalletTransactionService } from "@santri/ewallet/santri-ewallet-transaction.service"
import { SantriEwalletController } from "@santri/ewallet/santri-ewallet.controller"
import { SantriEwalletService } from "@santri/ewallet/santri-ewallet.service"
import { ActiveStudentGuard } from "@santri/guards/active-student.guard"
import { EwalletPinGuard } from "@santri/guards/ewallet-pin.guard"
import { NoEwalletGuard } from "@santri/guards/no-ewallet.guard"
import { SantriJwtAuthGuard } from "@santri/guards/santri-jwt-auth.guard"
import { SantriJwtRefreshGuard } from "@santri/guards/santri-jwt-refresh.guard"
import { PaymentHistoryController } from "@santri/payment-history/payment-history.controller"
import { PaymentHistoryService } from "@santri/payment-history/payment-history.service"
import { ProfileController } from "@santri/profile/profile.controller"
import { ProfileService } from "@santri/profile/profile.service"
import { SettingController } from "@santri/setting/setting.controller"
import { SettingService } from "@santri/setting/setting.service"

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Student,
			TwoFactorStudent,
			StudentPasswordReset,
			StudentGrade,
			StudentCapability,
			StudentCostCapability,
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
		SantriGoogleLoginService,
		SantriPasswordResetService,
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
		SantriPasswordResetService,
		SantriEwalletService,
		SantriEwalletTransactionService,
		PaymentHistoryService,
		ProfileService,
		SettingService,
	],
})
export class SantriModule {}
