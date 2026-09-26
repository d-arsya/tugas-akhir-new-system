import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"

import { RegistrantAdminController } from "@admin/registrant/registrant-admin.controller"
import { RegistrantAdminService } from "@admin/registrant/registrant-admin.service"
import { RegistrantFormController } from "@admin/registrant/registrant-form.controller"
import { RegistrantMailService } from "@admin/registrant/registrant-mail.service"
import { RegistrantStatusService } from "@admin/registrant/registrant-status.service"
import { RegistrantWriteService } from "@admin/registrant/registrant-write.service"
import { Level } from "@shared/master/entities/level.entity"

@Module({
	imports: [TypeOrmModule.forFeature([Level])],
	// RegistrantFormController first: its literal `create/…` paths must win over `:registrantId`
	controllers: [RegistrantFormController, RegistrantAdminController],
	providers: [RegistrantAdminService, RegistrantWriteService, RegistrantStatusService, RegistrantMailService],
})
export class RegistrantAdminModule {}
