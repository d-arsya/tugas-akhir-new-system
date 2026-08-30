export type AdminRole = "superadmin" | "admin" | "bendahara" | "kasir_ewallet"

export type AdminUser = {
	id: number
	name: string
	email: string
	role: AdminRole
	isActive: boolean
	createdAt: string
	updatedAt: string
}

export type Grade = {
	id: number
	name: string
	levelId: number
	academicYearId: number
}

export type SubGrade = {
	id: number
	name: string
	gradeId: number
}

export type Major = {
	id: number
	name: string
}
