import { Module } from "@nestjs/common"

import { MerchantAdminController } from "@admin/merchant/merchant-admin.controller"
import { MerchantAdminService } from "@admin/merchant/merchant-admin.service"

@Module({
	controllers: [MerchantAdminController],
	providers: [MerchantAdminService],
})
export class MerchantAdminModule {}
