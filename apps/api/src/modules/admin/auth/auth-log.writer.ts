import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { IsNull, Not, Repository } from "typeorm"

import { AuthLog, type LoginStatus } from "@admin/auth/entities/auth-log.entity"

export type OpenAuthLog = {
	userId: number | null
	email: string | null
	ipAddress: string
	userAgent?: string | undefined
	sessionId?: string | undefined
	rememberMe?: boolean | undefined
	status: LoginStatus
}

// Legacy `LogSuccessfulLogin`: preg_split('/\s*[;)(]\s*/', $userAgent)[2] ?? null
// e.g. Windows -> "Win64", macOS -> "Intel Mac OS X 10_15_7", Android -> "Android 10"
export const parseOs = (userAgent?: string | null): string | null => {
	if (!userAgent) return null
	const parts = userAgent.split(/\s*[;)(]\s*/)
	return parts[2] ?? null
}

const UNITS: [seconds: number, label: string][] = [
	[604800, "minggu"],
	[86400, "hari"],
	[3600, "jam"],
	[60, "menit"],
	[1, "detik"],
]

/**
 * Port of Carbon `(string) $login_at->diffAsCarbonInterval()` with locale `id`:
 * calendar years and months first, then the remainder as weeks, days, hours, minutes and seconds,
 * with empty parts left out ("2 minggu 1 hari 21 jam 46 menit 41 detik").
 */
export const durationForHumans = (from: Date, to: Date): string => {
	const start = from <= to ? from : to
	const end = from <= to ? to : from

	let months =
		(end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
	const anchor = new Date(start)
	anchor.setMonth(anchor.getMonth() + months)
	if (anchor > end) {
		months -= 1
		anchor.setMonth(anchor.getMonth() - 1)
	}

	const parts: string[] = []
	const years = Math.floor(months / 12)
	if (years > 0) parts.push(`${years} tahun`)
	if (months % 12 > 0) parts.push(`${months % 12} bulan`)

	let rest = Math.floor((end.getTime() - anchor.getTime()) / 1000)
	for (const [seconds, label] of UNITS) {
		const value = Math.floor(rest / seconds)
		if (value > 0) parts.push(`${value} ${label}`)
		rest -= value * seconds
	}

	return parts.length > 0 ? parts.join(" ") : "0 detik"
}

/**
 * Writes the `tbr_auth_logs` rows the Authentication Log page reads, following the legacy
 * listeners (`LogSuccessfulLogin`, `LogFailedLogin`, `LogSuccessfulLogout`).
 */
@Injectable()
export class AuthLogWriter {
	constructor(
		@InjectRepository(AuthLog)
		private readonly authLogRepository: Repository<AuthLog>,
	) {}

	async open(entry: OpenAuthLog): Promise<AuthLog | null> {
		try {
			return await this.authLogRepository.save(
				this.authLogRepository.create({
					userId: entry.userId,
					// Legacy stores "-" when a failed login uses an email that does not exist
					email: entry.email,
					rememberMe: entry.rememberMe ? "1" : "0",
					ipAddress: entry.ipAddress,
					sessionId: entry.sessionId ?? null,
					guard: "web",
					userAgent: entry.userAgent ?? null,
					os: parseOs(entry.userAgent),
					loginAt: entry.status === "Logged In" ? new Date() : null,
					logoutAt: null,
					loginStatus: entry.status,
				}),
			)
		} catch (error: unknown) {
			// A login must not fail because its log row could not be written
			console.error("[AuthLog open]", error)
			return null
		}
	}

	/** Legacy logout updates the row of the current session instead of inserting a new one. */
	async close(sessionId: string | undefined, userId: number): Promise<void> {
		try {
			const log = sessionId
				? await this.authLogRepository.findOne({
						where: { sessionId, loginStatus: "Logged In" },
						order: { id: "DESC" },
					})
				: await this.authLogRepository.findOne({
						where: { userId, loginStatus: "Logged In", loginAt: Not(IsNull()) },
						order: { id: "DESC" },
					})
			if (!log) return

			const loggedOutAt = new Date()
			log.logoutAt = loggedOutAt
			log.duration = log.loginAt ? durationForHumans(log.loginAt, loggedOutAt) : null
			log.loginStatus = "Logged Out"
			await this.authLogRepository.save(log)
		} catch (error: unknown) {
			console.error("[AuthLog close]", error)
		}
	}

	/** The access token id is the session id, so a refresh has to carry it over to the open row. */
	async rotateSession(previousSessionId: string | undefined, sessionId: string): Promise<void> {
		if (!previousSessionId) return
		try {
			await this.authLogRepository.update(
				{ sessionId: previousSessionId, loginStatus: "Logged In" },
				{ sessionId },
			)
		} catch (error: unknown) {
			console.error("[AuthLog rotate]", error)
		}
	}
}
