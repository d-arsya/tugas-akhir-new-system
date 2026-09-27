import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { OAuth2Client } from "google-auth-library"
import type { Env } from "@core/config/env.validation"

export type GoogleIdentity = {
	email: string
	name: string | null
}

@Injectable()
export class GoogleIdTokenService {
	private readonly client = new OAuth2Client()

	constructor(private readonly configService: ConfigService<Env, true>) {}

	clientId(): string | null {
		return this.configService.get("GOOGLE_OAUTH_CLIENT_ID", { infer: true })?.trim() || null
	}

	async verify(credential: string): Promise<GoogleIdentity> {
		const clientId = this.clientId()
		if (!clientId) {
			throw new NotFoundException("Login dengan Google belum diaktifkan.")
		}

		const payload = await this.client
			.verifyIdToken({ idToken: credential, audience: clientId })
			.then((ticket) => ticket.getPayload())
			.catch(() => undefined)

		if (!payload?.email || payload.email_verified !== true) {
			throw new UnauthorizedException("Login dengan Google gagal. Silakan coba lagi.")
		}

		return { email: payload.email.toLowerCase(), name: payload.name ?? null }
	}
}
