import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { singleGoogleAccount } from "@core/auth/google/google-account"
import { GoogleIdTokenService } from "@core/auth/google/google-id-token.service"
import { Merchant } from "@merchant/entities/merchant.entity"
import { MerchantAuthService, type MerchantAuthResult } from "@merchant/auth/merchant-auth.service"

@Injectable()
export class MerchantGoogleLoginService {
	constructor(
		@InjectRepository(Merchant)
		private readonly merchantRepository: Repository<Merchant>,
		private readonly googleIdTokenService: GoogleIdTokenService,
		private readonly merchantAuthService: MerchantAuthService,
	) {}

	async login(credential: string, clientIp: string): Promise<MerchantAuthResult> {
		const { email } = await this.googleIdTokenService.verify(credential)
		const merchants = await this.merchantRepository
			.createQueryBuilder("merchant")
			.where("LOWER(merchant.email) = :email", { email })
			.getMany()
		const merchant = singleGoogleAccount(merchants, "Email ini tidak terdaftar pada akun merchant.")
		return this.merchantAuthService.completeLogin(merchant, clientIp)
	}
}
