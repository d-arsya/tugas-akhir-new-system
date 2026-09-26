import { Module } from "@nestjs/common"

import { EwalletMoneyController } from "@admin/ewallet/money-admin.controller"
import { EwalletMoneyService } from "@admin/ewallet/money-admin.service"
import { EwalletTxnController } from "@admin/ewallet/txn-admin.controller"
import { EwalletTxnService } from "@admin/ewallet/txn-admin.service"
import { EwalletWalletController } from "@admin/ewallet/wallet-admin.controller"
import { EwalletWalletService } from "@admin/ewallet/wallet-admin.service"

@Module({
	controllers: [EwalletWalletController, EwalletMoneyController, EwalletTxnController],
	providers: [EwalletWalletService, EwalletMoneyService, EwalletTxnService],
})
export class EwalletAdminModule {}
