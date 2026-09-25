import { BadRequestException, Injectable, NotFoundException, type PipeTransform } from "@nestjs/common"

/**
 * `ParseIntPipe` for the Dompet ids. A route id that is not a number is a 400, as before; one too
 * large to be a real row (past `Number.MAX_SAFE_INTEGER`, and eventually past `bigint`, where
 * Postgres raises "out of range" and the request became a 500) is a 404, which is what legacy's
 * route-model binding answered.
 */
@Injectable()
export class EwalletIdPipe implements PipeTransform<string, number> {
	transform(value: string): number {
		if (!/^\d+$/.test(value)) throw new BadRequestException("Validation failed (numeric string is expected)")
		const id = Number(value)
		if (!Number.isSafeInteger(id)) throw new NotFoundException("Data tidak ditemukan.")
		return id
	}
}
