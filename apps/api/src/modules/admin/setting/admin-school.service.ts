import { createHash, randomBytes } from "crypto"
import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"

import { throwFieldErrors, type FieldErrors } from "@core/errors/field-errors"
import { StorageService } from "@core/storage/storage.service"
import { SettingSchool } from "@shared/school/entities/setting-school.entity"
import {
	AdminSchoolUpdateSchema,
	fieldErrorsFromZod,
	isTruthyFlag,
	schoolFileErrors,
} from "@admin/setting/dto/admin-school.dto"
import { TIMEZONE } from "@admin/common/sql"

export type AdminSchoolSetting = {
	id: number
	name: string | null
	slogan: string | null
	phone: string | null
	provinceId: number | null
	regencyId: number | null
	districtId: number | null
	fullAddress: string | null
	logo: string | null
	favicon: string | null
	logoUrl: string | null
	faviconUrl: string | null
}

export type SchoolUploads = {
	logo?: Express.Multer.File | undefined
	favicon?: Express.Multer.File | undefined
}

// `resources/lang/id/admin.php`
const UPDATE_SUCCESS = "Data berhasil diupdate."
const UPDATE_FAILED = "Data gagal diupdate."

// The annotation is what lets TypeScript see that `throwFieldErrors` never returns
const fail: (errors: FieldErrors) => never = throwFieldErrors

const toNumber = (value: string | number | null): number | null =>
	value === null || value === "" ? null : Number(value)

/** `Carbon::now()->format('Y/m/d/')` in the legacy timezone. */
const datePath = (): string => {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: TIMEZONE,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(new Date())
	return `${parts.replaceAll("-", "/")}/`
}

/** `md5($nameWithoutExtension . Str::random(5)) . '.' . $extension`. */
const uploadName = (originalName: string): string => {
	const dot = originalName.lastIndexOf(".")
	const base = dot > 0 ? originalName.slice(0, dot) : originalName
	const extension = dot > 0 ? originalName.slice(dot + 1) : ""
	const random = randomBytes(4).toString("base64url").slice(0, 5)
	const hash = createHash("md5").update(`${base}${random}`).digest("hex")
	return extension ? `${hash}.${extension}` : hash
}

// WS-B: legacy SettingSchoolController + UploadTraits
@Injectable()
export class AdminSchoolService {
	constructor(
		@InjectRepository(SettingSchool)
		private readonly schoolRepository: Repository<SettingSchool>,
		private readonly storageService: StorageService,
		private readonly configService: ConfigService,
	) {}

	/** `index()` — `SettingSchool::first()`, plus the preview URLs the blade built with `storage_url()`. */
	async getSchool(): Promise<AdminSchoolSetting> {
		const school = await this.findSchool()

		return {
			id: Number(school.id),
			name: school.name,
			slogan: school.slogan,
			phone: school.phone === null ? null : String(school.phone),
			provinceId: toNumber(school.provinceId),
			regencyId: toNumber(school.regencyId),
			districtId: toNumber(school.districtId),
			fullAddress: school.fullAddress,
			logo: school.logo,
			favicon: school.favicon,
			logoUrl: await this.previewUrl(school.logo),
			faviconUrl: await this.previewUrl(school.favicon),
		}
	}

	/**
	 * `update()`. The body arrives as multipart, so it is parsed here: that keeps the upload
	 * messages (`logo`, `favicon`) in front of the field messages, in legacy `rules()` order.
	 */
	async updateSchool(body: unknown, files: SchoolUploads): Promise<{ message: string }> {
		const fileErrors = schoolFileErrors(files)
		const parsed = AdminSchoolUpdateSchema.safeParse(body)
		if (!parsed.success) fail({ ...fileErrors, ...fieldErrorsFromZod(parsed.error) })
		if (Object.keys(fileErrors).length > 0) fail(fileErrors)

		const dto = parsed.data
		const school = await this.findSchool()

		try {
			// The two hidden inputs the "kosongkan" action sets before submitting
			if (isTruthyFlag(dto.emptyLogo)) {
				await this.removeObject(school.logo)
				school.logo = null
			}
			if (isTruthyFlag(dto.emptyFavicon)) {
				await this.removeObject(school.favicon)
				school.favicon = null
			}

			// A new upload replaces the object the column pointed at
			const logo = await this.storeUpload(files.logo)
			if (logo) {
				await this.removeObject(school.logo)
				school.logo = logo
			}
			const favicon = await this.storeUpload(files.favicon)
			if (favicon) {
				await this.removeObject(school.favicon)
				school.favicon = favicon
			}

			school.name = dto.name
			school.slogan = dto.slogan === "" ? null : dto.slogan
			school.phone = dto.phone === "" ? null : dto.phone
			school.provinceId = Number(dto.provinceId)
			school.regencyId = Number(dto.regencyId)
			school.districtId = Number(dto.districtId)
			school.fullAddress = dto.fullAddress

			await this.schoolRepository.save(school)
		} catch {
			throw new InternalServerErrorException(UPDATE_FAILED)
		}

		return { message: UPDATE_SUCCESS }
	}

	/**
	 * `UploadTraits::uploadFile` — the column keeps the relative key (`Y/m/d/<md5>.<ext>`),
	 * never a URL, because the psb and santri apps read it raw.
	 */
	private async storeUpload(file: Express.Multer.File | undefined): Promise<string | null> {
		if (!file) return null

		// `run-api.sh` points a verification run at a throwaway folder; unset everywhere else
		const prefix = this.configService.get<string>("STORAGE_TEST_PREFIX") ?? ""
		const key = `${prefix}${datePath()}${uploadName(file.originalname)}`
		await this.storageService.uploadBuffer(file.buffer, key, file.mimetype)
		return key
	}

	/** `File::delete('storage/' . $key)` — a key that is already gone is not an error. */
	private async removeObject(key: string | null): Promise<void> {
		if (!key) return
		try {
			await this.storageService.delete(key)
		} catch {
			// legacy ignored a missing file too
		}
	}

	/** `storage_url()`; null when there is nothing stored or the key cannot be resolved. */
	private async previewUrl(key: string | null): Promise<string | null> {
		if (!key) return null
		try {
			return await this.storageService.getUrl(key)
		} catch {
			return null
		}
	}

	private async findSchool(): Promise<SettingSchool> {
		const school = await this.schoolRepository.findOne({ where: {}, order: { id: "ASC" } })
		if (!school) throw new NotFoundException("Profil pondok belum diatur.")
		return school
	}
}
