import { z } from "zod"

export const EnvSchema = z.object({
	NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
	PORT: z.coerce.number().default(5000),
	APP_URL: z.string().url(),
	SANTRI_URL: z.string().url(),
	PSB_URL: z.string().url(),
	MERCHANT_URL: z.string().url(),
	ADMIN_URL: z.string().url(),
	DATABASE_URL: z.string().min(1),
	JWT_ACCESS_SECRET: z.string().min(16),
	JWT_REFRESH_SECRET: z.string().min(16),
	JWT_ACCESS_EXPIRES: z.string().default("15m"),
	JWT_REFRESH_EXPIRES: z.string().default("7d"),
	REDIS_URL: z.string().url(),
	AWS_REGION: z.string().optional(),
	AWS_ACCESS_KEY_ID: z.string().optional(),
	AWS_SECRET_ACCESS_KEY: z.string().optional(),
	AWS_S3_BUCKET: z.string().optional(),
	AWS_S3_URL: z.string().optional(),
	LEGACY_FILES_BASE_PATH: z.string().optional(),
	MAIL_HOST: z.string().default("smtp.gmail.com"),
	MAIL_PORT: z.coerce.number().default(587),
	MAIL_SECURE: z
		.preprocess((val) => {
			if (typeof val === "string") {
				const lower = val.toLowerCase().trim()
				return lower === "true" || lower === "1"
			}
			return Boolean(val)
		}, z.boolean())
		.optional(),
	MAIL_USER: z.string().optional(),
	MAIL_PASS: z.string().optional(),
	MAIL_FROM_NAME: z.string().default("Pondok Roja"),
	MAIL_FROM_ADDRESS: z.string().email().optional(),
})

export type Env = z.infer<typeof EnvSchema>
