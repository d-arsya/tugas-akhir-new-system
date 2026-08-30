import { Module } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import type { Env } from "../config/env.validation"

@Module({
	imports: [
		TypeOrmModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (configService: ConfigService<Env, true>) => ({
				type: "postgres",
				url: configService.get("DATABASE_URL", { infer: true }),
				autoLoadEntities: true,
				synchronize: false, // NEVER true — schema owned by Laravel migrations
				logging: configService.get("NODE_ENV", { infer: true }) === "development",
				retryAttempts: 3,
				retryDelay: 2000,
				extra: {
					max: 20, // connection pool
					idleTimeoutMillis: 30000,
					connectionTimeoutMillis: 2000,
				},
			}),
		}),
	],
})
export class DatabaseModule {}
