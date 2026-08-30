import { INestApplication, ValidationPipe } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import { SwaggerModule } from "@nestjs/swagger"
import { cleanupOpenApiDoc } from "nestjs-zod"
import { DataSource } from "typeorm"
import { AppModule } from "../src/app.module"
import { HttpExceptionFilter } from "../src/core/filters/http-exception.filter"
import { TransformInterceptor } from "../src/core/interceptors/transform.interceptor"
import { MailerService } from "../src/core/mailer/mailer.service"
import { RedisService } from "../src/core/redis/redis.service"
import { StorageService } from "../src/core/storage/storage.service"
import { AcademicYear } from "../src/psb/entities/academic-year.entity"
import { Level } from "../src/psb/entities/level.entity"
import { SettingAnnc } from "../src/psb/entities/setting-annc.entity"
import { SettingSchool } from "../src/psb/entities/setting-school.entity"
import type { Request, Response } from "express"

export class MockRedisService {
	private store = new Map<string, string>()

	async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
		this.store.set(key, value)
	}

	async get(key: string): Promise<string | null> {
		return this.store.get(key) ?? null
	}

	async del(key: string): Promise<void> {
		this.store.delete(key)
	}

	async exists(key: string): Promise<boolean> {
		return this.store.has(key)
	}

	refreshTokenKey(userId: number, tokenId: string): string {
		return `refresh:${userId}:${tokenId}`
	}

	async storeRefreshToken(userId: number, tokenId: string, ttlSeconds: number): Promise<void> {
		await this.set(this.refreshTokenKey(userId, tokenId), "valid", ttlSeconds)
	}

	async validateRefreshToken(userId: number, tokenId: string): Promise<boolean> {
		return this.exists(this.refreshTokenKey(userId, tokenId))
	}

	async revokeRefreshToken(userId: number, tokenId: string): Promise<void> {
		await this.del(this.refreshTokenKey(userId, tokenId))
	}

	clear(): void {
		this.store.clear()
	}
}

export class MockMailerService {
	sentEmails: Array<{ to: string; subject: string; template: string; context: unknown }> = []

	async sendEmailVerification(to: string, data: unknown): Promise<void> {
		this.sentEmails.push({ to, subject: "Verifikasi Email", template: "email-verification", context: data })
	}

	async sendForgotPassword(to: string, data: unknown): Promise<void> {
		this.sentEmails.push({ to, subject: "Reset Password", template: "forgot-password", context: data })
	}

	async sendTwoFactorCode(to: string, data: unknown): Promise<void> {
		this.sentEmails.push({ to, subject: "2FA Code", template: "two-factor", context: data })
	}

	async sendResetPin(to: string, data: unknown): Promise<void> {
		this.sentEmails.push({ to, subject: "Reset PIN", template: "reset-pin", context: data })
	}

	async sendRegistrantPassword(to: string, data: unknown): Promise<void> {
		this.sentEmails.push({ to, subject: "Akun Anda", template: "registrant-password", context: data })
	}
}

export class MockStorageService {
	uploadedFiles: Array<{ file: Express.Multer.File; folder: string }> = []

	async upload(file: Express.Multer.File, folder: string): Promise<string> {
		this.uploadedFiles.push({ file, folder })
		return `https://s3.ap-southeast-1.amazonaws.com/test-bucket/${folder}/${file.originalname || "file.jpg"}`
	}

	getLegacyFile(folder: string, filename: string): { stream: null; contentType: string; exists: boolean } {
		return { stream: null, contentType: "application/octet-stream", exists: false }
	}
}

export async function seedInitialData(app: INestApplication): Promise<void> {
	const dataSource = app.get(DataSource)
	const levelRepo = dataSource.getRepository(Level)
	const academicYearRepo = dataSource.getRepository(AcademicYear)
	const schoolRepo = dataSource.getRepository(SettingSchool)
	const anncRepo = dataSource.getRepository(SettingAnnc)

	const existingLevel = await levelRepo.findOneBy({ id: 1 })
	if (!existingLevel) {
		await levelRepo.save(levelRepo.create({ id: 1, name: "SMP Roja", status: "show" }))
	}

	const existingYear = await academicYearRepo.findOneBy({ status: true })
	if (!existingYear) {
		await academicYearRepo.save(
			academicYearRepo.create({
				year: "2026/2027",
				status: true,
				isCurrent: true,
				type: "reguler",
			}),
		)
	}

	const existingSchool = await schoolRepo.findOne({ order: { id: "DESC" } })
	if (!existingSchool) {
		await schoolRepo.save(
			schoolRepo.create({
				name: "Pondok Roja",
				phone: "0812345678",
			}),
		)
	}

	const existingAnnc = await anncRepo.findOne({ order: { id: "DESC" } })
	if (!existingAnnc) {
		await anncRepo.save(
			anncRepo.create({
				information: "Pendaftaran Santri Baru Telah Dibuka.",
				successDesc: "Selamat, Anda dinyatakan Diterima!",
				failedDesc: "Mohon maaf, Anda belum berhasil.",
			}),
		)
	}
}

export async function createTestingApp(overrides?: {
	redisService?: MockRedisService
	mailerService?: MockMailerService
	storageService?: MockStorageService
}): Promise<{
	app: INestApplication
	redis: MockRedisService
	mailer: MockMailerService
	storage: MockStorageService
}> {
	const mockRedis = overrides?.redisService ?? new MockRedisService()
	const mockMailer = overrides?.mailerService ?? new MockMailerService()
	const mockStorage = overrides?.storageService ?? new MockStorageService()

	const moduleFixture: TestingModule = await Test.createTestingModule({
		imports: [AppModule],
	})
		.overrideProvider(RedisService)
		.useValue(mockRedis)
		.overrideProvider(MailerService)
		.useValue(mockMailer)
		.overrideProvider(StorageService)
		.useValue(mockStorage)
		.compile()

	const app = moduleFixture.createNestApplication()

	app.setGlobalPrefix("api")
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
			forbidNonWhitelisted: true,
		}),
	)
	app.useGlobalFilters(new HttpExceptionFilter())
	app.useGlobalInterceptors(new TransformInterceptor())

	const httpAdapter = app.getHttpAdapter()

	// Redirect root / to /docs
	httpAdapter.get("/", (_req: Request, res: Response) => {
		res.redirect("/docs")
	})

	const rawDocument = SwaggerModule.createDocument(app, {
		openapi: "3.0.0",
		info: { title: "Roja API", version: "1.0.0" },
	})
	const document = cleanupOpenApiDoc(rawDocument)

	httpAdapter.get("/docs/openapi.json", (_req: Request, res: Response) => {
		res.json(document)
	})

	httpAdapter.get("/docs", (_req: Request, res: Response) => {
		res.type("text/html").send("<!doctype html><html><body>Scalar API Reference</body></html>")
	})

	await app.init()
	await seedInitialData(app)

	return {
		app,
		redis: mockRedis,
		mailer: mockMailer,
		storage: mockStorage,
	}
}
