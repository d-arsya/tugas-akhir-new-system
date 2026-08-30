import { Logger, ValidationPipe } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"
import { SwaggerModule } from "@nestjs/swagger"
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

	const httpAdapter = app.getHttpAdapter()

	// Redirect root / to /docs
	httpAdapter.get("/", (_req: Request, res: Response) => {
		res.redirect("/docs")
	})

	// Scalar API docs (dev only / serverless-safe standalone renderer)
	if (process.env["NODE_ENV"] !== "production") {
		const rawDocument = SwaggerModule.createDocument(app, {
			openapi: "3.0.0",
			info: { title: "Roja API", version: "1.0.0" },
		})
		const document = cleanupOpenApiDoc(rawDocument)

		httpAdapter.get("/docs/openapi.json", (_req: Request, res: Response) => {
			res.json(document)
		})

		httpAdapter.get("/docs", (_req: Request, res: Response) => {
			res.type("text/html").send(`
<!doctype html>
<html>
  <head>
    <title>Roja API Documentation</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/svg+xml" href="https://scalar.com/favicon.svg" />
  </head>
  <body>
    <script
      id="api-reference"
      data-url="/docs/openapi.json"
      data-configuration='{"theme":"purple"}'></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>`)
		})
	}

	const port = process.env["PORT"] ?? 4000
	await app.listen(port)
	Logger.log(`🚀 API is running on: http://localhost:${port}/api`, "Bootstrap")
	if (process.env["NODE_ENV"] !== "production") {
		Logger.log(`📚 Docs: http://localhost:${port}/docs`, "Bootstrap")
	}
}

bootstrap()
