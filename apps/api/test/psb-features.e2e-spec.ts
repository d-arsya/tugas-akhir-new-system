import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { createTestingApp, MockMailerService, MockRedisService } from "./test-utils"

describe("PSB Features: Dashboard, Print, Settings (E2E)", () => {
	let app: INestApplication
	let accessToken: string
	let registrantDbId: number
	let testEmail: string

	beforeAll(async () => {
		const testApp = await createTestingApp()
		app = testApp.app

		// Register a fresh test account
		testEmail = `features.test.${Date.now()}@example.com`
		const checkRes = await request(app.getHttpServer())
			.post("/api/psb/register/check-email")
			.send({ email: testEmail, levelId: 1 })
		const sessionId = checkRes.body.data.sessionId

		await request(app.getHttpServer())
			.post("/api/psb/register/personal")
			.set("x-session-id", sessionId)
			.send({
				fullname: "Santri Fitur Tester",
				gender: "male",
				placeOfBirth: "Semarang",
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
			.send({ nik: "3201123456780003" })

		await request(app.getHttpServer())
			.post("/api/psb/register/family")
			.set("x-session-id", sessionId)
			.send({ fatherFullname: "Ayah", motherFullname: "Ibu" })

		const regRes = await request(app.getHttpServer())
			.post("/api/psb/register/attachment")
			.set("x-session-id", sessionId)

		accessToken = regRes.body.data.auth.accessToken
		registrantDbId = regRes.body.data.registrant.id
	})

	afterAll(async () => {
		await app.close()
	})

	describe("GET /api/psb/dashboard", () => {
		it("Scenario A: should reject unauthenticated request with 401", async () => {
			const res = await request(app.getHttpServer()).get("/api/psb/dashboard").expect(401)
			expect(res.body.success).toBe(false)
		})

		it("Scenario B: should return registrant dashboard status when authenticated", async () => {
			const res = await request(app.getHttpServer())
				.get("/api/psb/dashboard")
				.set("Authorization", `Bearer ${accessToken}`)
				.expect(200)

			expect(res.body.success).toBe(true)
			expect(res.body.data).toHaveProperty("registrant")
			expect(res.body.data).toHaveProperty("statusInfo")
			expect(res.body.data.statusInfo.status).toBe("wait")
		})
	})

	describe("GET /api/psb/print/*", () => {
		it("Scenario A: should return public registration proof", async () => {
			const res = await request(app.getHttpServer())
				.get(`/api/psb/print/registration/${registrantDbId}`)
				.expect(200)

			expect(res.body.success).toBe(true)
			expect(res.body.data.registrant.id).toBe(registrantDbId)
		})

		it("Scenario B: should reject accepted proof when status is not approve (403)", async () => {
			const res = await request(app.getHttpServer())
				.get("/api/psb/print/accepted")
				.set("Authorization", `Bearer ${accessToken}`)
				.expect(403)

			expect(res.body.success).toBe(false)
		})

		it("Scenario C: should reject rejected proof when status is not reject (403)", async () => {
			const res = await request(app.getHttpServer())
				.get("/api/psb/print/rejected")
				.set("Authorization", `Bearer ${accessToken}`)
				.expect(403)

			expect(res.body.success).toBe(false)
		})
	})

	describe("PATCH /api/psb/invalid/data/* Guard", () => {
		it("should forbid modifying data when status is valid (not invalid)", async () => {
			const res = await request(app.getHttpServer())
				.patch("/api/psb/invalid/data/personal")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({
					fullname: "New Name",
					gender: "male",
					placeOfBirth: "Semarang",
					dateOfBirth: "2010-01-01",
					phone: "081234567890",
					provinceId: 1,
					regencyId: 1,
					districtId: 1,
					schoolName: "SD Roja",
				})
				.expect(403)

			expect(res.body.success).toBe(false)
			expect(res.body.message).toContain("invalid")
		})
	})

	describe("Account Settings", () => {
		it("Scenario A: should update profile name", async () => {
			const res = await request(app.getHttpServer())
				.patch("/api/psb/setting/profile")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({ fullname: "Santri Fitur Terupdate" })
				.expect(200)

			expect(res.body.success).toBe(true)
			expect(res.body.data.fullname).toBe("Santri Fitur Terupdate")
		})

		it("Scenario B: should update password", async () => {
			const res = await request(app.getHttpServer())
				.patch("/api/psb/setting/password")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({
					password: "BrandNewPassword123!",
					passwordConfirmation: "BrandNewPassword123!",
				})
				.expect(200)

			expect(res.body.success).toBe(true)
		})

		it("Scenario C: should toggle 2FA off and on", async () => {
			const disableRes = await request(app.getHttpServer())
				.patch("/api/psb/setting/two-factor")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({ enabled: false })
				.expect(200)

			expect(disableRes.body.data.enabled).toBe(false)

			const enableRes = await request(app.getHttpServer())
				.patch("/api/psb/setting/two-factor")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({ enabled: true })
				.expect(200)

			expect(enableRes.body.data.enabled).toBe(true)
		})
	})
})
