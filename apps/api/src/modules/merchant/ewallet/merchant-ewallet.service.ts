import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import type { Env } from "@core/config/env.validation"
import { MailerService } from "@core/mailer/mailer.service"
import type {
	ConfirmTopUpDto,
	CreateEwalletDto,
	LoginPinDto,
	ResetPinDto,
	TopUpBankTransferDto,
	TransactionFilterDto,
	UpdatePinDto,
	ValidateCurrentPinDto,
} from "@modules/ewallet/dto"
import { EwalletFacade } from "@modules/ewallet/ewallet.facade"
import { Merchant } from "@merchant/entities/merchant.entity"

const EWALLETABLE_TYPE = "App\\Models\\Merchant"
const PIN_SESSION_PREFIX = "merchant-ewallet-pin"

@Injectable()
export class MerchantEwalletService {
	constructor(
		private readonly ewalletFacade: EwalletFacade,
		@InjectRepository(Merchant)
		private readonly merchantRepository: Repository<Merchant>,
		private readonly configService: ConfigService<Env, true>,
		private readonly mailerService: MailerService,
	) {}

	async getEwalletStatus(merchantId: number) {
		return this.ewalletFacade.getEwalletStatus(EWALLETABLE_TYPE, merchantId)
	}

	async loginPin(merchantId: number, dto: LoginPinDto) {
		await this.ewalletFacade.validateCurrentPin(EWALLETABLE_TYPE, merchantId, dto.pin)
		await this.ewalletFacade.setPinSession(PIN_SESSION_PREFIX, merchantId)
		return { message: "Berhasil verifikasi PIN E-Wallet." }
	}

	async createEwallet(merchantId: number, dto: CreateEwalletDto) {
		const existing = await this.ewalletFacade.findEwallet(EWALLETABLE_TYPE, merchantId)
		if (existing) {
			throw new ForbiddenException("Merchant sudah memiliki E-Wallet.")
		}

		const merchant = await this.merchantRepository.findOneBy({ id: merchantId })
		if (!merchant) {
			throw new NotFoundException("Merchant tidak ditemukan.")
		}

		const name = merchant.merchantName ?? merchant.name ?? "Merchant"

		await this.ewalletFacade.createEwalletRecord({
			uniqueId: merchant.uniqueNumber ?? String(merchantId),
			ewalletableType: EWALLETABLE_TYPE,
			ewalletableId: String(merchantId),
			studentName: name,
			ewalletableName: name,
			pin: Number(dto.pin),
			isActive: true,
			totalBalance: "0",
		})

		await this.ewalletFacade.setPinSession(PIN_SESSION_PREFIX, merchantId)

		return { message: "E-Wallet merchant berhasil dibuat." }
	}

	async showInactivePage(merchantId: number) {
		const ewallet = await this.ewalletFacade.findEwallet(EWALLETABLE_TYPE, merchantId)
		if (!ewallet) {
			return { isActive: false, message: "E-Wallet belum terdaftar." }
		}

		return {
			isActive: !!ewallet.isActive,
			message: ewallet.isActive
				? "E-Wallet aktif."
				: "E-Wallet Anda saat ini dinonaktifkan. Silakan hubungi pengelola pondok.",
		}
	}

	async getDashboard(merchantId: number, filters?: TransactionFilterDto) {
		const ewallet = await this.ewalletFacade.findEwallet(EWALLETABLE_TYPE, merchantId)
		if (!ewallet) {
			throw new NotFoundException("E-Wallet belum terdaftar.")
		}

		const totalBalance = await this.ewalletFacade.calculateBalance(ewallet.id)
		const txListResult = await this.ewalletFacade.getTransactionList(
			ewallet.id,
			filters ?? ({} as TransactionFilterDto),
		)

		return {
			data: {
				totalBalance,
				ewallet: {
					id: ewallet.id,
					uniqueId: ewallet.uniqueId,
					merchantName: ewallet.ewalletableName,
					isActive: ewallet.isActive,
				},
				transactions: txListResult.data,
			},
			meta: txListResult.meta,
		}
	}

