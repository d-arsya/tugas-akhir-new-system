import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { BannedIp } from "./entities/banned-ip.entity"
import { IpBanMiddleware } from "./ip-ban.middleware"
import { IpBanService } from "./ip-ban.service"

@Module({
	imports: [TypeOrmModule.forFeature([BannedIp])],
	providers: [IpBanService, IpBanMiddleware],
	exports: [IpBanService, IpBanMiddleware],
})
export class IpBanModule {}
