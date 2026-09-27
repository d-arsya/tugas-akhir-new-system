import type { AxiosInstance } from "axios"
import type {
	Province,
	Regency,
	District,
	Registrant,
	RegistrantStatus,
	WizardPersonalData,
	WizardIdentityData,
	WizardFamilyData,
	WizardGuardianData,
	AuthUser,
	TokenPair,
	ApiResponse,
	AcademicYear,
} from "@roja/types"

type SuccessResponse = {
	registrantId: string
	fullName: string
	email: string
}

type DashboardData = {
	registrant: Registrant & {
		dataValidation: "valid" | "invalid" | "fixed"
		dataValidationNote: string
	}
	announcement: any
	statusInfo?: {
		status: string
		label: string
		description: string | null
	}
}

export type PsbApi = {
	getLanding: () => Promise<{ academicYear: AcademicYear; schoolName: string; levels: Array<{ id: number; name: string }>; formSettings?: any[] }>
	checkEmail: (data: { email: string; levelId: number }) => Promise<{ sessionId: string }>
	getWizardStep: (step: string, sessionId: string) => Promise<unknown>
	saveWizardStep: (step: string, sessionId: string, data: unknown) => Promise<{ success: boolean }>
	submitAttachment: (sessionId: string, files: Record<string, any>) => Promise<{ tokens: TokenPair; user: AuthUser; registrantId: string }>
	getSuccess: (id: number) => Promise<SuccessResponse>
	getPrintProof: (type: string, id: number) => Promise<any>
	login: (data: { email: string; password: string }) => Promise<PsbLoginResult>
	loginWithGoogle: (credential: string) => Promise<PsbLoginResult>
	verify2fa: (data: { email: string; code: string }) => Promise<{ tokens: TokenPair; user: AuthUser }>
	resend2fa: (email: string) => Promise<{ message: string }>
	refreshToken: () => Promise<{ success: boolean }>
	logout: () => Promise<{ success: boolean }>
	forgotPassword: (email: string, clientUrl?: string) => Promise<{ success: boolean }>
	resetPassword: (data: { token: string; password: string; passwordConfirmation: string; email: string }) => Promise<{ success: boolean }>
	verifyEmail: (token: string, email?: string) => Promise<{ message: string }>
	resendVerification: (email: string, clientUrl?: string) => Promise<{ message: string }>
	getDashboard: () => Promise<DashboardData>
	getInvalidData: () => Promise<unknown>
	updateInvalidStep: (step: string, data: unknown) => Promise<{ success: boolean }>
	updateInvalidAttachment: (files: Record<string, any>) => Promise<{ success: boolean }>
	getProfile: () => Promise<AuthUser & { enabled2fa: boolean }>
	updateProfile: (data: { name: string }) => Promise<{ success: boolean }>
	updateAccount: (data: { password: string }) => Promise<{ success: boolean }>
	toggle2fa: (enabled: boolean) => Promise<{ success: boolean }>
}

