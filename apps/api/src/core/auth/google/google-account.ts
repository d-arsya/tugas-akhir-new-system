import { ConflictException, UnauthorizedException } from "@nestjs/common"

export const singleGoogleAccount = <T>(rows: T[], notFoundMessage: string): T => {
	const [account, ...others] = rows
	if (!account) {
		throw new UnauthorizedException(notFoundMessage)
	}
	if (others.length > 0) {
		throw new ConflictException("Email ini terhubung ke lebih dari satu akun. Silakan hubungi admin.")
	}
	return account
}
