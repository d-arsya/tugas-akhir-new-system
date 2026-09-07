import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { StorageModule } from "../core/storage/storage.module"
import { EwalletTransactionDetail } from "./entities/ewallet-transaction-detail.entity"
import { EwalletTransactionItem } from "./entities/ewallet-transaction-item.entity"
import { EwalletTransaction } from "./entities/ewallet-transaction.entity"
import { Ewallet } from "./entities/ewallet.entity"
import { EwalletTransactionService } from "./ewallet-transaction.service"
import { EwalletService } from "./ewallet.service"

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Ewallet,
			EwalletTransaction,
			EwalletTransactionDetail,
			EwalletTransactionItem,
		]),
		StorageModule,
	],
	providers: [EwalletService, EwalletTransactionService],
	exports: [TypeOrmModule, EwalletService, EwalletTransactionService],
})
export class EwalletModule {}
