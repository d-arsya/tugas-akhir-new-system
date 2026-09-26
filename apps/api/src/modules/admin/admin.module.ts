import { Module } from "@nestjs/common"

import { AcademicAdminModule } from "@admin/academic/academic-admin.module"
import { AlumniAdminModule } from "@admin/alumni/alumni-admin.module"
import { AuthAdminModule } from "@admin/auth/auth-admin.module"
import { BillingAdminModule } from "@admin/billing/billing-admin.module"
import { CapabilitiesAdminModule } from "@admin/capabilities/capabilities-admin.module"
import { DashboardAdminModule } from "@admin/dashboard/dashboard-admin.module"
import { EwalletAdminModule } from "@admin/ewallet/ewallet-admin.module"
import { MerchantAdminModule } from "@admin/merchant/merchant-admin.module"
import { PaymentsAdminModule } from "@admin/payments/payments-admin.module"
import { RegistrantAdminModule } from "@admin/registrant/registrant-admin.module"
import { ReportAdminModule } from "@admin/report/report-admin.module"
import { SettingAdminModule } from "@admin/setting/setting-admin.module"
import { StudentAdminModule } from "@admin/student/student-admin.module"
import { UserAdminModule } from "@admin/user/user-admin.module"

@Module({
	imports: [
		PaymentsAdminModule,
		CapabilitiesAdminModule,
		AuthAdminModule,
		UserAdminModule,
		SettingAdminModule,
		AcademicAdminModule,
		BillingAdminModule,
		MerchantAdminModule,
		DashboardAdminModule,
		ReportAdminModule,
		EwalletAdminModule,
		StudentAdminModule,
		RegistrantAdminModule,
		AlumniAdminModule,
	],
})
export class AdminModule {}
