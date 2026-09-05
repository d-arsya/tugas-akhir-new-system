import { Module } from "@nestjs/common"
import { JwtModule } from "@nestjs/jwt"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EwalletModule } from "../ewallet/ewallet.module"
import { StudentGrade } from "./entities/student-grade.entity"
import { StudentInvoiceTransaction } from "./entities/student-invoice-transaction.entity"
import { StudentInvoice } from "./entities/student-invoice.entity"
import { StudentTransaction } from "./entities/student-transaction.entity"
import { Student } from "./entities/student.entity"
import { TwoFactorStudent } from "./entities/two-factor-student.entity"
import { ActiveStudentGuard } from "./guards/active-student.guard"
import { EwalletPinGuard } from "./guards/ewallet-pin.guard"
import { SantriJwtAuthGuard } from "./guards/santri-jwt-auth.guard"

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Student,
			TwoFactorStudent,
			StudentGrade,
			StudentInvoice,
			StudentTransaction,
			StudentInvoiceTransaction,
		]),
		JwtModule.register({}),
		EwalletModule,
	],
	controllers: [],
	providers: [ActiveStudentGuard, SantriJwtAuthGuard, EwalletPinGuard],
	exports: [TypeOrmModule],
})
export class SantriModule {}
