import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common"
import { CoreModule } from "./core/core.module"
import { IpBanMiddleware } from "./core/ip-ban/ip-ban.middleware"

@Module({
	imports: [CoreModule],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer): void {
		consumer.apply(IpBanMiddleware).forRoutes("*")
	}
}
