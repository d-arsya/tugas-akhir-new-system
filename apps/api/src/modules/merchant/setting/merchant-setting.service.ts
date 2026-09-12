import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import * as bcrypt from "bcrypt"
import { Repository } from "typeorm"
import { StorageService } from "@core/storage/storage.service"
import { MerchantAuthService } from "@merchant/auth/merchant-auth.service"
import type {
	MerchantChangePasswordDto,
	Toggle2faDto,
	UpdateMerchantProfileDto,
} from "@merchant/dto/setting"
import { Merchant } from "@merchant/entities/merchant.entity"

@Injectable()
export class MerchantSettingService {
	constructor(
		@InjectRepository(Merchant)
		private readonly merchantRepository: Repository<Merchant>,
		private readonly storageService: StorageService,
		private readonly merchantAuthService: MerchantAuthService,
	) {}

	async getSettingData(merchantId: number) {
		const merchant = await this.merchantRepository.findOneBy({ id: merchantId })
		if (!merchant) {
			throw new NotFoundException("Merchant tidak ditemukan.")
		}

		const photoUrl = merchant.photo ? this.storageService.getUrl(merchant.photo) : null

		return {
			merchantName: merchant.merchantName,
			phone: merchant.phone,
			address: merchant.address,
			email: merchant.email,
			photo: photoUrl,
			enabled2fa: merchant.enabled2fa,
			emailVerifiedAt: merchant.emailVerifiedAt ? merchant.emailVerifiedAt.toISOString() : null,
		}
	}

	async updateProfile(
		merchantId: number,
		dto: UpdateMerchantProfileDto,
		file?: Express.Multer.File,
	) {
		const merchant = await this.merchantRepository.findOneBy({ id: merchantId })
		if (!merchant) {
			throw new NotFoundException("Merchant tidak ditemukan.")
		}

		merchant.merchantName = dto.merchantName
		merchant.phone = dto.phone
		merchant.address = dto.address

		if (file) {
			const photoPath = await this.storageService.upload(file, "merchant-photos")
			merchant.photo = photoPath
		}

		await this.merchantRepository.save(merchant)

		return {
			message: "Profil merchant berhasil diperbarui.",
			data: {
				merchantName: merchant.merchantName,
				phone: merchant.phone,
				address: merchant.address,
				photo: merchant.photo ? this.storageService.getUrl(merchant.photo) : null,
			},
		}
	}

	async changePassword(merchantId: number, dto: MerchantChangePasswordDto) {
		const merchant = await this.merchantRepository.findOneBy({ id: merchantId })
		if (!merchant) {
			throw new NotFoundException("Merchant tidak ditemukan.")
		}

		merchant.password = await bcrypt.hash(dto.password, 10)
		await this.merchantRepository.save(merchant)

		return { message: "Password merchant berhasil diperbarui." }
	}

	async toggle2fa(merchantId: number, dto: Toggle2faDto) {
		const merchant = await this.merchantRepository.findOneBy({ id: merchantId })
		if (!merchant) {
			throw new NotFoundException("Merchant tidak ditemukan.")
		}

		merchant.enabled2fa = dto.enabled
		await this.merchantRepository.save(merchant)

		return {
			message: `Autentikasi dua faktor (2FA) berhasil ${dto.enabled ? "diaktifkan" : "dinonaktifkan"}.`,
			enabled2fa: merchant.enabled2fa,
		}
	}

	async resendVerification(merchantId: number) {
		const merchant = await this.merchantRepository.findOneBy({ id: merchantId })
		if (!merchant) {
			throw new NotFoundException("Merchant tidak ditemukan.")
		}

		if (merchant.emailVerifiedAt) {
			throw new BadRequestException("Email sudah diverifikasi.")
		}

		return this.merchantAuthService.sendEmailVerification(merchantId)
	}
}
