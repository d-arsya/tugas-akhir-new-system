import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { createTestingApp } from "./test-utils"

describe("Foundation & Core Endpoints (E2E)", () => {
	let app: INestApplication

	beforeAll(async () => {
		const testApp = await createTestingApp()
		app = testApp.app
	})

	afterAll(async () => {
		await app.close()
	})

	describe("Root & API Documentation", () => {
		it("GET / should redirect to /docs (302)", async () => {
			const res = await request(app.getHttpServer()).get("/").expect(302)
			expect(res.header.location).toBe("/docs")
		})

		it("GET /docs should render HTML documentation (200)", async () => {
			const res = await request(app.getHttpServer()).get("/docs").expect(200)
			expect(res.text).toContain("Scalar API Reference")
		})

		it("GET /docs/openapi.json should return valid OpenAPI 3.0 document", async () => {
			const res = await request(app.getHttpServer()).get("/docs/openapi.json").expect(200)
			expect(res.body.openapi).toBe("3.0.0")
			expect(res.body.info.title).toBe("Roja API")
		})
	})

	describe("Global Filters & Routing", () => {
		it("GET /api (unhandled route) should return structured 404 response", async () => {
			const res = await request(app.getHttpServer()).get("/api").expect(404)
			expect(res.body).toEqual({
				success: false,
				message: "Cannot GET /api",
			})
		})
	})

	describe("Location Endpoints", () => {
		it("GET /api/location/provinces should return array", async () => {
			const res = await request(app.getHttpServer()).get("/api/location/provinces").expect(200)
			expect(res.body.success).toBe(true)
			expect(Array.isArray(res.body.data)).toBe(true)
		})

		it("GET /api/location/regencies?province_id=1 should return array", async () => {
			const res = await request(app.getHttpServer()).get("/api/location/regencies?province_id=1").expect(200)
			expect(res.body.success).toBe(true)
			expect(Array.isArray(res.body.data)).toBe(true)
		})

		it("GET /api/location/districts?regency_id=1 should return array", async () => {
			const res = await request(app.getHttpServer()).get("/api/location/districts?regency_id=1102").expect(200)
			expect(res.body.success).toBe(true)
			expect(Array.isArray(res.body.data)).toBe(true)
		})
	})

	describe("Legacy File Bridge", () => {
		it("GET /api/files/legacy/:folder/:filename should return 404 if file does not exist", async () => {
			const res = await request(app.getHttpServer())
				.get("/api/files/legacy/avatars/non-existent.jpg")
				.expect(404)
			expect(res.body.success).toBe(false)
		})
	})
})
