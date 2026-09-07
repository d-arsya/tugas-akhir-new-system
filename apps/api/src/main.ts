import { Logger } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { cleanupOpenApiDoc, ZodValidationPipe } from "nestjs-zod"
import { Logger as PinoLogger } from "nestjs-pino"
import cookieParser from "cookie-parser"
import { AppModule } from "./app.module"
import { HttpExceptionFilter } from "@core/filters/http-exception.filter"
import { TransformInterceptor } from "@core/interceptors/transform.interceptor"
import type { Request, Response } from "express"

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule)

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
  app.useGlobalInterceptors(new TransformInterceptor())

  // CORS
  app.enableCors({
    origin: [
      process.env["PSB_URL"] ?? "http://localhost:4200", // default
      process.env["SANTRI_URL"] ?? "http://localhost:4201", // santri dev
      process.env["MERCHANT_URL"] ?? "http://localhost:4202", // merchant dev
      process.env["ADMIN_URL"] ?? "http://localhost:4203", // admin dev
    ],
    credentials: true,
  })

  const httpAdapter = app.getHttpAdapter()

  // Redirect root / to /docs
  httpAdapter.get("/", (_req: Request, res: Response) => {
    res.redirect("/docs")
  })

  // Scalar API docs styled with Roja Design System (DESIGN.md)
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

    httpAdapter.get("/docs", (_req: Request, res: Response) => {
      res.type("text/html").send(`
<!doctype html>
<html lang="id">
  <head>
    <title>Pondok Roja — API Documentation</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="icon" type="image/svg+xml" href="https://scalar.com/favicon.svg" />
    <style>
      :root {
        --scalar-font: 'Montserrat', sans-serif;
        --scalar-font-code: 'JetBrains Mono', monospace;
        --scalar-radius: 6px;
        --scalar-radius-md: 6px;
        --scalar-radius-lg: 8px;
        --scalar-radius-xl: 12px;
      }

      /* Roja Light Mode */
      .light-mode {
        --scalar-color-1: #4b4b4b;
        --scalar-color-2: #777777;
        --scalar-color-3: #abb4be;
        --scalar-color-accent: #e4007e;
        --scalar-background-1: #ffffff;
        --scalar-background-2: #fdfdfd;
        --scalar-background-3: #ecedf0;
        --scalar-background-accent: rgba(228, 0, 126, 0.08);
        --scalar-border-color: #eeeeee;
      }

      /* Roja Dark Mode */
      .dark-mode {
        --scalar-color-1: #ffffff;
        --scalar-color-2: #eeeeee;
        --scalar-color-3: #abb4be;
        --scalar-color-accent: #e4007e;
        --scalar-background-1: #111e2c;
        --scalar-background-2: #17283c;
        --scalar-background-3: #142335;
        --scalar-background-accent: rgba(228, 0, 126, 0.15);
        --scalar-border-color: rgba(255, 255, 255, 0.08);
      }

      /* Roja Persistent Dark Sidebar */
      .light-mode .t-doc__sidebar,
      .dark-mode .t-doc__sidebar,
      .light-mode .sidebar,
      .dark-mode .sidebar {
        --scalar-sidebar-background-1: #17283c;
        --scalar-sidebar-color-1: #ffffff;
        --scalar-sidebar-color-2: rgba(255, 255, 255, 0.75);
        --scalar-sidebar-color-active: #e4007e;
        --scalar-sidebar-item-hover-background: rgba(255, 255, 255, 0.08);
        --scalar-sidebar-item-hover-color: #ffffff;
        --scalar-sidebar-item-active-background: rgba(228, 0, 126, 0.15);
        --scalar-sidebar-border-color: rgba(255, 255, 255, 0.08);
        --scalar-sidebar-search-background: #111e2c;
        --scalar-sidebar-search-border-color: rgba(255, 255, 255, 0.1);
        --scalar-sidebar-search-color: #ffffff;
      }

      /* Custom Scrollbar */
      ::-webkit-scrollbar {
        width: 10px;
        height: 10px;
      }
      ::-webkit-scrollbar-track {
        background: #111e2c;
      }
      ::-webkit-scrollbar-thumb {
        background: #17283c;
        border-radius: 4px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: #27374a;
      }
    </style>
  </head>
  <body>
    <script
      id="api-reference"
      data-url="/docs/openapi.json"
      data-configuration='{"theme":"none","withDefaultFonts":false,"layout":"modern","hideModels":false}'></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>`)
    })
  }

  const port = process.env["PORT"] ?? 5000
  await app.listen(port)
  Logger.log(`🚀 API is running on: http://localhost:${port}/api`, "Bootstrap")
  if (process.env["NODE_ENV"] !== "production") {
    Logger.log(`📚 Docs: http://localhost:${port}/docs`, "Bootstrap")
  }
}

bootstrap()
