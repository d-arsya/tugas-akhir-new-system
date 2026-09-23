import type { ConfigService } from "@nestjs/config"
import type { Response } from "express"

const ACCESS_MAX_AGE = 15 * 60 * 1000
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000

const cookieOptions = (
	configService: ConfigService,
	maxAge: number,
): {
	httpOnly: true
	secure: boolean
	sameSite: "strict" | "lax"
	domain?: string
	maxAge: number
} => {
	const rawDomain = configService.get<string>("COOKIE_DOMAIN")?.trim().toLowerCase()
	const isProd = process.env["NODE_ENV"] === "production"

	return {
		httpOnly: true,
		secure: isProd,
		sameSite: isProd ? "strict" : "lax",
		...(rawDomain ? { domain: rawDomain } : {}),
		maxAge,
	}
}

/** Shared by login, 2FA verify, refresh and create-password, so every entry point sets the same cookies. */
export const setAuthCookies = (
	response: Response,
	configService: ConfigService,
	accessToken?: string,
	refreshToken?: string,
): void => {
	if (accessToken) {
		response.cookie("access_token", accessToken, cookieOptions(configService, ACCESS_MAX_AGE))
	}
	if (refreshToken) {
		response.cookie("refresh_token", refreshToken, cookieOptions(configService, REFRESH_MAX_AGE))
	}
}

export const clearAuthCookies = (response: Response, configService: ConfigService): void => {
	const rawDomain = configService.get<string>("COOKIE_DOMAIN")?.trim().toLowerCase()
	const options = rawDomain ? { domain: rawDomain } : undefined
	response.clearCookie("access_token", options)
	response.clearCookie("refresh_token", options)
}
