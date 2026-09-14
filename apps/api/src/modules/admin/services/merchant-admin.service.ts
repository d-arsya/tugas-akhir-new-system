import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import * as bcrypt from "bcrypt"
import * as crypto from "crypto"
import { Repository } from "typeorm"
import { Merchant } from "../../merchant/entities/merchant.entity"
import { User } from "../entities/user.entity"
import { Ewallet } from "../../ewallet/entities/ewallet.entity"
import { EwalletTransaction } from "../../ewallet/entities/ewallet-transaction.entity"
import { CreateMerchantDto, ToggleBlockMerchantDto, UpdateMerchantDto } from "../dto/merchant-admin.dto"

@Injectable()
export class MerchantAdminService {
	constructor(
		@InjectRepository(Merchant)
		private readonly merchantRepo: Repository<Merchant>,
		@InjectRepository(User)
		private readonly userRepo: Repository<User>,
		@InjectRepository(Ewallet)
		private readonly ewalletRepo: Repository<Ewallet>,
		@InjectRepository(EwalletTransaction)
		private readonly ewalletTxRepo: Repository<EwalletTransaction>,
	) {}

	async findAll(search?: string) {
		const qb = this.merchantRepo.createQueryBuilder("m")
		if (search) {
			qb.where("m.name ILIKE :search OR m.email ILIKE :search OR m.unique_number ILIKE :search", {
				search: `%${search}%`,
			})
		}
		qb.orderBy("m.id", "DESC")
		return qb.getMany()
	}

	async findOne(id: number) {
		const merchant = await this.merchantRepo.findOneBy({ id })
		if (!merchant) throw new NotFoundException(`Merchant #${id} not found`)

		const wallet = await this.ewalletRepo.findOne({
			where: { uniqueId: merchant.uniqueNumber },
		})

		return { merchant, wallet }
	}

	async create(dto: CreateMerchantDto) {
		const existing = await this.merchantRepo.findOneBy({ email: dto.email })
		if (existing) throw new BadRequestException(`Email ${dto.email} sudah terdaftar`)

		const count = await this.merchantRepo.count()
		const year = new Date().getFullYear()
		const uniqueNumber = `${year}${String(count + 1).padStart(3, "0")}`

		const randomPass = crypto.randomBytes(6).toString("hex")
		const hashedPassword = await bcrypt.hash(randomPass, 10)

		const merchant = this.merchantRepo.create({
			name: dto.name,
			merchantName: dto.name,
			email: dto.email,
			phone: dto.phone ?? null,
			address: dto.address ?? null,
			uniqueNumber,
			password: hashedPassword,
			isBlocked: false,
		})
		const savedMerchant = await this.merchantRepo.save(merchant)

		let user = await this.userRepo.findOneBy({ email: dto.email })
		if (!user) {
			user = this.userRepo.create({
				name: dto.picName || dto.name,
				email: dto.email,
				password: hashedPassword,
				role: "Merchant",
				isBlocked: false,
			})
			await this.userRepo.save(user)
		}

		let wallet = await this.ewalletRepo.findOne({ where: { uniqueId: uniqueNumber } })
		if (!wallet) {
			wallet = this.ewalletRepo.create({
				uniqueId: uniqueNumber,
				ewalletableType: "merchant",
				ewalletableId: String(savedMerchant.id),
				ewalletableName: dto.name,
				totalBalance: "0",
				isActive: true,
			})
			await this.ewalletRepo.save(wallet)
		}

		return { merchant: savedMerchant, initialPassword: randomPass }
	}

	async update(id: number, dto: UpdateMerchantDto) {
		const { merchant } = await this.findOne(id)
		Object.assign(merchant, dto)
		return this.merchantRepo.save(merchant)
	}

	async toggleBlock(id: number, dto: ToggleBlockMerchantDto) {
		const { merchant, wallet } = await this.findOne(id)
		merchant.isBlocked = dto.blocked
		if (dto.blocked) merchant.blockedAt = new Date()
		else merchant.blockedAt = null
		await this.merchantRepo.save(merchant)

		if (merchant.email) {
			const user = await this.userRepo.findOneBy({ email: merchant.email })
			if (user) {
				user.isBlocked = dto.blocked
				await this.userRepo.save(user)
			}
		}

		if (wallet) {
			wallet.isActive = !dto.blocked
			await this.ewalletRepo.save(wallet)
		}

		return { success: true, message: `Status merchant ${dto.blocked ? "diblokir" : "diaktifkan"}` }
	}

	async getMerchantTransactions(id: number) {
		const { merchant, wallet } = await this.findOne(id)
		if (!wallet) return []

		return this.ewalletTxRepo.find({
			where: { ewalletId: String(wallet.id) },
			order: { id: "DESC" },
		})
	}

	async remove(id: number) {
		const { merchant, wallet } = await this.findOne(id)
		if (wallet) {
			wallet.isActive = false
			await this.ewalletRepo.save(wallet)
		}
		await this.merchantRepo.remove(merchant)
		return { success: true, message: `Merchant #${id} berhasil dihapus` }
	}
}
