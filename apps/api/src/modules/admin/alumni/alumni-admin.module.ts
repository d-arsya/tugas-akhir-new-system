import { Module } from "@nestjs/common"

import { AlumniAdminController } from "./alumni-admin.controller"
import { AlumniAdminService } from "./alumni-admin.service"
import { AlumniWriteService } from "./alumni-write.service"

/**
 * Akademik → Alumni. Owned by workstream AK-A: register every controller and provider of this
 * sub-menu here, so `admin.module.ts` (lead-owned) never needs another edit. Core services
 * (`DataSource`, `StorageService`, `MailerService`, `RedisService`, `ConfigService`, the auth
 * guards) are global and can be injected directly.
 */
@Module({
	controllers: [AlumniAdminController],
	providers: [AlumniAdminService, AlumniWriteService],
})
export class AlumniAdminModule {}
