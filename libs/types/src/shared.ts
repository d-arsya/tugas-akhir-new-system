export type Province = {
	id: number
	name: string
}

export type Regency = {
	id: number
	provinceId: number
	name: string
}

export type District = {
	id: number
	regencyId: number
	name: string
}

export type SettingSchool = {
	id: number
	name: string
	address: string | null
	phone: string | null
	email: string | null
	logo: string | null
	website: string | null
}
