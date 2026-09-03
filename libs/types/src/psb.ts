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
	createdAt: string
	updatedAt: string | null
	year: string
	activeKbm: string
	note: string
	serialNumber: string
	type: "reguler" | string
	status: boolean
	costDateStart: string
	costDateEnd: string
	isCurrent: boolean
}

export type Level = {
	id: number
	name: string
}

export type WizardPersonalData = {
	fullName: string
	shortName?: string | undefined
	religion: string
	gender: "male" | "female"
	placeOfBirth: string
	dateOfBirth: string
	nationality: "wni" | "wna"
	liveWith: "parent" | "guardian" | "other"
	siblingOrder?: number | undefined
	numberOfSiblings?: number | undefined
	parentStatus?: "complete" | "single_parent" | "orphan" | undefined
	childStatus?: string | undefined
	phone: string
	provinceId: number
	regencyId: number
	districtId: number
	village?: string | undefined
	street?: string | undefined
	rt: string
	rw: string
	subVillage?: string | undefined
	postalCode: string
	address: string
	nisn?: string | undefined
	nik?: string | undefined
	ksp?: string | undefined
	kip?: string | undefined
	certificateNumber?: string | undefined
	previousSchoolName: string
	previousSchoolPhone?: string | undefined
	previousSchoolProvinceId: number
	previousSchoolRegencyId: number
	previousSchoolDistrictId: number
	previousSchoolAddressDetail?: string | undefined
	previousSchoolPostalCode?: string | undefined
}

export type WizardIdentityData = {
	weight?: number | undefined
	height?: number | undefined
	bloodType?: string | undefined
	visualCondition?: "normal" | "abnormal" | undefined
	hearingCondition?: "normal" | "abnormal" | undefined
	immunizationGiven?: "complete" | "incomplete" | "not_at_all" | undefined
	diseaseHistories?: Array<{ name: string; status: string }> | undefined
	learningAchievment?: string | undefined
	reading?: "jilid" | "quran" | undefined
	jilidChapter?: string | undefined
	quranMemorizing?: string | undefined
	gift?: string | undefined
}

export type WizardFamilyData = {
	fatherName: string
	fatherReligion?: string | undefined
	fatherNationality?: string | undefined
	fatherLastEducation?: string | undefined
	fatherOccupation: string
	fatherIncome: number
	fatherPhone?: string | undefined
	fatherStatus?: "hidup" | "wafat" | undefined
	motherName: string
	motherReligion?: string | undefined
	motherNationality?: string | undefined
	motherLastEducation?: string | undefined
	motherOccupation: string
	motherIncome: number
	motherPhone?: string | undefined
	motherStatus?: "hidup" | "wafat" | undefined
	numberOfSiblings: number
	childOrder: number
	familyStatus: "complete" | "single_parent" | "orphan"
	familyProvinceId?: number | undefined
	familyRegencyId?: number | undefined
	familyDistrictId?: number | undefined
	familyVillage?: string | undefined
	familyStreet?: string | undefined
	familyRt?: string | undefined
	familyRw?: string | undefined
	familySubVillage?: string | undefined
}

export type WizardGuardianData = {
	guardianName: string
	guardianReligion?: string | undefined
	guardianNationality?: string | undefined
	guardianLastEducation?: string | undefined
	guardianRelationship: string
	guardianOccupation: string
	guardianIncome?: number | undefined
	guardianPhone: string
	guardianAddress: string
	guardianProvinceId: number
	guardianRegencyId: number
	guardianDistrictId: number
	guardianVillage?: string | undefined
	guardianStreet?: string | undefined
	guardianRt?: string | undefined
	guardianRw?: string | undefined
	guardianSubVillage?: string | undefined
}

export type WizardAttachmentData = {
	ijazah?: string | undefined
	photo?: string | undefined
	kk?: string | undefined
	birthCert?: string | undefined
	ksp?: string | undefined
	kip?: string | undefined
	reportCard?: string | undefined
}
