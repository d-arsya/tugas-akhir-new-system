import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EwalletTransactionDetail } from "./entities/ewallet-transaction-detail.entity"
import { EwalletTransactionItem } from "./entities/ewallet-transaction-item.entity"
import { EwalletTransaction } from "./entities/ewallet-transaction.entity"
import { Ewallet } from "./entities/ewallet.entity"

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Ewallet,
			EwalletTransaction,
			EwalletTransactionDetail,
			EwalletTransactionItem,
		]),
	],
	exports: [TypeOrmModule],
})
export class EwalletModule {}
