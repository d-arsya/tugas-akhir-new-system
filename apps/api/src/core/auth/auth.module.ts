import { Module } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { JwtModule } from "@nestjs/jwt"
import { PassportModule } from "@nestjs/passport"
import { JwtStrategy } from "@core/auth/strategies/jwt.strategy"
import { JwtRefreshStrategy } from "@core/auth/strategies/jwt-refresh.strategy"
import { JwtAuthGuard } from "@core/auth/guards/jwt-auth.guard"
import { RolesGuard } from "@core/auth/guards/roles.guard"
import { IpBanGuard } from "@core/auth/guards/ip-ban.guard"
import { GoogleConfigController } from "@core/auth/google/google-config.controller"
import { GoogleIdTokenService } from "@core/auth/google/google-id-token.service"
import type { Env } from "@core/config/env.validation"

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
	controllers: [GoogleConfigController],
	providers: [JwtStrategy, JwtRefreshStrategy, JwtAuthGuard, RolesGuard, IpBanGuard, GoogleIdTokenService],
	exports: [JwtModule, JwtAuthGuard, RolesGuard, IpBanGuard, GoogleIdTokenService],
})
export class AuthModule {}
