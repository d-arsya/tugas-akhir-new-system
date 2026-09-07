import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import * as bcrypt from "bcrypt"
import { Repository } from "typeorm"
import { Registrant } from "@psb/entities/registrant.entity"
import type { Toggle2faDto } from "@psb/dto/setting/toggle-2fa.dto"
import type { UpdatePasswordDto } from "@psb/dto/setting/update-password.dto"
import type { UpdateProfileDto } from "@psb/dto/setting/update-profile.dto"

@Injectable()
export class PsbSettingService {
	constructor(
		@InjectRepository(Registrant)
		private readonly registrantRepository: Repository<Registrant>,
	) {}

	async updateProfile(userId: number, dto: UpdateProfileDto): Promise<{ message: string; fullname: string }> {
		const registrant = await this.registrantRepository.findOneBy({ id: userId })
		if (!registrant) {
			throw new NotFoundException("Data pendaftar tidak ditemukan.")
		}

		registrant.fullname = dto.fullname
		await this.registrantRepository.save(registrant)

		return {
			message: "Profil Anda berhasil diperbarui.",
			fullname: dto.fullname,
		}
	}

	async updatePassword(userId: number, dto: UpdatePasswordDto): Promise<{ message: string }> {
		const registrant = await this.registrantRepository.findOneBy({ id: userId })
		if (!registrant) {
			throw new NotFoundException("Data pendaftar tidak ditemukan.")
		}

		registrant.password = await bcrypt.hash(dto.password, 10)
		await this.registrantRepository.save(registrant)

		return { message: "Password Anda berhasil diperbarui." }
	}

	async toggle2fa(userId: number, dto: Toggle2faDto): Promise<{ message: string; enabled: boolean }> {
		const registrant = await this.registrantRepository.findOneBy({ id: userId })
		if (!registrant) {
			throw new NotFoundException("Data pendaftar tidak ditemukan.")
		}

		registrant.enabled2fa = dto.enabled
		await this.registrantRepository.save(registrant)

		return {
			message: dto.enabled
				? "Autentikasi 2 faktor (2FA) telah diaktifkan."
				: "Autentikasi 2 faktor (2FA) telah dinonaktifkan.",
			enabled: dto.enabled,
		}
	}
}
