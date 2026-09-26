import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"

import { CapabilityAdminController } from "@admin/capabilities/capability-admin.controller"
import { CapabilityAdminService } from "@admin/capabilities/capability-admin.service"
import { CapabilityDocumentQueue } from "@admin/capabilities/capability-document.queue"
import { CapabilityPublishService } from "@admin/capabilities/capability-publish.service"
import { CapabilitySingleController } from "@admin/capabilities/capability-single.controller"
import { MassCapabilityController } from "@admin/capabilities/mass-capability.controller"
import { MassCapabilityService } from "@admin/capabilities/mass-capability.service"
import { AcademicYear } from "@shared/master/entities/academic-year.entity"
import { Grade } from "@shared/master/entities/grade.entity"

@Module({
	imports: [TypeOrmModule.forFeature([AcademicYear, Grade])],
	controllers: [CapabilityAdminController, CapabilitySingleController, MassCapabilityController],
	providers: [CapabilityAdminService, CapabilityPublishService, MassCapabilityService, CapabilityDocumentQueue],
})
export class CapabilitiesAdminModule {}
