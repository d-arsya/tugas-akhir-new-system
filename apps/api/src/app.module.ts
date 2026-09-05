import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common"
import { CoreModule } from "./core/core.module"
import { IpBanMiddleware } from "./core/ip-ban/ip-ban.middleware"
import { EwalletModule } from "./ewallet/ewallet.module"
import { PsbModule } from "./psb/psb.module"
import { SantriModule } from "./santri/santri.module"

@Module({
	imports: [CoreModule, PsbModule, EwalletModule, SantriModule],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer): void {
		consumer.apply(IpBanMiddleware).forRoutes("*")
	}
}
