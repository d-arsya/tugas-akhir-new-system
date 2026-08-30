export type RegistrantStatus =
	| "wait"
	| "invalid"
	| "fixed"
	| "approve"
	| "failed"
	| "indent_failed"

export type Registrant = {
	id: number
	registrantId: string
	fullName: string
	email: string
	emailVerifiedAt: string | null
	gender: "male" | "female"
	nationality: "wni" | "wna"
	dateOfBirth: string
	placeOfBirth: string
	approvalStatus: RegistrantStatus
	levelId: number | null
	academicYearId: number | null
	createdAt: string
	updatedAt: string
}

export type SettingForm = {
	id: number
	academicYearId: number
	isOpen: boolean
}

export type AcademicYear = {
	id: number
	year: string
	isActive: boolean
}

export type Level = {
	id: number
	name: string
}

export type WizardPersonalData = {
	fullName: string
	gender: "male" | "female"
	nationality: "wni" | "wna"
	dateOfBirth: string
	placeOfBirth: string
	address: string
	provinceId: number
	regencyId: number
	districtId: number
	rt: string
	rw: string
	postalCode: string
	phone: string
	liveWith: "parent" | "guardian" | "other"
	previousSchoolName: string
	previousSchoolProvinceId: number
	previousSchoolRegencyId: number
	previousSchoolDistrictId: number
}

export type WizardIdentityData = {
	nik: string
	familyCardNumber: string
	religion: string
	bloodType: string
	diseaseHistories: Array<{ name: string; status: string }>
}

export type WizardFamilyData = {
	fatherName: string
	fatherOccupation: string
	fatherIncome: number
	motherName: string
	motherOccupation: string
	motherIncome: number
	numberOfSiblings: number
	childOrder: number
	familyStatus: "complete" | "single_parent" | "orphan"
}

export type WizardGuardianData = {
	guardianName: string
	guardianRelationship: string
	guardianOccupation: string
	guardianPhone: string
	guardianAddress: string
	guardianProvinceId: number
	guardianRegencyId: number
	guardianDistrictId: number
}
