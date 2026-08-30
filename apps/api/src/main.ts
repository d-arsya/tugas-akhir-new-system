import { Logger, ValidationPipe } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"
import { SwaggerModule } from "@nestjs/swagger"
import { apiReference } from "@scalar/nestjs-api-reference"
import { cleanupOpenApiDoc } from "nestjs-zod"
import { Logger as PinoLogger } from "nestjs-pino"
import { AppModule } from "./app.module"
import { HttpExceptionFilter } from "./core/filters/http-exception.filter"
import { TransformInterceptor } from "./core/interceptors/transform.interceptor"
import type { Request, Response } from "express"

async function bootstrap(): Promise<void> {
	const app = await NestFactory.create(AppModule)

	// Use Pino structured logger
	app.useLogger(app.get(PinoLogger))

	// Global prefix for API endpoints
	app.setGlobalPrefix("api")

	// Global pipes
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
			forbidNonWhitelisted: true,
		}),
	)

	// Global filters
	app.useGlobalFilters(new HttpExceptionFilter())

	// Global interceptors
	app.useGlobalInterceptors(new TransformInterceptor())

	// CORS
	app.enableCors({
		origin: [
			"http://localhost:4200", // psb dev
			"http://localhost:4201", // santri dev
			"http://localhost:4202", // merchant dev
			"http://localhost:4203", // admin dev
		],
		credentials: true,
	})

	// Redirect root / to /docs
	const httpAdapter = app.getHttpAdapter()
	httpAdapter.get("/", (_req: Request, res: Response) => {
		res.redirect("/docs")
	})

	// Scalar API docs (dev only)
	if (process.env["NODE_ENV"] !== "production") {
		const rawDocument = SwaggerModule.createDocument(app, {
			openapi: "3.0.0",
			info: { title: "Roja API", version: "1.0.0" },
		})
		const document = cleanupOpenApiDoc(rawDocument)

		app.use(
			"/docs",
			apiReference({
				spec: { content: document },
			}),
		)
	}

	const port = process.env["PORT"] ?? 4000
	await app.listen(port)
	Logger.log(`🚀 API is running on: http://localhost:${port}/api`, "Bootstrap")
	if (process.env["NODE_ENV"] !== "production") {
		Logger.log(`📚 Docs: http://localhost:${port}/docs`, "Bootstrap")
	}
}

bootstrap()
