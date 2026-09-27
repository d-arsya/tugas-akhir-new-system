import { randomInt } from "node:crypto"

import { BadRequestException, HttpException, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import * as bcrypt from "bcrypt"
import { DataSource, Like, Repository, type EntityManager } from "typeorm"

import type { AdminMessageResult, AdminRegistrantCreateResult, SocietyDraftStepKey, SocietyStepCheckDto } from "@roja/types"
import { SOCIETY_COLUMNS } from "@roja/utils/society-fields"

import { StorageService } from "../../../core/storage/storage.service"
import { replaceDiseaseHistories } from "../../../shared/society/disease-history"
import { storeSocietyUpload } from "../../../shared/society/files"
import { readSocietyMultipart, validateSocietyInput, type SocietyUpload, type SocietyValidated } from "../../../shared/society/society-rules"
import { Registrant } from "@psb/entities/registrant.entity"
import { AcademicYear } from "@shared/master/entities/academic-year.entity"

import { RegistrantMailService } from "./registrant-mail.service"

// Legacy `Registrant\*Controller` (the create wizard) and `RegistrantController::update` (the edit save).
// Owned by workstream AK-P. Every save runs in one transaction; mails go out after the commit.

const UPDATE_SUCCESS = "Data berhasil diupdate."
const UPDATE_FAILED = "Data gagal diupdate."
const CREATE_SUCCESS = "Data berhasil disimpan ke dalam basis data."

/** Advisory-lock key for the `PR{year}{serial}` sequence; arbitrary but stable. */
const REGISTRANT_ID_LOCK_KEY = 5_201_027

const DRAFT_STEPS: readonly SocietyDraftStepKey[] = ["personal", "identity", "family", "guardian"]

/** Columns a registrant save may write (the society form plus the step-1 / widget keys). */
const WRITABLE = new Set<string>([...SOCIETY_COLUMNS, "academic_year_id", "level_id", "registration_path", "is_blocked"])

type Column = string | number | boolean | null

const pickWritable = (columns: SocietyValidated["columns"]): Record<string, Column> => {
	const out: Record<string, Column> = {}
	for (const [key, value] of Object.entries(columns)) if (WRITABLE.has(key)) out[key] = value
	return out
}

/** `Str::upper(Str::random(8))` */
const generatePassword = (): string => {
	const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
	return Array.from({ length: 8 }, () => alphabet[randomInt(alphabet.length)] ?? "A")
		.join("")
		.toUpperCase()
}

/**
 * `AttachmentController::generateRegistrantId()`: `PR` + the first 4 characters of the year + the serial,
 * starting from the year's `serial_number` (leading zeros stripped, padded back to its length) and stepping
 * by one until the id is unused. Taken under a transaction-scoped advisory lock (legacy raced here).
 */
const generateRegistrantId = async (manager: EntityManager, academicYearId: number): Promise<string> => {
	await manager.query("SELECT pg_advisory_xact_lock($1)", [REGISTRANT_ID_LOCK_KEY])
	const academicYear = await manager.findOne(AcademicYear, {
		select: { id: true, year: true, serialNumber: true },
		where: { id: academicYearId },
	})
	const serial = academicYear?.serialNumber ?? ""
	const prefix = `PR${(academicYear?.year ?? "").slice(0, 4)}`
	const registrants = await manager.find(Registrant, {
		select: { id: true, registrantId: true },
		where: { registrantId: Like(`${prefix}%`) },
	})
	const taken = new Set(registrants.map((registrant) => registrant.registrantId))
	const start = serial.replace(/^0+/, "")
	let increment = Number(start === "" ? "0" : start)
	let candidate = `${prefix}${start.padStart(serial.length, "0")}`
	while (taken.has(candidate)) {
		increment += 1
		candidate = `${prefix}${String(increment).padStart(serial.length, "0")}`
	}
	return candidate
}

const setClause = (columns: Record<string, Column>, from: number): { sql: string; params: Column[] } => {
	const keys = Object.keys(columns)
	return {
		sql: keys.map((key, index) => `${key} = $${index + from}`).join(", "),
		params: keys.map((key) => columns[key] ?? null),
	}
}

@Injectable()
export class RegistrantWriteService {
	private readonly logger = new Logger(RegistrantWriteService.name)

	constructor(
		@Inject(DataSource) private readonly dataSource: DataSource,
		@InjectRepository(Registrant) private readonly registrants: Repository<Registrant>,
		@Inject(StorageService) private readonly storageService: StorageService,
		@Inject(RegistrantMailService) private readonly mail: RegistrantMailService,
	) {}

	/** Legacy `validate{Personal,Identity,Family,Guardian}Data` — answers OK or the step's 400 field errors. */
	async validateStep(step: string, body: SocietyStepCheckDto): Promise<AdminMessageResult> {
		if (!DRAFT_STEPS.includes(step as SocietyDraftStepKey)) throw new NotFoundException("Langkah tidak ditemukan")
		const values: Record<string, string> = {}
		for (const [key, value] of Object.entries(body?.values ?? {})) if (typeof value === "string") values[key] = value
		await validateSocietyInput(this.dataSource.manager, {
			variant: "registrant-create",
			step: step as SocietyDraftStepKey,
			values,
			diseases: Array.isArray(body?.diseases) ? body.diseases : [],
			files: {},
		})
		return { message: "OK" }
	}

	/**
	 * `AttachmentController::validateAttachmentData`: every step again plus the attachments, then one
	 * registrant (`registered_by_admin = 1`, a random password nobody is shown) and its disease rows.
	 */
	async create(body: Record<string, unknown>, files: Record<string, SocietyUpload[] | undefined> | undefined): Promise<AdminRegistrantCreateResult> {
		const input = readSocietyMultipart(body, files)
		const validated = await validateSocietyInput(this.dataSource.manager, { variant: "registrant-create", ...input })
		const columns = pickWritable(validated.columns)
		delete columns["is_blocked"]
		const academicYearId = Number(columns["academic_year_id"])
		if (!Number.isFinite(academicYearId)) throw new BadRequestException("Tahun ajaran tidak valid")

		try {
			for (const [column, upload] of Object.entries(validated.uploads)) columns[column] = await storeSocietyUpload(this.storageService, upload)
			const password = await bcrypt.hash(generatePassword(), 10)

			const id = await this.dataSource.transaction(async (manager) => {
				const registrantId = await generateRegistrantId(manager, academicYearId)
				const insert: Record<string, Column> = { ...columns, registrant_id: registrantId, registered_by_admin: true, password }
				const keys = Object.keys(insert)
				const rows = (await manager.query(
					`INSERT INTO tbr_registrants (${keys.join(", ")}, created_at, updated_at)
					VALUES (${keys.map((_, index) => `$${index + 1}`).join(", ")}, now(), now()) RETURNING id`,
					keys.map((key) => insert[key] ?? null),
				)) as Array<{ id: string }>
				const newId = Number(rows[0]?.id)
				await replaceDiseaseHistories(manager, "registrant", newId, validated.diseases)
				return newId
			})
			return { id, message: CREATE_SUCCESS, redirect: `/registrants/${id}` }
		} catch (error) {
			if (error instanceof HttpException) throw error
			this.logger.error(`registrant create failed: ${error instanceof Error ? error.message : String(error)}`)
			throw new InternalServerErrorException(UPDATE_FAILED)
		}
	}

	/**
	 * `RegistrantController::update` (`Register\UpdateRequest`). Admin-registered rows: the society
	 * columns, the widget's level, `is_blocked`, the account email / password and the disease rows.
	 * Portal rows (`registered_by_admin = 0`) change `is_blocked` only — the approved fix: legacy also
	 * wrote the disabled (so unposted) email back as null.
	 */
	async update(
		registrantId: number,
		body: Record<string, unknown>,
		files: Record<string, SocietyUpload[] | undefined> | undefined,
	): Promise<AdminMessageResult> {
		const row = await this.registrants.findOne({
			select: { id: true, registeredByAdmin: true, fullname: true, email: true },
			where: { id: registrantId },
		})
		if (!row) throw new NotFoundException("Pendaftar tidak ditemukan")
		const portalRow = row.registeredByAdmin !== true

		const input = readSocietyMultipart(body, files)
		const validated = await validateSocietyInput(this.dataSource.manager, {
			variant: "registrant-update",
			...input,
			ignoreId: registrantId,
			portalRow,
		})

		let password: string | null = null
		try {
			const columns: Record<string, Column> = portalRow ? { is_blocked: validated.columns["is_blocked"] ?? false } : pickWritable(validated.columns)
			if (!portalRow) {
				for (const [column, upload] of Object.entries(validated.uploads)) columns[column] = await storeSocietyUpload(this.storageService, upload)
				// `createAccount()`: the email is written as posted; a filled password is hashed and mailed
				if ("email" in input.values) columns["email"] = validated.columns["email"] ?? null
				const raw = validated.columns["password"]
				if (typeof raw === "string" && raw !== "") {
					password = raw
					columns["password"] = await bcrypt.hash(raw, 10)
				}
			}

			await this.dataSource.transaction(async (manager) => {
				const set = setClause(columns, 2)
				await manager.query(`UPDATE tbr_registrants SET ${set.sql}${set.sql ? ", " : ""}updated_at = now() WHERE id = $1`, [
					registrantId,
					...set.params,
				])
				// `updateDiseaseHistory()` returns early for portal rows
				if (!portalRow) await replaceDiseaseHistories(manager, "registrant", registrantId, validated.diseases)
			})

			if (password !== null) {
				const email = typeof columns["email"] === "string" ? columns["email"] : row.email
				const fullname = typeof columns["fullname"] === "string" ? columns["fullname"] : row.fullname
				this.mail.password({ email, fullname }, password)
				this.mail.verification({ email, fullname })
			}
			return { message: UPDATE_SUCCESS }
		} catch (error) {
			if (error instanceof HttpException) throw error
			this.logger.error(`registrant ${registrantId} update failed: ${error instanceof Error ? error.message : String(error)}`)
			throw new InternalServerErrorException(UPDATE_FAILED)
		}
	}
}
