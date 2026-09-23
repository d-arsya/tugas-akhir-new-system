import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common"
import { ScheduleModule } from "@nestjs/schedule"
import { CoreModule } from "@core/core.module"
import { IpBanMiddleware } from "@core/ip-ban/ip-ban.middleware"
import { EwalletModule } from "@ewallet/ewallet.module"
import { PsbModule } from "@psb/psb.module"
import { SantriModule } from "@santri/santri.module"
import { MerchantModule } from "@modules/merchant/merchant.module"
import { AdminModule } from "@modules/admin/admin.module"

import { SchoolModule } from "@shared/school/school.module"
import { MasterModule } from "@shared/master/master.module"
import { LocationModule } from "@shared/location/location.module"

@Module({
	imports: [
		// Cron jobs (auth-log close, database backup) — each one checks SCHEDULER_ENABLED before it runs
		ScheduleModule.forRoot(),
		CoreModule,
		LocationModule,
		SchoolModule,
		MasterModule,
		EwalletModule,
		PsbModule,
		SantriModule,
		MerchantModule,
		AdminModule,
	],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer): void {
		consumer.apply(IpBanMiddleware).forRoutes("*")
	}
}
