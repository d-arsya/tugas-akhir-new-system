import { Module } from "@nestjs/common"

import { AccountancyAdminController } from "@admin/billing/accountancy-admin.controller"
import { AccountancyAdminService } from "@admin/billing/accountancy-admin.service"
import { StudentCostAdminController } from "@admin/billing/student-cost-admin.controller"
import { StudentCostAdminService } from "@admin/billing/student-cost-admin.service"

@Module({
	controllers: [AccountancyAdminController, StudentCostAdminController],
	providers: [AccountancyAdminService, StudentCostAdminService],
})
export class BillingAdminModule {}
