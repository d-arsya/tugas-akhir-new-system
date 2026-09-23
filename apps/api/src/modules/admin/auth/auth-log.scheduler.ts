import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Cron, CronExpression } from "@nestjs/schedule"
import { InjectRepository } from "@nestjs/typeorm"
import { IsNull, LessThanOrEqual, Repository } from "typeorm"

import { AuthLog } from "@admin/entities/auth-log.entity"
import { durationForHumans } from "@admin/auth/auth-log.writer"
import type { Env } from "@core/config/env.validation"

// Legacy `App\Console\Commands\SetStatusToLogout` (`auth_log:logout`, scheduled `everyMinute`):
// sessions opened before today are closed, unless the login asked to be remembered.
@Injectable()
export class AuthLogScheduler {
	private readonly logger = new Logger(AuthLogScheduler.name)

	constructor(
		@InjectRepository(AuthLog)
		private readonly authLogRepository: Repository<AuthLog>,
		private readonly configService: ConfigService<Env, true>,
	) {}

	@Cron(CronExpression.EVERY_MINUTE)
	async closeStaleSessions(): Promise<void> {
		if (!this.configService.get("SCHEDULER_ENABLED", { infer: true })) return

		const startOfDay = new Date()
		startOfDay.setHours(0, 0, 0, 0)

		try {
			const logs = await this.authLogRepository.find({
				where: [
					{ loginAt: LessThanOrEqual(startOfDay), loginStatus: "Logged In", rememberMe: "0" },
					{ loginAt: LessThanOrEqual(startOfDay), loginStatus: "Logged In", rememberMe: IsNull() },
				],
			})
			if (logs.length === 0) return

			const loggedOutAt = new Date()
			for (const log of logs) {
				log.duration = log.loginAt ? durationForHumans(log.loginAt, loggedOutAt) : null
				log.loginStatus = "Logged Out"
				log.logoutAt = loggedOutAt
			}
			await this.authLogRepository.save(logs)
			this.logger.log(`Menutup ${logs.length} sesi auth-log yang masih terbuka`)
		} catch (error: unknown) {
			// A cron failure must not take the process down
			this.logger.error("Gagal menutup sesi auth-log", error)
		}
	}
}
