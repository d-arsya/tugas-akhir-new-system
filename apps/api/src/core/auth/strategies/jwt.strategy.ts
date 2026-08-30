import { Injectable, UnauthorizedException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"
import type { Env } from "../../config/env.validation"

export type JwtPayload = {
	sub: number
	email: string
	role: string
	domain: "admin" | "santri" | "merchant" | "psb"
	tokenId?: string
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
	constructor(configService: ConfigService<Env, true>) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get("JWT_ACCESS_SECRET", { infer: true }),
		})
	}

	validate(payload: JwtPayload): JwtPayload {
		if (!payload.sub || !payload.email) {
			throw new UnauthorizedException("Invalid token payload")
		}
		return payload
	}
}