// Helper converters for Casing and naming adaptations between Frontend (camelCase) and Backend DTOs
const toTitleCase = (str?: string) => {
	if (!str) return ""
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

const mapParentStatusToBackend = (val?: string) => {
	if (!val) return undefined
	if (val === "complete") return "father&mother"
	if (val === "orphan") return "orphan"
	if (val === "single_parent") return "fatherless"
	return val as any
}

const mapParentStatusToFrontend = (val?: string) => {
	if (!val) return undefined
	if (val === "father&mother") return "complete"
	if (val === "orphan") return "orphan"
	if (val === "fatherless" || val === "motherless") return "single_parent"
	return val as any
}

const mapChildStatusToBackend = (val?: string) => {
	if (!val) return undefined
	if (val === "kandung") return "biological_child"
	if (val === "tiri") return "step_child"
	if (val === "angkat") return "adopted_child"
	return val as any
}

const mapChildStatusToFrontend = (val?: string) => {
	if (!val) return undefined
	if (val === "biological_child") return "kandung"
	if (val === "step_child") return "tiri"
	if (val === "adopted_child") return "angkat"
	return val as any
}

const mapPersonalToBackend = (data: WizardPersonalData): any => ({
	fullname: data.fullName,
	shortname: data.shortName,
	religion: data.religion?.toLowerCase() as any,
	gender: data.gender,
	placeOfBirth: data.placeOfBirth,
	dateOfBirth: data.dateOfBirth,
	nationality: data.nationality,
	liveWith: data.liveWith === "other" ? "guardian" : data.liveWith,
	siblingOrder: data.siblingOrder,
	numberOfSibling: data.numberOfSiblings,
	parentStatus: mapParentStatusToBackend(data.parentStatus),
	childStatus: mapChildStatusToBackend(data.childStatus),
	phone: data.phone,
	nik: data.nik,
	nisn: data.nisn,
	ksp: data.ksp,
	kip: data.kip,
	certificateNumber: data.certificateNumber,
	provinceId: data.provinceId,
	regencyId: data.regencyId,
	districtId: data.districtId,
	village: data.village,
	subVillage: data.subVillage,
	rt: data.rt,
	rw: data.rw,
	street: data.street,
	address: data.address,
	postalCode: data.postalCode,
	schoolName: data.previousSchoolName,
	schoolPhone: data.previousSchoolPhone,
	schoolProvinceId: data.previousSchoolProvinceId,
	schoolRegencyId: data.previousSchoolRegencyId,
	schoolDistrictId: data.previousSchoolDistrictId,
	schoolAddressDetail: data.previousSchoolAddressDetail,
	schoolPostalCode: data.previousSchoolPostalCode ? parseInt(data.previousSchoolPostalCode) : undefined,
})

const mapPersonalToFrontend = (data: any): WizardPersonalData => ({
	fullName: data.fullname || "",
	shortName: data.shortname || "",
	religion: data.religion ? (data.religion.charAt(0).toUpperCase() + data.religion.slice(1).toLowerCase()) : "Islam",
	gender: data.gender || "male",
	placeOfBirth: data.placeOfBirth || "",
	dateOfBirth: data.dateOfBirth || "",
	nationality: data.nationality ? data.nationality.toLowerCase() : "wni",
	liveWith: data.liveWith || "parent",
	siblingOrder: data.siblingOrder ? Number(data.siblingOrder) : 1,
	numberOfSiblings: data.numberOfSibling ? Number(data.numberOfSibling) : 0,
	parentStatus: mapParentStatusToFrontend(data.parentStatus),
	childStatus: mapChildStatusToFrontend(data.childStatus),
	phone: data.phone || "",
	nik: data.nik || "",
	nisn: data.nisn || "",
	ksp: data.ksp || "",
	kip: data.kip || "",
	certificateNumber: data.certificateNumber || "",
	provinceId: Number(data.provinceId) || 0,
	regencyId: Number(data.regencyId) || 0,
	districtId: Number(data.districtId) || 0,
	village: data.village || "",
	subVillage: data.subVillage || "",
	rt: data.rt || "",
	rw: data.rw || "",
	street: data.street || "",
	postalCode: data.postalCode?.toString() || "",
	address: data.street || data.address || "",
	previousSchoolName: data.schoolName || "",
	previousSchoolPhone: data.schoolPhone || "",
	previousSchoolProvinceId: Number(data.schoolProvinceId) || 0,
	previousSchoolRegencyId: Number(data.schoolRegencyId) || 0,
	previousSchoolDistrictId: Number(data.schoolDistrictId) || 0,
	previousSchoolAddressDetail: data.schoolAddressDetail || "",
	previousSchoolPostalCode: data.schoolPostalCode?.toString() || "",
})

const mapIdentityToBackend = (data: WizardIdentityData & Record<string, any>): any => ({
	nik: data.nik,
	nisn: data.nisn,
	kip: data.kip,
	ksp: data.ksp,
	certificateNumber: data.certificateNumber,
	weight: data.weight,
	height: data.height,
	bloodType: data.bloodType?.toLowerCase() as any,
	visualCondition: data.visualCondition,
	hearingCondition: data.hearingCondition,
	immunizationGiven: data.immunizationGiven,
	reading: data.reading,
	jilidChapter: data.jilidChapter,
	quranMemorizing: data.quranMemorizing,
	learningAchievement: data.learningAchievment,
	gift: data.gift,
	diseases: data.diseaseHistories?.map((item) => ({
		diseaseName: item.name,
		diseaseStatus: item.status === "Sembuh" ? "sembuh" : item.status === "Masa Perawatan" ? "masa perawatan" : "belum sembuh",
	})),
})

const mapIdentityToFrontend = (data: any, diseases: any[] = []): WizardIdentityData & Record<string, any> => ({
	nik: data.nik || "",
	nisn: data.nisn || "",
	kip: data.kip || "",
	ksp: data.ksp || "",
	certificateNumber: data.certificateNumber || "",
	weight: data.weight ? Number(data.weight) : undefined,
	height: data.height ? Number(data.height) : undefined,
	bloodType: data.bloodType ? data.bloodType.toUpperCase() : "A",
	visualCondition: data.visualCondition || "normal",
	hearingCondition: data.hearingCondition || "normal",
	immunizationGiven: data.immunizationGiven || "complete",
	diseaseHistories: (diseases || data.diseases || []).map((item: any) => ({
		name: item.diseaseName || item.name || "",
		status: item.diseaseStatus === "sembuh" ? "Sembuh" : item.diseaseStatus === "masa perawatan" ? "Masa Perawatan" : "Belum Sembuh",
	})),
	learningAchievment: data.learningAchievement || "",
	reading: data.reading || "quran",
	jilidChapter: data.jilidChapter || "",
	quranMemorizing: data.quranMemorizing || "",
	gift: data.gift || "",
})

const mapFamilyToBackend = (data: WizardFamilyData): any => ({
	fatherFullname: data.fatherName,
	fatherReligion: data.fatherReligion?.toLowerCase() as any,
	fatherNationality: data.fatherNationality,
	fatherLastEducation: data.fatherLastEducation?.toLowerCase() as any,
	fatherPhone: data.fatherPhone,
	fatherWhatsapp: data.fatherPhone,
	fatherJob: data.fatherOccupation,
	motherFullname: data.motherName,
	motherReligion: data.motherReligion?.toLowerCase() as any,
	motherNationality: data.motherNationality,
	motherLastEducation: data.motherLastEducation?.toLowerCase() as any,
	motherPhone: data.motherPhone,
	motherWhatsapp: data.motherPhone,
	motherJob: data.motherOccupation,
	familyProvinceId: data.familyProvinceId,
	familyRegencyId: data.familyRegencyId,
	familyDistrictId: data.familyDistrictId,
	familyVillage: data.familyVillage,
	familySubVillage: data.familySubVillage,
	familyRt: data.familyRt,
	familyRw: data.familyRw,
	familyStreet: data.familyStreet,
})

const mapFamilyToFrontend = (data: any): WizardFamilyData => ({
	fatherName: data.fatherFullname || "",
	fatherReligion: data.fatherReligion ? (data.fatherReligion.charAt(0).toUpperCase() + data.fatherReligion.slice(1).toLowerCase()) : "Islam",
	fatherNationality: data.fatherNationality || "wni",
	fatherLastEducation: data.fatherLastEducation ? data.fatherLastEducation.toLowerCase() : "sma",
	fatherOccupation: data.fatherJob || "",
	fatherIncome: 0,
	fatherPhone: data.fatherPhone || "",
	fatherStatus: "hidup",
	motherName: data.motherFullname || "",
	motherReligion: data.motherReligion ? (data.motherReligion.charAt(0).toUpperCase() + data.motherReligion.slice(1).toLowerCase()) : "Islam",
	motherNationality: data.motherNationality || "wni",
	motherLastEducation: data.motherLastEducation ? data.motherLastEducation.toLowerCase() : "sma",
	motherOccupation: data.motherJob || "",
	motherIncome: 0,
	motherPhone: data.motherPhone || "",
	motherStatus: "hidup",
	numberOfSiblings: data.numberOfSibling ? Number(data.numberOfSibling) : 0,
	childOrder: data.siblingOrder ? Number(data.siblingOrder) : 1,
	familyStatus: mapParentStatusToFrontend(data.parentStatus) || "complete",
	familyProvinceId: Number(data.familyProvinceId) || 0,
	familyRegencyId: Number(data.familyRegencyId) || 0,
	familyDistrictId: Number(data.familyDistrictId) || 0,
	familyVillage: data.familyVillage || "",
	familyStreet: data.familyStreet || "",
	familyRt: data.familyRt || "",
	familyRw: data.familyRw || "",
	familySubVillage: data.familySubVillage || "",
})

const mapGuardianToBackend = (data: WizardGuardianData): any => ({
	guardianFullname: data.guardianName,
	guardianReligion: data.guardianReligion?.toLowerCase() as any,
	guardianNationality: data.guardianNationality,
	guardianLastEducation: data.guardianLastEducation?.toLowerCase() as any,
	guardianPhone: data.guardianPhone,
	guardianWhatsapp: data.guardianPhone,
	guardianJob: data.guardianOccupation,
	guardianProvinceId: data.guardianProvinceId,
	guardianRegencyId: data.guardianRegencyId,
	guardianDistrictId: data.guardianDistrictId,
	guardianVillage: data.guardianVillage,
	guardianSubVillage: data.guardianSubVillage,
	guardianRt: data.guardianRt,
	guardianRw: data.guardianRw,
	guardianStreet: data.guardianStreet,
})

const mapGuardianToFrontend = (data: any): WizardGuardianData => ({
	guardianName: data.guardianFullname || "",
	guardianReligion: data.guardianReligion ? (data.guardianReligion.charAt(0).toUpperCase() + data.guardianReligion.slice(1).toLowerCase()) : "Islam",
	guardianNationality: data.guardianNationality || "wni",
	guardianLastEducation: data.guardianLastEducation ? data.guardianLastEducation.toLowerCase() : "sma",
	guardianRelationship: "",
	guardianOccupation: data.guardianJob || "",
	guardianIncome: 0,
	guardianPhone: data.guardianPhone || "",
	guardianAddress: data.guardianStreet || "",
	guardianProvinceId: Number(data.guardianProvinceId) || 0,
	guardianRegencyId: Number(data.guardianRegencyId) || 0,
	guardianDistrictId: Number(data.guardianDistrictId) || 0,
	guardianVillage: data.guardianVillage || "",
	guardianStreet: data.guardianStreet || "",
	guardianRt: data.guardianRt || "",
	guardianRw: data.guardianRw || "",
	guardianSubVillage: data.guardianSubVillage || "",
})

export type PsbLoginResult =
	| { requires2fa: true; email: string }
	| { requires2fa: false; tokens: TokenPair; user: AuthUser }

type PsbLoginBody = {
	requires2fa?: boolean
	email?: string
	accessToken: string
	refreshToken: string
	user?: {
		id: number
		email: string
		fullname?: string | null
		name?: string
		role?: string
		domain?: AuthUser["domain"]
	}
}

const toPsbLoginResult = (body: PsbLoginBody, fallbackEmail: string): PsbLoginResult => {
	if (body.requires2fa || !body.user) {
		return { requires2fa: true, email: body.email || fallbackEmail }
	}

	return {
		requires2fa: false,
		tokens: { accessToken: body.accessToken, refreshToken: body.refreshToken },
		user: {
			id: body.user.id,
			email: body.user.email,
			name: body.user.fullname || body.user.name || "",
			role: body.user.role || "registrant",
			domain: body.user.domain || "psb",
		},
	}
}

export const createPsbApi = (client: AxiosInstance): PsbApi => ({
	getLanding: async (): Promise<{ academicYear: AcademicYear, isOpen: boolean; schoolName: string; levels: Array<{ id: number; name: string }>; formSettings?: any[] }> => {
		const { data } = await client.get<ApiResponse<any>>("/psb/register/landing")
		return {
			academicYear: data.data.academicYear,
			isOpen: data.data.isOpen,
			schoolName: data.data.school?.schoolName || "Pondok Roja",
			levels: data.data.levels.map((l: any) => ({
				id: l.id,
				name: l.name,
			})),
			formSettings: data.data.formSettings,
		}
	},

	checkEmail: async (data: { email: string; levelId: number }): Promise<{ sessionId: string }> => {
		const { data: res } = await client.post<ApiResponse<{ sessionId: string }>>("/psb/register/check-email", data)
		return {
			sessionId: res.data.sessionId,
		}
	},

	getWizardStep: async (step: string, sessionId: string): Promise<unknown> => {
		const { data } = await client.get<ApiResponse<any>>("/psb/register/wizard-state", {
			headers: { "x-session-id": sessionId },
		})
		if (data && (data as any).success === false) {
			throw new Error(data.message || "Sesi pendaftaran Anda telah berakhir (kadaluarsa). Silakan mulai kembali.")
		}
		const state = data.data || {}
		if (step === "personal") return mapPersonalToFrontend(state.personal || {})
		if (step === "identity") return mapIdentityToFrontend(state.identity || {}, state.identity?.diseases || [])
		if (step === "family") return mapFamilyToFrontend(state.family || {})
		if (step === "guardian") return mapGuardianToFrontend(state.guardian || {})
		return {}
	},

	saveWizardStep: async (step: string, sessionId: string, data: unknown): Promise<{ success: boolean }> => {
		let payload = data
		if (step === "personal") payload = mapPersonalToBackend(data as WizardPersonalData)
		if (step === "identity") payload = mapIdentityToBackend(data as WizardIdentityData)
		if (step === "family") payload = mapFamilyToBackend(data as WizardFamilyData)
		if (step === "guardian") payload = mapGuardianToBackend(data as WizardGuardianData)

		const { data: res } = await client.post<ApiResponse<any>>(`/psb/register/${step}`, payload, {
			headers: { "x-session-id": sessionId },
		})
		if (res && (res as any).success === false) {
			throw new Error(res.message || "Sesi pendaftaran Anda telah berakhir (kadaluarsa). Silakan mulai kembali.")
		}
		return { success: res.success }
	},

	submitAttachment: async (
		sessionId: string,
		files: Record<string, any>,
	): Promise<{ tokens: TokenPair; user: AuthUser; registrantId: string }> => {
		const formData = new FormData()

		// Map frontend attachment keys to backend Express/Multer file interceptor keys
		if (files["ijazah"]) formData.append("attachCertificate", files["ijazah"])
		if (files["photo"]) formData.append("attachPhoto", files["photo"])
		if (files["kk"]) formData.append("attachFamilyCard", files["kk"])
		if (files["birthCert"]) formData.append("attachBirthCertificate", files["birthCert"])
		if (files["ksp"]) formData.append("attachKsp", files["ksp"])
		if (files["kip"]) formData.append("attachKip", files["kip"])
		if (files["reportCard"]) formData.append("attachReportCard", files["reportCard"])

		const { data: res } = await client.post<ApiResponse<any>>("/psb/register/attachment", formData, {
			headers: {
				"x-session-id": sessionId,
				"Content-Type": "multipart/form-data",
			},
		})

		const authData = res.data.auth
		const registrant = res.data.registrant

		const user: AuthUser = {
			id: registrant.id,
			email: registrant.email,
			name: registrant.fullname,
			role: registrant.role || authData?.user?.role || "registrant",
			domain: registrant.domain || authData?.user?.domain || "psb",
		}

		return {
			tokens: {
				accessToken: authData.accessToken,
				refreshToken: authData.refreshToken,
			},
			user,
			registrantId: res.data.registrantId,
		}
	},

	getSuccess: async (id: number): Promise<SuccessResponse> => {
		const { data } = await client.get<ApiResponse<any>>(`/psb/print/registration/${id}`)
		const reg = data.data.registrant
		return {
			registrantId: reg.registrantId,
			fullName: reg.fullname,
			email: reg.email,
		}
	},

	getPrintProof: async (type: string, id: number): Promise<any> => {
		if (type === "registration") {
			const { data } = await client.get<ApiResponse<any>>(`/psb/print/registration/${id}`)
			return data.data
		}
		// accepted, rejected, indent-rejected (requires JWT token)
		const { data } = await client.get<ApiResponse<any>>(`/psb/print/${type}`)
		return data.data
	},

	login: async (data: { email: string; password: string }): Promise<PsbLoginResult> => {
		const { data: res } = await client.post<ApiResponse<PsbLoginBody>>("/psb/auth/login", data)
		return toPsbLoginResult(res.data, data.email)
	},

	loginWithGoogle: async (credential: string): Promise<PsbLoginResult> => {
		const { data: res } = await client.post<ApiResponse<PsbLoginBody>>("/psb/auth/google", { credential })
		return toPsbLoginResult(res.data, "")
	},

	verify2fa: async (data: { email: string; code: string }): Promise<{ tokens: TokenPair; user: AuthUser }> => {
		const { data: res } = await client.post<ApiResponse<any>>("/psb/auth/two-factor", data)
		const authData = res.data
		const user: AuthUser = {
			id: authData.user.id,
			email: authData.user.email,
			name: authData.user.fullname || authData.user.name || "",
			role: authData.user.role || "registrant",
			domain: authData.user.domain || "psb",
		}
		return {
			tokens: {
				accessToken: authData.accessToken,
				refreshToken: authData.refreshToken,
			},
			user,
		}
	},

	resend2fa: async (email: string): Promise<{ message: string }> => {
		const { data: res } = await client.post<ApiResponse<any>>("/psb/auth/two-factor/resend", { email })
		return { message: res.message || "Kode 2FA berhasil dikirim ulang." }
	},

	refreshToken: async (): Promise<{ success: boolean }> => {
		const { data: res } = await client.post<ApiResponse<any>>("/psb/auth/refresh")
		return { success: res.success }
	},

	logout: async (): Promise<{ success: boolean }> => {
		const { data: res } = await client.post<ApiResponse<any>>("/psb/auth/logout")
		return { success: res.success }
	},

	forgotPassword: async (email: string): Promise<{ success: boolean }> => {
		const { data: res } = await client.post<ApiResponse<any>>("/psb/auth/forgot-password", { email })
		return { success: res.success }
	},

	resetPassword: async (data: { token: string; password: string, passwordConfirmation: string, email: string }): Promise<{ success: boolean }> => {
		// ResetPasswordDto requires { token, password, passwordConfirmation }
		const { data: res } = await client.post<ApiResponse<any>>("/psb/auth/reset-password", {
			token: data.token,
			email: data.email,
			password: data.password,
			passwordConfirmation: data.password, // match confirmation
		})
		return { success: res.success }
	},

	verifyEmail: async (token: string, email?: string): Promise<{ message: string }> => {
		const { data: res } = await client.post<ApiResponse<any>>("/psb/auth/verify-email", { token, email })
		return { message: res.message || "Email berhasil diverifikasi." }
	},

	resendVerification: async (email: string, clientUrl?: string): Promise<{ message: string }> => {
		const origin = clientUrl || (typeof window !== "undefined" ? window.location.origin : undefined)
		const { data: res } = await client.post<ApiResponse<any>>("/psb/auth/resend-verification", { email, clientUrl: origin })
		return { message: res.message || "Email verifikasi telah dikirimkan ulang." }
	},

	getDashboard: async (): Promise<DashboardData> => {
		const { data } = await client.get<ApiResponse<any>>("/psb/dashboard")
		return {
			registrant: data.data.registrant,
			announcement: data.data.announcement,
			statusInfo: data.data.statusInfo,
		}
	},

	getInvalidData: async (): Promise<unknown> => {
		const { data } = await client.get<ApiResponse<any>>("/psb/invalid/data")
		return {
			personal: mapPersonalToFrontend(data.data.registrant),
			identity: mapIdentityToFrontend(data.data.registrant, data.data.diseases),
			family: mapFamilyToFrontend(data.data.registrant),
			guardian: mapGuardianToFrontend(data.data.registrant),
		}
	},

	updateInvalidStep: async (step: string, data: unknown): Promise<{ success: boolean }> => {
		let payload = data
		if (step === "personal") payload = mapPersonalToBackend(data as WizardPersonalData)
		if (step === "identity") payload = mapIdentityToBackend(data as WizardIdentityData)
		if (step === "family") payload = mapFamilyToBackend(data as WizardFamilyData)
		if (step === "guardian") payload = mapGuardianToBackend(data as WizardGuardianData)

		const { data: res } = await client.patch<ApiResponse<any>>(`/psb/invalid/data/${step}`, payload)
		return { success: res.success }
	},

	updateInvalidAttachment: async (files: Record<string, any>): Promise<{ success: boolean }> => {
		const formData = new FormData()
		if (files["ijazah"]) formData.append("attachCertificate", files["ijazah"])
		if (files["photo"]) formData.append("attachPhoto", files["photo"])
		if (files["kk"]) formData.append("attachFamilyCard", files["kk"])
		if (files["birthCert"]) formData.append("attachBirthCertificate", files["birthCert"])
		if (files["ksp"]) formData.append("attachKsp", files["ksp"])
		if (files["kip"]) formData.append("attachKip", files["kip"])
		if (files["reportCard"]) formData.append("attachReportCard", files["reportCard"])

		const { data: res } = await client.patch<ApiResponse<any>>("/psb/invalid/data/attachment", formData, {
			headers: { "Content-Type": "multipart/form-data" },
		})
		return { success: res.success }
	},

	getProfile: async (): Promise<AuthUser & { enabled2fa: boolean }> => {
		// Get profile details from backend
		const { data } = await client.get<ApiResponse<any>>("/psb/dashboard")
		const reg = data.data.registrant
		return {
			id: reg.id,
			email: reg.email,
			name: reg.fullname,
			role: "registrant",
			domain: "psb",
			enabled2fa: reg.enabled2fa,
		}
	},

	updateProfile: async (data: { name: string }): Promise<{ success: boolean }> => {
		const { data: res } = await client.patch<ApiResponse<any>>("/psb/setting/profile", { fullname: data.name })
		return { success: res.success }
	},

	updateAccount: async (data: { password: string }): Promise<{ success: boolean }> => {
		const { data: res } = await client.patch<ApiResponse<any>>("/psb/setting/password", {
			password: data.password,
			passwordConfirmation: data.password,
		})
		return { success: res.success }
	},

	toggle2fa: async (enabled: boolean): Promise<{ success: boolean }> => {
		const { data: res } = await client.patch<ApiResponse<any>>("/psb/setting/two-factor", { enabled })
		return { success: res.success }
	},
})
