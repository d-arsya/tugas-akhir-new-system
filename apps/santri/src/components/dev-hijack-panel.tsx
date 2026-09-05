import type { JSX } from "react"
import { useState } from "react"
import {
	IS_DEV_HIJACK,
	hijackAuthUser,
} from "@/lib/dev-hijack"
import useAuthStore from "@/stores/auth.store"
import useEwalletStore from "@/stores/ewalletStore"
import { useNavigate, useLocation } from "@tanstack/react-router"
import {
	Sliders,
	ChevronUp,
	ChevronDown,
	UserCheck,
	UserX,
	Globe,
	Lock,
	Unlock,
} from "lucide-react"

const quickRoutes = [
	{ path: "/login", label: "Login" },
	{ path: "/dashboard", label: "Dashboard" },
	{ path: "/e-wallet", label: "E-Wallet" },
	{ path: "/payment-history", label: "SPP History" },
	{ path: "/profile", label: "Profil" },
	{ path: "/setting", label: "Pengaturan" },
]

export const DevHijackPanel = (): JSX.Element | null => {
	if (!IS_DEV_HIJACK) return null

	const navigate = useNavigate()
	const location = useLocation()
	const auth = useAuthStore()
	const ewalletStore = useEwalletStore()

	const [isOpen, setIsOpen] = useState<boolean>(false)

	const toggleAuth = () => {
		if (auth.isAuthenticated) {
			auth.logout()
		} else {
			auth.login("mock-access-token", "mock-refresh-token", hijackAuthUser)
		}
	}

	const togglePinSession = () => {
		ewalletStore.setPinAuthenticated(!ewalletStore.isPinAuthenticated)
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
					<span>SANTRI HIJACK</span>
					<span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-mono border border-emerald-500/30">
						{auth.isAuthenticated ? "LOGGED IN" : "GUEST"}
					</span>
					<ChevronUp className="w-3.5 h-3.5 text-slate-400" />
				</button>
			)}

			{/* Expanded Debug Panel */}
			{isOpen && (
				<div className="bg-slate-900/95 text-slate-100 border border-slate-800 rounded-2xl shadow-2xl p-4 w-80 backdrop-blur-xl flex flex-col gap-3 max-h-[85vh] overflow-y-auto">
					{/* Header */}
					<div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
						<div className="flex items-center gap-2">
							<div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
							<span className="text-xs font-bold text-slate-200 tracking-wide uppercase">
								SANTRI DEV HIJACK PANEL
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
							{auth.isAuthenticated ? "Logout" : "Login"}
						</button>
					</div>

					{/* E-Wallet PIN Gate Toggle */}
					<div className="flex items-center justify-between bg-slate-800/60 p-2.5 rounded-xl border border-slate-800">
						<div className="flex items-center gap-2 text-xs">
							{ewalletStore.isPinAuthenticated ? (
								<Unlock className="w-4 h-4 text-amber-400" />
							) : (
								<Lock className="w-4 h-4 text-slate-400" />
							)}
							<span className="text-slate-300 font-medium">
								{ewalletStore.isPinAuthenticated ? "PIN: Unlocked" : "PIN: Locked"}
							</span>
						</div>
						<button
							onClick={togglePinSession}
							className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-amber-300 transition-colors cursor-pointer"
						>
							{ewalletStore.isPinAuthenticated ? "Lock PIN" : "Unlock PIN"}
						</button>
					</div>

					{/* Quick Route Switcher */}
					<div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800">
						<span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
							<Globe className="w-3 h-3 text-sky-400" /> Quick Route Jump
						</span>
						<div className="grid grid-cols-2 gap-1.5">
							{quickRoutes.map((r) => {
								const isCurrent = location.pathname === r.path
								return (
									<button
										key={r.path}
										onClick={() => navigate({ to: r.path as any })}
										className={`text-[11px] px-2 py-1.5 rounded-lg font-medium transition-colors cursor-pointer border text-left ${
											isCurrent
												? "bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-bold"
												: "bg-slate-800/50 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
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
