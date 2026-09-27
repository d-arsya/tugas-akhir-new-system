import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"

import { MerchantAdminController } from "@admin/merchant/merchant-admin.controller"
import { MerchantAdminService } from "@admin/merchant/merchant-admin.service"
import { Ewallet } from "@ewallet/entities/ewallet.entity"
import { Merchant } from "@merchant/entities/merchant.entity"
import { SettingSchool } from "@shared/school/entities/setting-school.entity"

@Module({
	imports: [TypeOrmModule.forFeature([Merchant, Ewallet, SettingSchool])],
	controllers: [MerchantAdminController],
	providers: [MerchantAdminService],
})
export class MerchantAdminModule {}
