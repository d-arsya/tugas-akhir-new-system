import { Module } from "@nestjs/common"

import { StudentAdminController } from "./student-admin.controller"
import { StudentAdminService } from "./student-admin.service"

/**
 * Akademik → Santri. Owned by workstream AK-S: register every controller and provider of this
 * sub-menu here, so `admin.module.ts` (lead-owned) never needs another edit. Core services
 * (`DataSource`, `StorageService`, `MailerService`, `RedisService`, `ConfigService`, the auth
 * guards) are global and can be injected directly.
 */
@Module({
	controllers: [StudentAdminController],
	providers: [StudentAdminService],
})
export class StudentAdminModule {}
