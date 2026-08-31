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
} from "@roja/types"

type MockDb = {
	sessions: Record<string, {
		email: string
		levelId: number
		personal?: WizardPersonalData | undefined
		identity?: WizardIdentityData | undefined
		family?: WizardFamilyData | undefined
		guardian?: WizardGuardianData | undefined
		attachments?: Record<string, string> | undefined
	}>
	registrants: Record<number, Registrant & {
		password?: string | undefined
		enabled2fa?: boolean | undefined
		personal?: WizardPersonalData | undefined
		identity?: WizardIdentityData | undefined
		family?: WizardFamilyData | undefined
		guardian?: WizardGuardianData | undefined
		dataValidation: "valid" | "invalid" | "fixed"
		dataValidationNote: string
	}>
}

const getMockDb = (): MockDb => {
	if (typeof window === "undefined") {
		return { sessions: {}, registrants: {} }
	}
	const stored = localStorage.getItem("roja-psb-mock-db")
	if (stored) {
		try {
			return JSON.parse(stored) as MockDb
		} catch {
			// fallback
		}
	}
	const initial: MockDb = {
		sessions: {},
		registrants: {
			12345: {
				id: 12345,
				registrantId: "PR20260028",
				fullName: "Puji Padmi Laksmiwati",
				email: "puji@example.com",
				emailVerifiedAt: "2026-08-30T12:00:00Z",
				gender: "female",
				nationality: "wni",
				dateOfBirth: "2012-05-15",
				placeOfBirth: "Bandung",
				approvalStatus: "wait",
				levelId: 2,
				academicYearId: 2026,
				createdAt: "2026-08-30T10:00:00Z",
				updatedAt: "2026-08-30T10:00:00Z",
				password: "PASSWORD",
				enabled2fa: false,
				dataValidation: "valid",
				dataValidationNote: "",
				personal: {
					fullName: "Puji Padmi Laksmiwati",
					religion: "Islam",
					gender: "female",
					nationality: "wni",
					dateOfBirth: "2012-05-15",
					placeOfBirth: "Bandung",
					address: "Jl. Merdeka No. 10",
					provinceId: 32,
					regencyId: 3273,
					districtId: 3273010,
					rt: "01",
					rw: "02",
					postalCode: "40111",
					phone: "081234567890",
					liveWith: "parent",
					previousSchoolName: "SMP Merdeka",
					previousSchoolProvinceId: 32,
					previousSchoolRegencyId: 3273,
					previousSchoolDistrictId: 3273010,
				},
			},
		},
	}
	localStorage.setItem("roja-psb-mock-db", JSON.stringify(initial))
	return initial
}

const saveMockDb = (db: MockDb): void => {
	if (typeof window !== "undefined") {
		localStorage.setItem("roja-psb-mock-db", JSON.stringify(db))
	}
}

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
	announcement: string | null
}

export type PsbApi = {
	getLanding: () => Promise<{ isOpen: boolean; schoolName: string; levels: Array<{ id: number; name: string }> }>
	checkEmail: (data: { email: string; levelId: number }) => Promise<{ sessionId: string }>
	getWizardStep: (step: string, sessionId: string) => Promise<unknown>
	saveWizardStep: (step: string, sessionId: string, data: unknown) => Promise<{ success: boolean }>
	submitAttachment: (sessionId: string, files: Record<string, string>) => Promise<{ tokens: TokenPair; user: AuthUser; registrantId: string }>
	getSuccess: (id: number) => Promise<SuccessResponse>
	login: (data: { email: string; password: string }) => Promise<{ tokens: TokenPair; user: AuthUser }>
	verify2fa: (code: string, registrantId: number) => Promise<{ tokens: TokenPair; user: AuthUser }>
	resend2fa: (registrantId: number) => Promise<{ success: boolean }>
	logout: () => Promise<{ success: boolean }>
	forgotPassword: (email: string) => Promise<{ success: boolean }>
	resetPassword: (data: { token: string; password: string }) => Promise<{ success: boolean }>
	getDashboard: () => Promise<DashboardData>
	getInvalidData: () => Promise<unknown>
	updateInvalidStep: (step: string, data: unknown) => Promise<{ success: boolean }>
	updateInvalidAttachment: (files: Record<string, string>) => Promise<{ success: boolean }>
	getProfile: () => Promise<AuthUser & { enabled2fa: boolean }>
	updateProfile: (data: { name: string }) => Promise<{ success: boolean }>
	updateAccount: (data: { password: string }) => Promise<{ success: boolean }>
	toggle2fa: (enabled: boolean) => Promise<{ success: boolean }>
}

