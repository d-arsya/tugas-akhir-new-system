import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import * as bcrypt from "bcrypt"
import { Repository } from "typeorm"

import { User } from "@admin/entities/user.entity"
import { isFilled, type MyProfileUpdateDto } from "@admin/dto/admin-profile.dto"

export type MyProfile = {
	id: number
	name: string | null
	email: string | null
	role: string | null
	gender: "male" | "female" | null
	weakPassword: boolean
}

// `resources/lang/id/admin.php`
const UPDATE_SUCCESS = "Data berhasil diupdate."
const UPDATE_FAILED = "Data gagal diupdate."

// WS-B: legacy MyprofileController::updateMyProfile
@Injectable()
export class AdminProfileService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
	) {}

	/**
	 * The page the legacy blade filled straight from `auth()->user()`.
	 * Only the fields the form shows: the old `/profile` route also sent the password hash
	 * and the remember token, which never have to leave the server.
	 */
	async getProfile(userId: number): Promise<MyProfile> {
		const user = await this.findUser(userId)

		return {
			id: Number(user.id),
			name: user.name,
			email: user.email,
			role: user.role,
			gender: user.gender,
			weakPassword: user.weakPassword === true,
		}
	}

	/** `updateMyProfile()`: name and gender always, the password only when one was typed. */
	async updateProfile(userId: number, dto: MyProfileUpdateDto): Promise<{ message: string }> {
		const user = await this.findUser(userId)

		user.name = dto.name
		// The empty case never reaches here: `gender` is required
		user.gender = dto.gender === "" ? user.gender : dto.gender

		if (isFilled(dto.password)) {
			user.password = await bcrypt.hash(dto.password, 10)
			// `$request->filled('weak_password') ? $request->weak_password : 0`
			user.weakPassword = dto.weakPassword === true
		}

		try {
			// Legacy never lets the email change, so it is not read from the request at all
			await this.userRepository.save(user)
		} catch {
			throw new InternalServerErrorException(UPDATE_FAILED)
		}

		return { message: UPDATE_SUCCESS }
	}

	private async findUser(userId: number): Promise<User> {
		const user = await this.userRepository.findOneBy({ id: userId })
		if (!user) throw new NotFoundException("Pengguna tidak ditemukan.")
		return user
	}
}
