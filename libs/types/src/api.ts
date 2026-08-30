export type ApiResponse<T> = {
	success: true
	data: T
	message: string
}

export type ApiError = {
	success: false
	message: string
	errors?: Record<string, string[]>
}

export type PaginatedResponse<T> = {
	success: true
	data: {
		items: T[]
		total: number
		page: number
		limit: number
		lastPage: number
	}
	message: string
}

export type PaginationParams = {
	page?: number
	limit?: number
	search?: string
}
