import { NestFactory, Reflector } from "@nestjs/core"
import { ExpressAdapter } from "@nestjs/platform-express"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { cleanupOpenApiDoc, ZodValidationPipe } from "nestjs-zod"
import { Logger as PinoLogger } from "nestjs-pino"
import cookieParser from "cookie-parser"
import express from "express"
import type { Request, Response } from "express"
import { AppModule } from "../src/app.module"
import { HttpExceptionFilter } from "../src/core/filters/http-exception.filter"
import { TransformInterceptor } from "../src/core/interceptors/transform.interceptor"

const server = express()
let isInitialized = false

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server))

  // Use cookie-parser middleware
  app.use(cookieParser())

  // Use Pino structured logger
  app.useLogger(app.get(PinoLogger))

  // Global prefix for API endpoints
  app.setGlobalPrefix("api")

  // Global pipes
  app.useGlobalPipes(new ZodValidationPipe())

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter())

  // Global interceptors
  const reflector = app.get(Reflector)
  app.useGlobalInterceptors(new TransformInterceptor(reflector))

  // CORS
  app.enableCors({
    origin: [
      process.env["PSB_URL"] ?? "http://localhost:4200",
      process.env["SANTRI_URL"] ?? "http://localhost:4201",
      process.env["MERCHANT_URL"] ?? "http://localhost:4202",
      process.env["ADMIN_URL"] ?? "http://localhost:4203",
    ],
    credentials: true,
  })

  const httpAdapter = app.getHttpAdapter()

  // Redirect root / to /docs
  httpAdapter.get("/", (_req: Request, res: Response) => {
    res.redirect("/docs")
  })

  // Scalar API docs
  if (process.env["NODE_ENV"] !== "production") {
    const config = new DocumentBuilder()
      .setTitle("Pondok Roja API")
      .setDescription("Dokumentasi Resmi REST API Sistem Monorepo Pondok Roja.")
      .setVersion("1.0.0")
      .addBearerAuth(
        {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Masukkan token JWT akses Anda di sini",
        },
        "JWT-Auth",
      )
      .build()

    const rawDocument = SwaggerModule.createDocument(app, config)
    const document = cleanupOpenApiDoc(rawDocument)

    httpAdapter.get("/docs/openapi.json", (_req: Request, res: Response) => {
      res.json(document)
    })
  }

  await app.init()
}

export default async function handler(req: Request, res: Response) {
  if (!isInitialized) {
    await bootstrap()
    isInitialized = true
  }
  server(req, res)
}