export const createPsbApi = (_client?: AxiosInstance): PsbApi => ({
	getLanding: async (): Promise<{ isOpen: boolean; schoolName: string; levels: Array<{ id: number; name: string }> }> => {
		return {
			isOpen: true,
			schoolName: "Pondok Roja Islamic Boarding School",
			levels: [
				{ id: 1, name: "SMP Roja (Sekolah Menengah Pertama)" },
				{ id: 2, name: "SMA Roja (Sekolah Menengah Atas)" },
			],
		}
	},

	checkEmail: async (data: { email: string; levelId: number }): Promise<{ sessionId: string }> => {
		const db = getMockDb()
		const sessionId = `sess_${Math.random().toString(36).substr(2, 9)}`
		db.sessions[sessionId] = { email: data.email, levelId: data.levelId }
		saveMockDb(db)
		return { sessionId }
	},

	getWizardStep: async (step: string, sessionId: string): Promise<unknown> => {
		const db = getMockDb()
		const session = db.sessions[sessionId]
		if (!session) throw new Error("Session expired or invalid")
		if (step === "personal") return session.personal || {}
		if (step === "identity") return session.identity || {}
		if (step === "family") return session.family || {}
		if (step === "guardian") return session.guardian || {}
		if (step === "attachment") return session.attachments || {}
		return {}
	},

	saveWizardStep: async (step: string, sessionId: string, data: unknown): Promise<{ success: boolean }> => {
		const db = getMockDb()
		const session = db.sessions[sessionId]
		if (!session) throw new Error("Session expired or invalid")
		if (step === "personal") session.personal = data as WizardPersonalData
		if (step === "identity") session.identity = data as WizardIdentityData
		if (step === "family") session.family = data as WizardFamilyData
		if (step === "guardian") session.guardian = data as WizardGuardianData
		saveMockDb(db)
		return { success: true }
	},

	submitAttachment: async (sessionId: string, files: Record<string, string>): Promise<{ tokens: TokenPair; user: AuthUser; registrantId: string }> => {
		const db = getMockDb()
		const session = db.sessions[sessionId]
		if (!session) throw new Error("Session expired or invalid")

		session.attachments = files

		const newId = Math.floor(10000 + Math.random() * 90000)
		const dateStr = new Date().getFullYear().toString()
		const sequence = Object.keys(db.registrants).length + 1
		const registrantId = `PR${dateStr}${sequence.toString().padStart(4, "0")}`

		const newRegistrant: Registrant & {
			password?: string | undefined
			enabled2fa?: boolean | undefined
			personal?: WizardPersonalData | undefined
			identity?: WizardIdentityData | undefined
			family?: WizardFamilyData | undefined
			guardian?: WizardGuardianData | undefined
			dataValidation: "valid" | "invalid" | "fixed"
			dataValidationNote: string
		} = {
			id: newId,
			registrantId,
			fullName: session.personal?.fullName || "Calon Santri",
			email: session.email,
			emailVerifiedAt: new Date().toISOString(),
			gender: session.personal?.gender || "male",
			nationality: session.personal?.nationality || "wni",
			dateOfBirth: session.personal?.dateOfBirth || "2012-01-01",
			placeOfBirth: session.personal?.placeOfBirth || "Jakarta",
			approvalStatus: "wait",
			levelId: session.levelId,
			academicYearId: parseInt(dateStr),
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			password: "PASSWORD", // mock password sent via email
			enabled2fa: false,
			dataValidation: "valid",
			dataValidationNote: "",
			personal: session.personal || undefined,
			identity: session.identity || undefined,
			family: session.family || undefined,
			guardian: session.guardian || undefined,
		}

		db.registrants[newId] = newRegistrant
		delete db.sessions[sessionId] // clear session
		saveMockDb(db)

		// Set current user as logged in
		localStorage.setItem("roja-mock-current-user-id", newId.toString())

		const tokens: TokenPair = {
			accessToken: `at_${Math.random().toString(36).substr(2)}`,
			refreshToken: `rt_${Math.random().toString(36).substr(2)}`,
		}

		const user: AuthUser = {
			id: newId,
			email: newRegistrant.email,
			name: newRegistrant.fullName,
			role: "registrant",
			domain: "psb",
		}

		return { tokens, user, registrantId }
	},

	getSuccess: async (id: number): Promise<SuccessResponse> => {
		const db = getMockDb()
		const reg = db.registrants[id]
		if (!reg) throw new Error("Registrant not found")
		return {
			registrantId: reg.registrantId,
			fullName: reg.fullName,
			email: reg.email,
		}
	},

	login: async (data: { email: string; password: string }): Promise<{ tokens: TokenPair; user: AuthUser }> => {
		const db = getMockDb()
		const reg = Object.values(db.registrants).find((r) => r.email === data.email)
		if (!reg) throw new Error("Email atau password salah")

		// In mock login, any password works or checks "PASSWORD"
		localStorage.setItem("roja-mock-current-user-id", reg.id.toString())

		const tokens: TokenPair = {
			accessToken: `at_${Math.random().toString(36).substr(2)}`,
			refreshToken: `rt_${Math.random().toString(36).substr(2)}`,
		}

		const user: AuthUser = {
			id: reg.id,
			email: reg.email,
			name: reg.fullName,
			role: "registrant",
			domain: "psb",
		}

		return { tokens, user }
	},

	verify2fa: async (code: string, registrantId: number): Promise<{ tokens: TokenPair; user: AuthUser }> => {
		const db = getMockDb()
		const reg = db.registrants[registrantId]
		if (!reg) throw new Error("Registrant not found")
		if (code !== "123456") throw new Error("Kode verification 2FA salah")

		const tokens: TokenPair = {
			accessToken: `at_${Math.random().toString(36).substr(2)}`,
			refreshToken: `rt_${Math.random().toString(36).substr(2)}`,
		}

		const user: AuthUser = {
			id: reg.id,
			email: reg.email,
			name: reg.fullName,
			role: "registrant",
			domain: "psb",
		}

		return { tokens, user }
	},

	resend2fa: async (_registrantId: number): Promise<{ success: boolean }> => {
		return { success: true }
	},

	logout: async (): Promise<{ success: boolean }> => {
		localStorage.removeItem("roja-mock-current-user-id")
		return { success: true }
	},

	forgotPassword: async (_email: string): Promise<{ success: boolean }> => {
		return { success: true }
	},

	resetPassword: async (_data: { token: string; password: string }): Promise<{ success: boolean }> => {
		return { success: true }
	},

	getDashboard: async (): Promise<DashboardData> => {
		const db = getMockDb()
		const idStr = localStorage.getItem("roja-mock-current-user-id") || "12345"
		const reg = db.registrants[parseInt(idStr)]
		if (!reg) throw new Error("Registrant not found")

		return {
			registrant: reg,
			announcement: "Selamat datang di PSB Pondok Roja. Harap periksa status verifikasi berkas Anda secara berkala.",
		}
	},

	getInvalidData: async (): Promise<unknown> => {
		const db = getMockDb()
		const idStr = localStorage.getItem("roja-mock-current-user-id") || "12345"
		const reg = db.registrants[parseInt(idStr)]
		if (!reg) throw new Error("Registrant not found")
		return {
			personal: reg.personal || {},
			identity: reg.identity || {},
			family: reg.family || {},
			guardian: reg.guardian || {},
		}
	},

	updateInvalidStep: async (step: string, data: unknown): Promise<{ success: boolean }> => {
		const db = getMockDb()
		const idStr = localStorage.getItem("roja-mock-current-user-id")
		if (!idStr) throw new Error("Unauthorized")
		const reg = db.registrants[parseInt(idStr)]
		if (!reg) throw new Error("Registrant not found")

		if (step === "personal") reg.personal = data as WizardPersonalData
		if (step === "identity") reg.identity = data as WizardIdentityData
		if (step === "family") reg.family = data as WizardFamilyData
		if (step === "guardian") reg.guardian = data as WizardGuardianData
		saveMockDb(db)
		return { success: true }
	},

	updateInvalidAttachment: async (_files: Record<string, string>): Promise<{ success: boolean }> => {
		const db = getMockDb()
		const idStr = localStorage.getItem("roja-mock-current-user-id")
		if (!idStr) throw new Error("Unauthorized")
		const reg = db.registrants[parseInt(idStr)]
		if (!reg) throw new Error("Registrant not found")

		reg.dataValidation = "fixed"
		reg.approvalStatus = "fixed"
		saveMockDb(db)
		return { success: true }
	},

	getProfile: async (): Promise<AuthUser & { enabled2fa: boolean }> => {
		const db = getMockDb()
		const idStr = localStorage.getItem("roja-mock-current-user-id")
		if (!idStr) throw new Error("Unauthorized")
		const reg = db.registrants[parseInt(idStr)]
		if (!reg) throw new Error("Registrant not found")
		return {
			id: reg.id,
			email: reg.email,
			name: reg.fullName,
			role: "registrant",
			domain: "psb",
			enabled2fa: reg.enabled2fa || false,
		}
	},

	updateProfile: async (data: { name: string }): Promise<{ success: boolean }> => {
		const db = getMockDb()
		const idStr = localStorage.getItem("roja-mock-current-user-id")
		if (!idStr) throw new Error("Unauthorized")
		const reg = db.registrants[parseInt(idStr)]
		if (!reg) throw new Error("Registrant not found")

		reg.fullName = data.name
		if (reg.personal) reg.personal.fullName = data.name
		saveMockDb(db)
		return { success: true }
	},

	updateAccount: async (data: { password: string }): Promise<{ success: boolean }> => {
		const db = getMockDb()
		const idStr = localStorage.getItem("roja-mock-current-user-id")
		if (!idStr) throw new Error("Unauthorized")
		const reg = db.registrants[parseInt(idStr)]
		if (!reg) throw new Error("Registrant not found")

		reg.password = data.password
		saveMockDb(db)
		return { success: true }
	},

	toggle2fa: async (enabled: boolean): Promise<{ success: boolean }> => {
		const db = getMockDb()
		const idStr = localStorage.getItem("roja-mock-current-user-id")
		if (!idStr) throw new Error("Unauthorized")
		const reg = db.registrants[parseInt(idStr)]
		if (!reg) throw new Error("Registrant not found")

		reg.enabled2fa = enabled
		saveMockDb(db)
		return { success: true }
	},
})
