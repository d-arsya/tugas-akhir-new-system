export const TIMEZONE = "Asia/Jakarta"

export class SqlParams {
	readonly values: unknown[] = []

	add(value: unknown): string {
		this.values.push(value)
		return `$${this.values.length}`
	}
}

export const LOCAL_TIMESTAMP = (column: string): string =>
	`to_char(${column} AT TIME ZONE '${TIMEZONE}', 'YYYY-MM-DD"T"HH24:MI:SS')`

export const EPOCH_SECONDS = (column: string): string => `EXTRACT(EPOCH FROM ${column})::bigint`

export const localDate = (column: string): string => `(${column} AT TIME ZONE '${TIMEZONE}')::date`

export const truthy = (column: string): string => `(${column} IS NOT NULL AND ${column} <> '' AND ${column} <> '0')`
