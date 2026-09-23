import { BadRequestException, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import * as bcrypt from "bcrypt"
import { Repository } from "typeorm"

import { RedisService } from "@core/redis/redis.service"
import { AdminAuthService, type AdminAuthResult } from "@admin/auth/admin-auth.service"
import { User } from "@admin/entities/user.entity"
import type { CreatePasswordInput } from "@admin/dto/admin-create-password.dto"

export type CreatePasswordCheck = {
	email: string
	name: string | null
	role: string | null
}

// `resources/lang/id/passwords.php` — Redis cannot tell an unknown token from an expired one,
// so both answer with the legacy "token" line.
const INVALID_TOKEN = "Token pengaturan ulang kata sandi tidak sah."
const UNKNOWN_USER = "Kami tidak dapat menemukan pengguna dengan alamat email tersebut."

const tokenKey = (token: string): string => `create:admin:${token}`

// Port of legacy `Auth\CreatePasswordController` (guest routes reached from the "Buat Password" email)
@Injectable()
export class AdminCreatePasswordService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		private readonly redisService: RedisService,
		private readonly adminAuthService: AdminAuthService,
	) {}

	/** `showCreateForm()` — a bad token sends the visitor back to the "lupa password" page. */
	async check(token: string, email: string): Promise<CreatePasswordCheck> {
		const user = await this.verifyToken(token, email)
		return { email: user.email ?? email, name: user.name, role: user.role }
	}

	/** `reset()` → `resetPassword()`: hash, store `weak_password`, then log the admin in. */
	async create(input: CreatePasswordInput, clientIp: string, userAgent?: string): Promise<AdminAuthResult> {
		const user = await this.verifyToken(input.token, input.email)

		user.password = await bcrypt.hash(input.password, 10)
		// `$request->filled('weak_password') ? $request->weak_password : 0`
		user.weakPassword = input.weakPassword === true
		await this.userRepository.save(user)

		await this.redisService.del(tokenKey(input.token))

		// Same response as `login`, and it writes the "Logged In" auth-log row
		return this.adminAuthService.issueSession(user, clientIp, userAgent)
	}

	/**
	 * 400, never 401: the admin client treats a 401 as an expired session and bounces to login,
	 * which would hide the message this page has to show.
	 */
	private async verifyToken(token: string, email: string): Promise<User> {
		const storedEmail = await this.redisService.get(tokenKey(token))
		if (!storedEmail || storedEmail !== email) throw new BadRequestException(INVALID_TOKEN)

		const user = await this.userRepository.findOneBy({ email })
		if (!user) throw new BadRequestException(UNKNOWN_USER)
		return user
	}
}
