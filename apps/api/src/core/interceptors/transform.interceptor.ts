import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { Observable, map } from "rxjs"
import { RESPONSE_MESSAGE_KEY } from "@core/decorators/response-message.decorator"

export type PaginationMeta = {
	page: number
	limit: number
	total: number
	totalPages: number
}

export type ApiResponse<T> = {
	success: true
	data: T
	message: string
	meta?: PaginationMeta
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
	constructor(private readonly reflector?: Reflector) {}

	intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
		const metadataMessage = this.reflector?.getAllAndOverride<string>(RESPONSE_MESSAGE_KEY, [
			context.getHandler(),
			context.getClass(),
		])

		return next.handle().pipe(
			map((res: any) => {
				if (res === null || res === undefined) {
					return {
						success: true as const,
						data: null as unknown as T,
						message: metadataMessage || "Operasi berhasil",
					}
				}

				if (typeof res === "object" && "data" in res && "meta" in res) {
					return {
						success: true as const,
						data: res.data,
						message: res.message || metadataMessage || "Data berhasil dimuat",
						meta: res.meta,
					}
				}



				if (typeof res === "object" && "message" in res) {
					return {
						success: true as const,
						data: res,
						message: res.message || metadataMessage || "Operasi berhasil",
					}
				}

				return {
					success: true as const,
					data: res,
					message: metadataMessage || "Operasi berhasil",
				}
			}),
		)
	}
}
