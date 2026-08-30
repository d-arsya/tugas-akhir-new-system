import { Module } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { JwtModule } from "@nestjs/jwt"
import { PassportModule } from "@nestjs/passport"
import { JwtStrategy } from "./strategies/jwt.strategy"
import { JwtRefreshStrategy } from "./strategies/jwt-refresh.strategy"
import { JwtAuthGuard } from "./guards/jwt-auth.guard"
import { RolesGuard } from "./guards/roles.guard"
import { IpBanGuard } from "./guards/ip-ban.guard"
import type { Env } from "../config/env.validation"

@Module({
	imports: [
		PassportModule.register({ defaultStrategy: "jwt" }),
		JwtModule.registerAsync({
			inject: [ConfigService],
			useFactory: (configService: ConfigService<Env, true>) => ({
				secret: configService.get("JWT_ACCESS_SECRET", { infer: true }),
				signOptions: {
					expiresIn: configService.get("JWT_ACCESS_EXPIRES", { infer: true }),
				},
			}),
		}),
	],
	providers: [JwtStrategy, JwtRefreshStrategy, JwtAuthGuard, RolesGuard, IpBanGuard],
	exports: [JwtModule, JwtAuthGuard, RolesGuard, IpBanGuard],
})
export class AuthModule {}
