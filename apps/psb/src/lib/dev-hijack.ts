import type { PsbApi } from "@roja/api-client"
import {
	hijackAuthUser,
	mockDashboardData,
	mockWizardPersonalData,
	mockWizardIdentityData,
	mockWizardFamilyData,
	mockWizardGuardianData,
	type DashboardScenario,
} from "./dev-hijack.fixtures"

export {
	hijackAuthUser,
	mockDashboardData,
	mockWizardPersonalData,
	mockWizardIdentityData,
	mockWizardFamilyData,
	mockWizardGuardianData,
	type DashboardScenario,
}

export const IS_DEV_HIJACK =
	import.meta.env.VITE_DEV_HIJACK === "true" ||
	(import.meta.env.DEV && import.meta.env.VITE_DEV_HIJACK !== "false")

export const getStoredScenario = (): DashboardScenario => {
	if (typeof window === "undefined") return "approve"
	const params = new URLSearchParams(window.location.search)
	const scenarioParam = params.get("scenario") as DashboardScenario
	if (scenarioParam) return scenarioParam
	return (localStorage.getItem("roja_dev_scenario") as DashboardScenario) || "approve"
}

export const setStoredScenario = (scenario: DashboardScenario) => {
	if (typeof window !== "undefined") {
		localStorage.setItem("roja_dev_scenario", scenario)
		const url = new URL(window.location.href)
		url.searchParams.set("scenario", scenario)
		window.history.replaceState({}, "", url.toString())
		window.dispatchEvent(new Event("roja_dev_scenario_change"))
	}
}

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

export const hijackPsbApi = (realApi: PsbApi): PsbApi => {
	if (!IS_DEV_HIJACK) return realApi

	return {
		...realApi,
		login: async (_credentials) => {
			await delay(400)
			return {
				accessToken: "mock-psb-access-token",
				refreshToken: "mock-psb-refresh-token",
				user: hijackAuthUser,
				requires2fa: false,
				email: hijackAuthUser.email,
			}
		},
		register: async (_data) => {
			await delay(500)
			return {
				registrantId: "PSB-2026-0999",
				sessionId: "mock-session-12345",
				email: hijackAuthUser.email,
				message: "Registrasi akun berhasil. Kode OTP verifikasi telah dikirimkan ke email Anda.",
			}
		},
		verifyEmail: async (_token) => {
			await delay(400)
			return {
				message: "Email berhasil diverifikasi. Silakan masuk ke Member Area.",
			}
		},
		resendVerification: async (_email) => {
			await delay(400)
			return {
				message: "Email verifikasi baru telah berhasil dikirimkan.",
			}
		},
		forgotPassword: async (_email) => {
			await delay(400)
			return {
				message: "Link reset password telah dikirim ke email Anda.",
			}
		},
		resetPassword: async (_data) => {
			await delay(400)
			return {
				message: "Password Anda berhasil diperbarui.",
			}
		},
		getDashboard: async () => {
			await delay(300)
			const scenario = getStoredScenario()
			return mockDashboardData[scenario] || mockDashboardData.approve
		},
		getWizardStep: async (step, _sessionId) => {
			await delay(300)
			if (step === "personal") return mockWizardPersonalData as any
			if (step === "identity") return mockWizardIdentityData as any
			if (step === "family") return mockWizardFamilyData as any
			if (step === "guardian") return mockWizardGuardianData as any
			if (step === "attachment") return {} as any
			return {} as any
		},
		saveWizardStep: async (_step, _sessionId, data) => {
			await delay(400)
			return data as any
		},
		getInvalidData: async () => {
			await delay(300)
			return {
				personal: mockWizardPersonalData,
				identity: mockWizardIdentityData,
				family: mockWizardFamilyData,
				guardian: mockWizardGuardianData,
			} as any
		},
		updateInvalidStep: async (_step, data) => {
			await delay(400)
			return data as any
		},
		updateInvalidAttachment: async (_files) => {
			await delay(500)
			return { message: "Berkas perbaikan berhasil diperbarui." }
		},
		getPrintProof: async (type, _registrantId) => {
			await delay(300)
			const scenarioData = mockDashboardData.approve
			return {
				type,
				registrant: scenarioData.registrant,
				school: {
					name: "TMQ PONDOK ROJA",
					logo: "/assets/svg/etc/Logo.svg",
					phone: "81392104443",
					fullAddress: "Brumbung RT 03/02 Kelurahan Dukuh\nKecamatan Sukoharjo, Kabupaten Sukoharjo\nProvinsi Jawa Tengah",
				},
				announcement: scenarioData.announcement,
			}
		},
	}
}
