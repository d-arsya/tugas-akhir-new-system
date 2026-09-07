import { Module } from "@nestjs/common"
import { ConfigModule as NestConfigModule } from "@nestjs/config"
import { EnvSchema } from "@core/config/env.validation"

@Module({
	imports: [
		NestConfigModule.forRoot({
			isGlobal: true,
			envFilePath: ["apps/api/.env", "apps/api/.env.local", ".env", ".env.local"],
			validate: (config: Record<string, unknown>) => {
				const result = EnvSchema.safeParse(config)
				if (!result.success) {
					throw new Error(`Environment validation failed: ${result.error.message}`)
				}
				return result.data
			},
		}),
	],
})
export class ConfigModule { }
