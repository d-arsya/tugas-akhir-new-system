import { Module } from "@nestjs/common"
import { JwtModule } from "@nestjs/jwt"
import { TypeOrmModule } from "@nestjs/typeorm"
import { MailerModule } from "@core/mailer/mailer.module"
import { StorageModule } from "@core/storage/storage.module"
import { EwalletModule } from "@modules/ewallet/ewallet.module"
import { MerchantAuthController } from "@merchant/auth/merchant-auth.controller"
import { MerchantAuthService } from "@merchant/auth/merchant-auth.service"
import { MerchantPasswordReset } from "@merchant/entities/merchant-password-reset.entity"
import { Merchant } from "@merchant/entities/merchant.entity"
import { MerchantTwoFactor } from "@merchant/entities/merchant-two-factor.entity"
import { MerchantEwalletPinController } from "@merchant/ewallet/merchant-ewallet-pin.controller"
import { MerchantEwalletController } from "@merchant/ewallet/merchant-ewallet.controller"
import { MerchantEwalletService } from "@merchant/ewallet/merchant-ewallet.service"
import { ActiveMerchantGuard } from "@merchant/guards/active-merchant.guard"
import { EwalletPinGuard } from "@merchant/guards/ewallet-pin.guard"
import { MerchantJwtAuthGuard } from "@merchant/guards/merchant-jwt-auth.guard"
import { MerchantJwtRefreshGuard } from "@merchant/guards/merchant-jwt-refresh.guard"
import { NoEwalletGuard } from "@merchant/guards/no-ewallet.guard"
import { MerchantProfileController } from "@merchant/profile/merchant-profile.controller"
import { MerchantProfileService } from "@merchant/profile/merchant-profile.service"
import { MerchantSettingController } from "@merchant/setting/merchant-setting.controller"
import { MerchantSettingService } from "@merchant/setting/merchant-setting.service"
import { MerchantTransactionHistoryController } from "@merchant/transaction/merchant-transaction-history.controller"
import { MerchantTransactionHistoryService } from "@merchant/transaction/merchant-transaction-history.service"
import { MerchantTransactionController } from "@merchant/transaction/merchant-transaction.controller"
import { MerchantTransactionService } from "@merchant/transaction/merchant-transaction.service"

@Module({
	imports: [
		TypeOrmModule.forFeature([Merchant, MerchantTwoFactor, MerchantPasswordReset]),
		JwtModule.register({}),
		EwalletModule,
		StorageModule,
		MailerModule,
	],
	controllers: [
		MerchantAuthController,
		MerchantEwalletController,
		MerchantEwalletPinController,
		MerchantTransactionController,
		MerchantTransactionHistoryController,
		MerchantProfileController,
		MerchantSettingController,
	],
	providers: [
		MerchantAuthService,
		MerchantEwalletService,
		MerchantTransactionService,
		MerchantTransactionHistoryService,
		MerchantProfileService,
		MerchantSettingService,
		MerchantJwtAuthGuard,
		MerchantJwtRefreshGuard,
		ActiveMerchantGuard,
		EwalletPinGuard,
		NoEwalletGuard,
	],
	exports: [
		TypeOrmModule,
		MerchantAuthService,
		MerchantEwalletService,
		MerchantTransactionService,
		MerchantTransactionHistoryService,
		MerchantProfileService,
		MerchantSettingService,
		MerchantJwtAuthGuard,
		MerchantJwtRefreshGuard,
		ActiveMerchantGuard,
		EwalletPinGuard,
		NoEwalletGuard,
	],
})
export class MerchantModule {}
