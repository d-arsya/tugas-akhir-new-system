import type { JSX } from "react"
import { useState, useEffect } from "react"
import {
	IS_DEV_HIJACK,
	getStoredScenario,
	setStoredScenario,
	hijackAuthUser,
	type DashboardScenario,
} from "@/lib/dev-hijack"
import useAuthStore from "@/stores/auth.store"
import useWizardStore from "@/stores/wizard.store"
import { useQueryClient } from "@tanstack/react-query"
import { useNavigate, useLocation } from "@tanstack/react-router"
import { CheckCircle2, ListOrdered } from "lucide-react"
import { DevHijackPanel as BaseDevHijackPanel, type DevHijackRoute } from "@roja/ui"

const scenarios: Array<{ id: DashboardScenario; label: string }> = [
	{ id: "approve", label: "Lulus / Diterima" },
	{ id: "wait", label: "Menunggu" },
	{ id: "fixed", label: "Perbaikan" },
	{ id: "invalid", label: "Berkas Invalid" },
	{ id: "failed", label: "Belum Lulus" },
	{ id: "indent_failed", label: "Indent Gagal" },
]

const wizardSteps = [
	{ step: 1, label: "1. Personal" },
	{ step: 2, label: "2. Identitas" },
	{ step: 3, label: "3. Keluarga" },
	{ step: 4, label: "4. Wali" },
	{ step: 5, label: "5. Lokasi" },
	{ step: 6, label: "6. Lampiran" },
]

const quickRoutes: DevHijackRoute[] = [
	{ path: "/", label: "Landing" },
	{ path: "/login", label: "Login" },
	{ path: "/dashboard", label: "Dashboard" },
	{ path: "/register", label: "Wizard" },
	{ path: "/settings", label: "Pengaturan" },
	{ path: "/invalid", label: "Invalid Fix" },
	{ path: "/need-verify", label: "Need Verify" },
	{ path: "/banned", label: "Banned" },
	{ path: "/print/registration/1", label: "Bukti PSB" },
]

export const DevHijackPanel = (): JSX.Element | null => {
	const navigate = useNavigate()
	const location = useLocation()
	const queryClient = useQueryClient()
	const auth = useAuthStore()
	const wizardStore = useWizardStore()

	const [activeScenario, setActiveScenario] = useState<DashboardScenario>(getStoredScenario())

	useEffect(() => {
		const handleScenarioChange = () => {
			setActiveScenario(getStoredScenario())
		}
		window.addEventListener("roja_dev_scenario_change", handleScenarioChange)
		return () => window.removeEventListener("roja_dev_scenario_change", handleScenarioChange)
	}, [])

	const handleSelectScenario = (sc: DashboardScenario) => {
		setStoredScenario(sc)
		setActiveScenario(sc)
		queryClient.invalidateQueries({ queryKey: ["dashboard"] })
	}

	const handleSelectWizardStep = (step: number) => {
		if (!wizardStore.sessionId) {
			wizardStore.setSession("mock-session-12345", "calonsantri@pondokroja.ac.id", 1)
		}
		wizardStore.setSubStep(step)
		if (location.pathname !== "/register") {
			navigate({ to: "/register" })
		}
	}

	const toggleAuth = () => {
		if (auth.isAuthenticated) {
			auth.logout()
		} else {
			auth.login(hijackAuthUser)
		}
	}

	return (
		<BaseDevHijackPanel
			appName="PSB"
			isDev={IS_DEV_HIJACK}
			isAuthenticated={auth.isAuthenticated}
			statusBadge={activeScenario}
			onToggleAuth={toggleAuth}
			quickRoutes={quickRoutes}
		>
			{/* Dashboard Scenario Selector */}
			<div className="flex flex-col gap-1.5">
				<span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
					Dashboard Status Scenario
				</span>
				<div className="grid grid-cols-2 gap-1.5">
					{scenarios.map((sc) => {
						const isSelected = activeScenario === sc.id
						return (
							<button
								key={sc.id}
								onClick={() => handleSelectScenario(sc.id)}
								className={`text-left text-[11px] px-2.5 py-1.5 rounded-lg font-medium border transition-all flex items-center justify-between cursor-pointer ${
									isSelected
										? "bg-slate-800 border-emerald-500/60 text-white shadow-sm"
										: "bg-slate-800/30 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
								}`}
							>
								<span>{sc.label}</span>
								{isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
							</button>
						)
					})}
				</div>
			</div>

			{/* Wizard Sub-Step Selector */}
			<div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800">
				<span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
					<ListOrdered className="w-3.5 h-3.5 text-amber-400" /> Wizard Step Switcher
				</span>
				<div className="grid grid-cols-2 gap-1.5">
					{wizardSteps.map((ws) => {
						const isCurrentStep = location.pathname === "/register" && wizardStore.subStep === ws.step
						return (
							<button
								key={ws.step}
								onClick={() => handleSelectWizardStep(ws.step)}
								className={`text-left text-[11px] px-2.5 py-1.5 rounded-lg font-medium border transition-all flex items-center justify-between cursor-pointer ${
									isCurrentStep
										? "bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm"
										: "bg-slate-800/30 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
								}`}
							>
								<span>{ws.label}</span>
								{isCurrentStep && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
							</button>
						)
					})}
				</div>
			</div>
		</BaseDevHijackPanel>
	)
}

export default DevHijackPanel
