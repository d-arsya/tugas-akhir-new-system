import { CanActivate, ForbiddenException, Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

/**
 * Blocks irreversible endpoints unless `ALLOW_DESTRUCTIVE` is on.
 *
 * The Data Master delete and delegation routes rewrite or destroy rows across
 * `tbr_registrants`, `tbr_student_grades`, `tbr_alumnis`, `tbr_majors`, `tbr_grades`
 * and the level/academic-year pivot — and the schema carries **no foreign keys**, so
 * nothing at the database level would stop a mistake.
 *
 * During development and verification the flag stays off, so replaying a request
 * collection cannot delete a year; an engineer turns it on deliberately, in their own
 * `.env`, for the moment they need it. Production sets it to true.
 */
@Injectable()
export class DestructiveGuard implements CanActivate {
	constructor(private readonly configService: ConfigService) {}

	canActivate(): boolean {
		const allowed = this.configService.get<boolean>("ALLOW_DESTRUCTIVE")
		if (!allowed) {
			throw new ForbiddenException(
				"Aksi ini dinonaktifkan pada instance ini (ALLOW_DESTRUCTIVE tidak aktif).",
			)
		}
		return true
	}
}
