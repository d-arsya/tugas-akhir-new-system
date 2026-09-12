import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { MailerModule } from "@core/mailer/mailer.module"
import { StorageModule } from "@core/storage/storage.module"
import { EwalletTransactionDetail } from "@ewallet/entities/ewallet-transaction-detail.entity"
import { EwalletTransactionItem } from "@ewallet/entities/ewallet-transaction-item.entity"
import { EwalletTransaction } from "@ewallet/entities/ewallet-transaction.entity"
import { Ewallet } from "@ewallet/entities/ewallet.entity"
import { EwalletPurchaseService } from "@ewallet/ewallet-purchase.service"
import { EwalletTransactionService } from "@ewallet/ewallet-transaction.service"
import { EwalletService } from "@ewallet/ewallet.service"
import { EwalletFacade } from "@ewallet/ewallet.facade"

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Ewallet,
			EwalletTransaction,
			EwalletTransactionDetail,
			EwalletTransactionItem,
		]),
		StorageModule,
		MailerModule,
	],
	providers: [
		EwalletService,
		EwalletTransactionService,
		EwalletPurchaseService,
		EwalletFacade,
	],
	exports: [
		TypeOrmModule,
		EwalletService,
		EwalletTransactionService,
		EwalletPurchaseService,
		EwalletFacade,
	],
})
export class EwalletModule {}
