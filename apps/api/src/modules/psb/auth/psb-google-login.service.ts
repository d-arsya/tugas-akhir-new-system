import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { singleGoogleAccount } from "@core/auth/google/google-account"
import { GoogleIdTokenService } from "@core/auth/google/google-id-token.service"
import { Registrant } from "@psb/entities/registrant.entity"
import { PsbAuthService, type AuthResult } from "@psb/auth/psb-auth.service"

@Injectable()
export class PsbGoogleLoginService {
	constructor(
		@InjectRepository(Registrant)
		private readonly registrantRepository: Repository<Registrant>,
		private readonly googleIdTokenService: GoogleIdTokenService,
		private readonly psbAuthService: PsbAuthService,
	) {}

	async login(credential: string, clientIp: string): Promise<AuthResult> {
		const { email } = await this.googleIdTokenService.verify(credential)
		const registrants = await this.registrantRepository
			.createQueryBuilder("registrant")
			.where("LOWER(registrant.email) = :email", { email })
			.getMany()
		const registrant = singleGoogleAccount(
			registrants,
			"Email ini belum terdaftar. Silakan mulai pendaftaran baru terlebih dahulu.",
		)

		if (!registrant.emailVerifiedAt && !registrant.isBlocked) {
			registrant.emailVerifiedAt = new Date()
			await this.registrantRepository.save(registrant)
		}

		return this.psbAuthService.completeLogin(registrant, clientIp)
	}
}
