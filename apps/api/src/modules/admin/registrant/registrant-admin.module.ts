import { Module } from "@nestjs/common"

import { RegistrantAdminController } from "./registrant-admin.controller"
import { RegistrantAdminService } from "./registrant-admin.service"
import { RegistrantFormController } from "./registrant-form.controller"
import { RegistrantMailService } from "./registrant-mail.service"
import { RegistrantStatusService } from "./registrant-status.service"
import { RegistrantWriteService } from "./registrant-write.service"

/**
 * Akademik → PSB. Owned by workstream AK-P: register every controller and provider of this
 * sub-menu here, so `admin.module.ts` (lead-owned) never needs another edit. Core services
 * (`DataSource`, `StorageService`, `MailerService`, `RedisService`, `ConfigService`, the auth
 * guards) are global and can be injected directly.
 *
 * `RegistrantFormController` is listed first: its literal `create/…` paths must be matched before
 * `RegistrantAdminController`'s `:registrantId`.
 */
@Module({
	controllers: [RegistrantFormController, RegistrantAdminController],
	providers: [RegistrantAdminService, RegistrantWriteService, RegistrantStatusService, RegistrantMailService],
})
export class RegistrantAdminModule {}
