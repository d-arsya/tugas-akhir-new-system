import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"

import { EwalletMoneyController } from "@admin/ewallet/money-admin.controller"
import { EwalletMoneyService } from "@admin/ewallet/money-admin.service"
import { EwalletTxnController } from "@admin/ewallet/txn-admin.controller"
import { EwalletTxnService } from "@admin/ewallet/txn-admin.service"
import { EwalletWalletController } from "@admin/ewallet/wallet-admin.controller"
import { EwalletWalletService } from "@admin/ewallet/wallet-admin.service"
import { User } from "@admin/auth/entities/user.entity"
import { EwalletTransactionItem } from "@ewallet/entities/ewallet-transaction-item.entity"
import { EwalletTransaction } from "@ewallet/entities/ewallet-transaction.entity"
import { Ewallet } from "@ewallet/entities/ewallet.entity"
import { SettingSchool } from "@shared/school/entities/setting-school.entity"

@Module({
	imports: [TypeOrmModule.forFeature([Ewallet, EwalletTransaction, EwalletTransactionItem, User, SettingSchool])],
	controllers: [EwalletWalletController, EwalletMoneyController, EwalletTxnController],
	providers: [EwalletWalletService, EwalletMoneyService, EwalletTxnService],
})
export class EwalletAdminModule {}
