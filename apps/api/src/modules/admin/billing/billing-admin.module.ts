import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"

import { AccountancyAdminController } from "@admin/billing/accountancy-admin.controller"
import { AccountancyAdminService } from "@admin/billing/accountancy-admin.service"
import { StudentCostAdminController } from "@admin/billing/student-cost-admin.controller"
import { StudentCostAdminService } from "@admin/billing/student-cost-admin.service"
import { Accountancy } from "@admin/common/entities/accountancy.entity"
import { StudentCostTerm } from "@admin/common/entities/student-cost-term.entity"
import { StudentCost } from "@admin/common/entities/student-cost.entity"
import { StudentCapability } from "@santri/entities/student-capability.entity"
import { StudentGrade } from "@santri/entities/student-grade.entity"
import { Student } from "@santri/entities/student.entity"
import { Grade } from "@shared/master/entities/grade.entity"

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Accountancy,
			Grade,
			Student,
			StudentCapability,
			StudentCost,
			StudentCostTerm,
			StudentGrade,
		]),
	],
	controllers: [AccountancyAdminController, StudentCostAdminController],
	providers: [AccountancyAdminService, StudentCostAdminService],
})
export class BillingAdminModule {}
