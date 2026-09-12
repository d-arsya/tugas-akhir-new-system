import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { StorageService } from "@core/storage/storage.service"
import { Merchant } from "@merchant/entities/merchant.entity"

@Injectable()
export class MerchantProfileService {
	constructor(
		@InjectRepository(Merchant)
		private readonly merchantRepository: Repository<Merchant>,
		private readonly storageService: StorageService,
	) {}

	async getProfile(merchantId: number) {
		const merchant = await this.merchantRepository.findOneBy({ id: merchantId })
		if (!merchant) {
			throw new NotFoundException("Merchant tidak ditemukan.")
		}

		const photoUrl = merchant.photo ? this.storageService.getUrl(merchant.photo) : null

		return {
			id: merchant.id,
			name: merchant.name,
			merchantName: merchant.merchantName,
			phone: merchant.phone,
			address: merchant.address,
			email: merchant.email,
			uniqueNumber: merchant.uniqueNumber,
			photo: photoUrl,
			enabled2fa: merchant.enabled2fa,
			emailVerifiedAt: merchant.emailVerifiedAt ? merchant.emailVerifiedAt.toISOString() : null,
		}
	}
}
