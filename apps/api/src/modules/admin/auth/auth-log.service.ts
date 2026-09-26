import { Injectable } from "@nestjs/common"
import { DataSource } from "typeorm"

import { SqlParams } from "@admin/common/sql"
import { AUTH_LOG_FROM, AUTH_LOG_SELECT, authLogOrderBy, authLogWhere } from "@admin/auth/auth-log-sql"
import type { AuthLogQuery } from "@admin/auth/dto/auth-log.dto"

/** Every field arrives ready to render, like the legacy controller's row array. */
export type AuthLogRow = {
	id: number
	email: string | null
	browser: string
	os: string | null
	duration: string | null
	lastSeen: string
	lastLogin: string | null
	lastLogout: string | null
	loginStatus: string | null
}

export type AuthLogPage = {
	data: AuthLogRow[]
	meta: { page: number; limit: number; total: number; totalPages: number }
}

// Port of legacy `AuthLogController@list` (Authentication Log), paged in Postgres
@Injectable()
export class AuthLogService {
	constructor(private readonly dataSource: DataSource) {}

	async findAll(query: AuthLogQuery): Promise<AuthLogPage> {
		const params = new SqlParams()
		const where = authLogWhere(query.search, params)

		const counted = await this.dataSource.query<{ total: string }[]>(
			`SELECT COUNT(*) AS total ${AUTH_LOG_FROM} ${where}`,
			params.values,
		)
		const total = Number(counted[0]?.total ?? 0)

		const limit = params.add(query.limit)
		const offset = params.add((query.page - 1) * query.limit)
		const rows = await this.dataSource.query<AuthLogRow[]>(
			`${AUTH_LOG_SELECT} ${AUTH_LOG_FROM} ${where} ${authLogOrderBy(query)} LIMIT ${limit} OFFSET ${offset}`,
			params.values,
		)

		return {
			data: rows.map((row) => ({ ...row, id: Number(row.id) })),
			meta: {
				page: query.page,
				limit: query.limit,
				total,
				totalPages: Math.max(1, Math.ceil(total / query.limit)),
			},
		}
	}
}
