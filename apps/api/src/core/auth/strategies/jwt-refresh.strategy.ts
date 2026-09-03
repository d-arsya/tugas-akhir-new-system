import { Injectable, UnauthorizedException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"
import { RedisService } from "../../redis/redis.service"
import type { Env } from "../../config/env.validation"
import type { JwtPayload } from "./jwt.strategy"

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
	constructor(
		configService: ConfigService<Env, true>,
		private readonly redisService: RedisService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				ExtractJwt.fromBodyField("refreshToken"),
				(req: any) => {
					if (req && req.cookies) {
						return req.cookies["refresh_token"] || null
					}
					return null
				},
			]),
			ignoreExpiration: false,
			secretOrKey: configService.get("JWT_REFRESH_SECRET", { infer: true }),
		})
	}

	async validate(payload: JwtPayload): Promise<JwtPayload> {
		if (!payload.sub || !payload.tokenId) {
			throw new UnauthorizedException("Invalid refresh token")
		}
		const isValid = await this.redisService.validateRefreshToken(payload.sub, payload.tokenId)
		if (!isValid) {
			throw new UnauthorizedException("Refresh token revoked or expired")
		}
		return payload
	}
}
