import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { createTestingApp, MockMailerService, MockRedisService } from "./test-utils"

describe("PSB Registration Wizard (E2E)", () => {
	let app: INestApplication
	let redis: MockRedisService
	let mailer: MockMailerService

	beforeAll(async () => {
		const testApp = await createTestingApp()
		app = testApp.app
		redis = testApp.redis
		mailer = testApp.mailer
	})

	afterAll(async () => {
		await app.close()
	})

	describe("GET /api/psb/register/landing", () => {
		it("should return landing page information with levels", async () => {
			const res = await request(app.getHttpServer()).get("/api/psb/register/landing").expect(200)
			expect(res.body.success).toBe(true)
			expect(res.body.data).toHaveProperty("isOpen")
			expect(res.body.data).toHaveProperty("levels")
		})
	})

	describe("POST /api/psb/register/check-email", () => {
		it("Scenario A: should generate sessionId for valid new email", async () => {
			const res = await request(app.getHttpServer())
				.post("/api/psb/register/check-email")
				.send({
					email: "calon.santri.test@example.com",
					levelId: 1,
				})
				.expect(201)

			expect(res.body.success).toBe(true)
			expect(res.body.data).toHaveProperty("sessionId")
			expect(res.body.data.email).toBe("calon.santri.test@example.com")

			// Check Redis state
			const sessionId = res.body.data.sessionId
			const saved = await redis.get(`psb-wizard:${sessionId}:email`)
			expect(saved).not.toBeNull()
		})

		it("Scenario B: should reject invalid email format with 400", async () => {
			const res = await request(app.getHttpServer())
				.post("/api/psb/register/check-email")
				.send({
					email: "not-an-email",
					levelId: 1,
				})
				.expect(400)

			expect(res.body.success).toBe(false)
		})

		it("Scenario C: should reject missing levelId with 400", async () => {
			const res = await request(app.getHttpServer())
				.post("/api/psb/register/check-email")
				.send({
					email: "valid@example.com",
				})
				.expect(400)

			expect(res.body.success).toBe(false)
		})
	})

	describe("Wizard Step Guards & State Storage", () => {
		let validSessionId: string

		beforeEach(async () => {
			const res = await request(app.getHttpServer())
				.post("/api/psb/register/check-email")
				.send({
					email: `test.${Date.now()}@example.com`,
					levelId: 1,
				})
			validSessionId = res.body.data.sessionId
		})

		it("Scenario A: should reject requests without x-session-id header (400)", async () => {
			const res = await request(app.getHttpServer())
				.post("/api/psb/register/personal")
				.send({
					fullname: "Ahmad Santri",
					gender: "male",
					placeOfBirth: "Surabaya",
					dateOfBirth: "2010-01-01",
					phone: "081234567890",
					provinceId: 1,
					regencyId: 1,
					districtId: 1,
					schoolName: "SMP Roja",
				})
				.expect(400)

			expect(res.body.message).toContain("Session pendaftaran tidak ditemukan")
		})

		it("Scenario B: should reject expired or invalid sessionId (400)", async () => {
			const res = await request(app.getHttpServer())
				.post("/api/psb/register/personal")
				.set("x-session-id", "non-existent-session-id")
				.send({
					fullname: "Ahmad Santri",
					gender: "male",
					placeOfBirth: "Surabaya",
					dateOfBirth: "2010-01-01",
					phone: "081234567890",
					provinceId: 1,
					regencyId: 1,
					districtId: 1,
					schoolName: "SMP Roja",
				})
				.expect(400)

			expect(res.body.message).toContain("Sesi pendaftaran Anda telah berakhir")
		})

		it("Scenario C: should save personal data to Redis with valid session", async () => {
			const personalPayload = {
				fullname: "Ahmad Santri",
				gender: "male",
				placeOfBirth: "Surabaya",
				dateOfBirth: "2010-01-01",
				phone: "081234567890",
				provinceId: 1,
				regencyId: 1,
				districtId: 1,
				schoolName: "SMP Roja",
			}

			const res = await request(app.getHttpServer())
				.post("/api/psb/register/personal")
				.set("x-session-id", validSessionId)
				.send(personalPayload)
				.expect(201)

			expect(res.body.success).toBe(true)

			// Verify in Redis
			const stored = await redis.get(`psb-wizard:${validSessionId}:personal`)
			expect(stored).not.toBeNull()
			expect(JSON.parse(stored!).fullname).toBe("Ahmad Santri")
		})

		it("Scenario D: should complete entire 5-step registration flow and send email", async () => {
			// Step 1: Personal
			await request(app.getHttpServer())
				.post("/api/psb/register/personal")
				.set("x-session-id", validSessionId)
				.send({
					fullname: "Muhammad Santri Teladan",
					gender: "male",
					placeOfBirth: "Jakarta",
					dateOfBirth: "2010-05-15",
					phone: "081234567890",
					provinceId: 1,
					regencyId: 1,
					districtId: 1,
					schoolName: "MTs Roja",
				})
				.expect(201)

			// Step 2: Identity
			await request(app.getHttpServer())
				.post("/api/psb/register/identity")
				.set("x-session-id", validSessionId)
				.send({
					nik: "3201123456780001",
					bloodType: "o",
					visualCondition: "normal",
					hearingCondition: "normal",
					immunizationGiven: "complete",
					diseases: [{ diseaseName: "Asma", diseaseStatus: "sembuh" }],
				})
				.expect(201)

			// Step 3: Family
			await request(app.getHttpServer())
				.post("/api/psb/register/family")
				.set("x-session-id", validSessionId)
				.send({
					fatherFullname: "Abdullah",
					fatherReligion: "islam",
					fatherPhone: "081211112222",
					motherFullname: "Aminah",
					motherReligion: "islam",
					motherPhone: "081233334444",
				})
				.expect(201)

			// Step 4: Guardian
			await request(app.getHttpServer())
				.post("/api/psb/register/guardian")
				.set("x-session-id", validSessionId)
				.send({
					guardianFullname: "Paman Santri",
					guardianPhone: "081255556666",
				})
				.expect(201)

			// Check Wizard State
			const stateRes = await request(app.getHttpServer())
				.get("/api/psb/register/wizard-state")
				.set("x-session-id", validSessionId)
				.expect(200)

			expect(stateRes.body.data.personal.fullname).toBe("Muhammad Santri Teladan")
			expect(stateRes.body.data.identity.nik).toBe("3201123456780001")
			expect(stateRes.body.data.family.fatherFullname).toBe("Abdullah")

			// Step 5: Attachment & Submit
			const submitRes = await request(app.getHttpServer())
				.post("/api/psb/register/attachment")
				.set("x-session-id", validSessionId)
				.attach("attachCertificate", Buffer.from("dummy-cert-file"), "ijazah.pdf")
				.attach("attachPhoto", Buffer.from("dummy-photo-file"), "pasfoto.jpg")
				.expect(201)

			expect(submitRes.body.success).toBe(true)
			expect(submitRes.body.data).toHaveProperty("registrantId")
			expect(submitRes.body.data.registrantId).toMatch(/^PR\d{8}$/)
			expect(submitRes.body.data.auth).toHaveProperty("accessToken")
			expect(submitRes.body.data.auth).toHaveProperty("refreshToken")

			// Verify welcome email dispatched
			expect(mailer.sentEmails.length).toBeGreaterThan(0)
			const welcomeEmail = mailer.sentEmails.find((e) => e.template === "registrant-password")
			expect(welcomeEmail).toBeDefined()

			// Verify Redis session cleaned up
			const cleaned = await redis.get(`psb-wizard:${validSessionId}:email`)
			expect(cleaned).toBeNull()
		})
	})
})
