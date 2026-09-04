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
import { Sliders, CheckCircle2, ChevronUp, ChevronDown, UserCheck, UserX, Globe, ListOrdered } from "lucide-react"

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

const quickRoutes = [
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
	if (!IS_DEV_HIJACK) return null

	const navigate = useNavigate()
	const location = useLocation()
	const queryClient = useQueryClient()
	const auth = useAuthStore()
	const wizardStore = useWizardStore()

	const [isOpen, setIsOpen] = useState<boolean>(false)
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
		<div className="fixed bottom-4 right-4 z-[9999] font-sans antialiased">
			{/* Collapsed Pill Badge */}
			{!isOpen && (
				<button
					onClick={() => setIsOpen(true)}
					className="flex items-center gap-2 bg-slate-900/90 text-white hover:bg-slate-900 px-3.5 py-2 rounded-full shadow-2xl backdrop-blur-md border border-slate-700/80 text-xs font-semibold cursor-pointer transition-all hover:scale-105"
				>
					<Sliders className="w-4 h-4 text-emerald-400" />
					<span>DEV HIJACK</span>
					<span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-mono border border-emerald-500/30">
						{activeScenario}
					</span>
					<ChevronUp className="w-3.5 h-3.5 text-slate-400" />
				</button>
			)}

			{/* Expanded Debug Panel */}
			{isOpen && (
				<div className="bg-slate-900/95 text-slate-100 border border-slate-800 rounded-2xl shadow-2xl p-4 w-84 backdrop-blur-xl flex flex-col gap-3 max-h-[85vh] overflow-y-auto">
					{/* Header */}
					<div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
						<div className="flex items-center gap-2">
							<div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
							<span className="text-xs font-bold text-slate-200 tracking-wide uppercase">
								PSB DEV HIJACK MODE
							</span>
						</div>
						<button
							onClick={() => setIsOpen(false)}
							className="text-slate-400 hover:text-white text-xs cursor-pointer p-1"
						>
							<ChevronDown className="w-4 h-4" />
						</button>
					</div>

					{/* Auth Toggle */}
					<div className="flex items-center justify-between bg-slate-800/60 p-2.5 rounded-xl border border-slate-800">
						<div className="flex items-center gap-2 text-xs">
							{auth.isAuthenticated ? (
								<UserCheck className="w-4 h-4 text-emerald-400" />
							) : (
								<UserX className="w-4 h-4 text-rose-400" />
							)}
							<span className="text-slate-300 font-medium">
								{auth.isAuthenticated ? "Auth: Logged In" : "Auth: Guest"}
							</span>
						</div>
						<button
							onClick={toggleAuth}
							className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors cursor-pointer"
						>
							{auth.isAuthenticated ? "Simulate Logout" : "Simulate Login"}
						</button>
					</div>

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

					{/* Quick Route Switcher */}
					<div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800">
						<span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
							<Globe className="w-3 h-3 text-sky-400" /> Quick Route Jump
						</span>
						<div className="flex flex-wrap gap-1">
							{quickRoutes.map((r) => {
								const isCurrent = location.pathname === r.path
								return (
									<button
										key={r.path}
										onClick={() => navigate({ to: r.path as any })}
										className={`text-[10px] px-2 py-1 rounded-md font-medium transition-colors cursor-pointer ${
											isCurrent
												? "bg-emerald-500 text-white font-bold"
												: "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
										}`}
									>
										{r.label}
									</button>
								)
							})}
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default DevHijackPanel
