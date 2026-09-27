import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { singleGoogleAccount } from "@core/auth/google/google-account"
import { GoogleIdTokenService } from "@core/auth/google/google-id-token.service"
import { AdminAuthService, type AdminAuthResult } from "@admin/auth/admin-auth.service"
import { AuthLogWriter } from "@admin/auth/auth-log.writer"
import { User } from "@admin/auth/entities/user.entity"

@Injectable()
export class AdminGoogleLoginService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		private readonly googleIdTokenService: GoogleIdTokenService,
		private readonly adminAuthService: AdminAuthService,
		private readonly authLogWriter: AuthLogWriter,
	) {}

	async login(credential: string, clientIp: string, userAgent?: string): Promise<AdminAuthResult> {
		const { email } = await this.googleIdTokenService.verify(credential)
		const users = await this.userRepository
			.createQueryBuilder("user")
			.where("LOWER(user.email) = :email", { email })
			.getMany()

		if (users.length === 0) {
			await this.authLogWriter.open({
				userId: null,
				email: "-",
				ipAddress: clientIp,
				userAgent,
				status: "Failed",
			})
		}

		const user = singleGoogleAccount(users, "Akun Google ini tidak terdaftar sebagai admin.")
		return this.adminAuthService.completeLogin(user, clientIp, userAgent)
	}
}
