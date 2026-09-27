import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"

import { CapabilityAdminController } from "@admin/capabilities/capability-admin.controller"
import { CapabilityAdminService } from "@admin/capabilities/capability-admin.service"
import { CapabilityDocumentQueue } from "@admin/capabilities/capability-document.queue"
import { CapabilityPublishService } from "@admin/capabilities/capability-publish.service"
import { CapabilitySingleController } from "@admin/capabilities/capability-single.controller"
import { MassCapabilityController } from "@admin/capabilities/mass-capability.controller"
import { MassCapabilityService } from "@admin/capabilities/mass-capability.service"
import { Accountancy } from "@admin/common/entities/accountancy.entity"
import { StudentCostTerm } from "@admin/common/entities/student-cost-term.entity"
import { StudentCapability } from "@santri/entities/student-capability.entity"
import { StudentCostCapability } from "@santri/entities/student-cost-capability.entity"
import { StudentGrade } from "@santri/entities/student-grade.entity"
import { StudentInvoiceTransaction } from "@santri/entities/student-invoice-transaction.entity"
import { StudentInvoice } from "@santri/entities/student-invoice.entity"
import { Student } from "@santri/entities/student.entity"
import { District } from "@shared/location/entities/district.entity"
import { Province } from "@shared/location/entities/province.entity"
import { Regency } from "@shared/location/entities/regency.entity"
import { AcademicYear } from "@shared/master/entities/academic-year.entity"
import { Grade } from "@shared/master/entities/grade.entity"
import { Level } from "@shared/master/entities/level.entity"
import { SettingSchool } from "@shared/school/entities/setting-school.entity"

@Module({
	imports: [
		TypeOrmModule.forFeature([
			AcademicYear,
			Accountancy,
			District,
			Grade,
			Level,
			Province,
			Regency,
			SettingSchool,
			Student,
			StudentCapability,
			StudentCostCapability,
			StudentCostTerm,
			StudentGrade,
			StudentInvoice,
			StudentInvoiceTransaction,
		]),
	],
	controllers: [CapabilityAdminController, CapabilitySingleController, MassCapabilityController],
	providers: [CapabilityAdminService, CapabilityPublishService, MassCapabilityService, CapabilityDocumentQueue],
})
export class CapabilitiesAdminModule {}
