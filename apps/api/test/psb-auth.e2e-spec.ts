import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { createTestingApp, MockMailerService, MockRedisService } from "./test-utils"

describe("PSB Authentication & 2FA (E2E)", () => {
	let app: INestApplication
	let redis: MockRedisService
	let mailer: MockMailerService
	let testUserEmail: string
	let testUserPassword = "Password123!"

	beforeAll(async () => {
		const testApp = await createTestingApp()
		app = testApp.app
		redis = testApp.redis
		mailer = testApp.mailer

		// Register a fresh test account
		testUserEmail = `auth.test.${Date.now()}@example.com`
		const checkRes = await request(app.getHttpServer())
			.post("/api/psb/register/check-email")
			.send({ email: testUserEmail, levelId: 1 })
		const sessionId = checkRes.body.data.sessionId

		await request(app.getHttpServer())
			.post("/api/psb/register/personal")
			.set("x-session-id", sessionId)
			.send({
				fullname: "Santri Auth Tester",
				gender: "male",
				placeOfBirth: "Bandung",
				dateOfBirth: "2010-01-01",
				phone: "081234567890",
				provinceId: 1,
				regencyId: 1,
				districtId: 1,
				schoolName: "SD Roja",
			})

		await request(app.getHttpServer())
			.post("/api/psb/register/identity")
			.set("x-session-id", sessionId)
			.send({ nik: "3201123456780002" })

		await request(app.getHttpServer())
			.post("/api/psb/register/family")
			.set("x-session-id", sessionId)
			.send({ fatherFullname: "Ayah", motherFullname: "Ibu" })

		const regRes = await request(app.getHttpServer())
			.post("/api/psb/register/attachment")
			.set("x-session-id", sessionId)

		// Get the auto-generated password from sent email
		const welcomeEmail = mailer.sentEmails.find(
			(e) => e.to === testUserEmail && e.template === "registrant-password",
		)
		testUserPassword = (welcomeEmail?.context as { password?: string })?.password ?? "UNKNOWN"
	})

	afterAll(async () => {
		await app.close()
	})

	describe("POST /api/psb/auth/login", () => {
		it("Scenario A: should reject invalid password with 401", async () => {
			const res = await request(app.getHttpServer())
				.post("/api/psb/auth/login")
				.send({
					email: testUserEmail,
					password: "WrongPassword123!",
				})
				.expect(401)

			expect(res.body.success).toBe(false)
			expect(res.body.message).toContain("Email atau password")
		})

		it("Scenario B: should reject non-existent user with 401", async () => {
			const res = await request(app.getHttpServer())
				.post("/api/psb/auth/login")
				.send({
					email: "nobody@example.com",
					password: "Password123!",
				})
				.expect(401)

			expect(res.body.success).toBe(false)
		})

		it("Scenario C: should trigger 2FA email code when logging in from new IP", async () => {
			const res = await request(app.getHttpServer())
				.post("/api/psb/auth/login")
				.set("X-Forwarded-For", "198.51.100.1")
				.send({
					email: testUserEmail,
					password: testUserPassword,
				})
				.expect(201)

			expect(res.body.success).toBe(true)
			expect(res.body.data.requires2fa).toBe(true)
			expect(res.body.data.email).toBe(testUserEmail)

			// Verify 2FA email was sent
			const twoFactorEmail = mailer.sentEmails.find(
				(e) => e.to === testUserEmail && e.template === "two-factor",
			)
			expect(twoFactorEmail).toBeDefined()
		})
	})

	describe("POST /api/psb/auth/two-factor", () => {
		it("Scenario A: should reject wrong 2FA code with 400", async () => {
			const res = await request(app.getHttpServer())
				.post("/api/psb/auth/two-factor")
				.send({
					email: testUserEmail,
					code: "000000",
				})
				.expect(400)

			expect(res.body.success).toBe(false)
		})

		it("Scenario B: should verify correct 2FA code and return JWT tokens", async () => {
			// Find the sent 2FA code from mock mailer
			const twoFactorEmail = mailer.sentEmails
				.reverse()
				.find((e) => e.to === testUserEmail && e.template === "two-factor")
			const code = (twoFactorEmail?.context as { code?: string })?.code

			const res = await request(app.getHttpServer())
				.post("/api/psb/auth/two-factor")
				.set("X-Forwarded-For", "198.51.100.1")
				.send({
					email: testUserEmail,
					code: code ?? "123456",
				})
				.expect(201)

			expect(res.body.success).toBe(true)
			expect(res.body.data.requires2fa).toBe(false)
			expect(res.body.data).toHaveProperty("accessToken")
			expect(res.body.data).toHaveProperty("refreshToken")
		})
	})

	describe("Password Recovery & Reset", () => {
		it("Scenario A: should dispatch password reset link", async () => {
			const res = await request(app.getHttpServer())
				.post("/api/psb/auth/forgot-password")
				.send({ email: testUserEmail })
				.expect(201)

			expect(res.body.success).toBe(true)

			const resetEmail = mailer.sentEmails.find(
				(e) => e.to === testUserEmail && e.template === "forgot-password",
			)
			expect(resetEmail).toBeDefined()
		})

		it("Scenario B: should reject password reset when confirmations mismatch", async () => {
			const res = await request(app.getHttpServer())
				.post("/api/psb/auth/reset-password")
				.send({
					email: testUserEmail,
					token: "some-token",
					password: "NewPassword123!",
					passwordConfirmation: "Mismatch123!",
				})
				.expect(400)

			expect(res.body.success).toBe(false)
		})
	})
})
