export type UserDomain = "admin" | "santri" | "merchant" | "psb"

export type JwtPayload = {
	sub: number
	email: string
	role: string
	domain: UserDomain
	tokenId?: string
}

export type TokenPair = {
	accessToken: string
	refreshToken: string
}

export type AuthUser = {
	id: number
	email: string
	name: string
	role: string
	domain: UserDomain
}

export type LoginDto = {
	email: string
	password: string
}

export type ForgotPasswordDto = {
	email: string
}

export type ResetPasswordDto = {
	token: string
	password: string
	passwordConfirmation: string
}

export type RefreshTokenDto = {
	refreshToken: string
}

export type TwoFactorDto = {
	code: string
}