	async storeTopUpBankTransfer(merchantId: number, dto: TopUpBankTransferDto) {
		const ewallet = await this.ewalletFacade.findEwallet(EWALLETABLE_TYPE, merchantId)
		if (!ewallet) {
			throw new NotFoundException("E-Wallet belum terdaftar.")
		}
		return this.ewalletFacade.createTopUpBankTransfer(ewallet.id, dto.amount)
	}

	async getConfirmForm(merchantId: number, transactionId: number) {
		const ewallet = await this.ewalletFacade.findEwallet(EWALLETABLE_TYPE, merchantId)
		if (!ewallet) {
			throw new NotFoundException("E-Wallet belum terdaftar.")
		}
		return this.ewalletFacade.getConfirmForm(transactionId, ewallet.id)
	}

	async confirmTopUpProof(
		merchantId: number,
		transactionId: number,
		dto: ConfirmTopUpDto,
		file?: Express.Multer.File,
	) {
		const ewallet = await this.ewalletFacade.findEwallet(EWALLETABLE_TYPE, merchantId)
		if (!ewallet) {
			throw new NotFoundException("E-Wallet belum terdaftar.")
		}
		return this.ewalletFacade.confirmTopUpProof(transactionId, ewallet.id, {
			paymentDate: new Date(dto.paymentDate),
			paymentNote: dto.paymentNote,
			file,
		})
	}

	async getCashInfo() {
		return this.ewalletFacade.getCashInfo()
	}

	async getWithdrawInfo() {
		return this.ewalletFacade.getWithdrawInfo()
	}

	async validateCurrentPin(merchantId: number, dto: ValidateCurrentPinDto) {
		await this.ewalletFacade.validateCurrentPin(EWALLETABLE_TYPE, merchantId, dto.pin)
		return { message: "PIN E-Wallet valid." }
	}

	async updatePin(merchantId: number, dto: UpdatePinDto) {
		await this.ewalletFacade.updatePin(EWALLETABLE_TYPE, merchantId, dto.pin)
		await this.ewalletFacade.setPinSession(PIN_SESSION_PREFIX, merchantId)
		return { message: "PIN E-Wallet berhasil diperbarui." }
	}

	async sendPinResetEmail(merchantId: number) {
		const { rawToken } = await this.ewalletFacade.generateResetPinToken(
			EWALLETABLE_TYPE,
			merchantId,
		)

		const merchant = await this.merchantRepository.findOneBy({ id: merchantId })
		if (!merchant || !merchant.email) {
			throw new NotFoundException("Email merchant tidak ditemukan.")
		}

		const recipientName = merchant.merchantName ?? merchant.name ?? "Merchant"
		const appUrl = (
			this.configService.get("APP_URL", { infer: true }) || "http://localhost:4200"
		).replace(/\/+$/, "")
		const resetUrl = `${appUrl}/merchant/e-wallet/pin/reset/${rawToken}`

		await this.mailerService.sendResetPin(merchant.email, {
			name: recipientName,
			resetUrl,
		})

		return { message: "Email instruksi reset PIN telah dikirim." }
	}

	async validatePinResetToken(merchantId: number, token: string) {
		await this.ewalletFacade.validateResetPinToken(EWALLETABLE_TYPE, merchantId, token)
		return { valid: true, message: "Token reset PIN valid." }
	}

	async resetPin(merchantId: number, dto: ResetPinDto) {
		await this.ewalletFacade.resetPinWithToken(
			EWALLETABLE_TYPE,
			merchantId,
			dto.token,
			dto.pin,
		)
		await this.ewalletFacade.setPinSession(PIN_SESSION_PREFIX, merchantId)
		return { message: "PIN E-Wallet berhasil direset." }
	}
}
