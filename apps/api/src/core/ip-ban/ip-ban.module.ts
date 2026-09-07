import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { BannedIp } from "@core/ip-ban/entities/banned-ip.entity"
import { IpBanMiddleware } from "@core/ip-ban/ip-ban.middleware"
import { IpBanService } from "@core/ip-ban/ip-ban.service"

@Module({
	imports: [TypeOrmModule.forFeature([BannedIp])],
	providers: [IpBanService, IpBanMiddleware],
	exports: [IpBanService, IpBanMiddleware],
})
export class IpBanModule {}
