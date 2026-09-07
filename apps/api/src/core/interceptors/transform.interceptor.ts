import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from "@nestjs/common"
import { Observable, map } from "rxjs"

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
	intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
		return next.handle().pipe(
			map((res: any) => {
				if (res && typeof res === "object" && "data" in res && "meta" in res) {
					return {
						success: true as const,
						data: res.data,
						message: "OK",
						meta: res.meta,
					}
				}
				return {
					success: true as const,
					data: res,
					message: "OK",
				}
			}),
		)
	}
}
