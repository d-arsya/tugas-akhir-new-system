import type { JSX } from "react"
import {
	IS_DEV_HIJACK,
	hijackAuthUser,
} from "@/lib/dev-hijack"
import useAuthStore from "@/stores/auth.store"
import useEwalletStore from "@/stores/ewalletStore"
import { Lock, Unlock } from "lucide-react"
import { DevHijackPanel as BaseDevHijackPanel, type DevHijackRoute } from "@roja/ui"

const quickRoutes: DevHijackRoute[] = [
	{ path: "/login", label: "Login" },
	{ path: "/verify-2fa", label: "2FA OTP" },
	{ path: "/forgot-password", label: "Forgot Password" },
	{ path: "/reset-password", label: "Reset Password" },
	{ path: "/dashboard", label: "Dashboard" },
	{ path: "/e-wallet", label: "E-Wallet" },
	{ path: "/payment-history", label: "SPP History" },
	{ path: "/profile", label: "Profil" },
	{ path: "/setting", label: "Pengaturan" },
	{ path: "/check-email", label: "Check Email" },
	{ path: "/banned", label: "Banned IP" },
]

export const DevHijackPanel = (): JSX.Element | null => {
	const auth = useAuthStore()
	const ewalletStore = useEwalletStore()

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
		<BaseDevHijackPanel
			appName="SANTRI"
			isDev={IS_DEV_HIJACK}
			isAuthenticated={auth.isAuthenticated}
			onToggleAuth={toggleAuth}
			quickRoutes={quickRoutes}
		>
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

			{/* E-Wallet Has Wallet Toggle */}
			<div className="flex items-center justify-between bg-slate-800/60 p-2 rounded-xl border border-slate-800">
				<span className="text-xs text-slate-300 font-medium">
					{ewalletStore.hasEwallet ? "Wallet: Created" : "Wallet: Not Created"}
				</span>
				<button
					onClick={() => ewalletStore.setHasEwallet(!ewalletStore.hasEwallet)}
					className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-sky-300 transition-colors cursor-pointer"
				>
					Toggle Has
				</button>
			</div>

			{/* E-Wallet Active Toggle */}
			<div className="flex items-center justify-between bg-slate-800/60 p-2 rounded-xl border border-slate-800">
				<span className="text-xs text-slate-300 font-medium">
					{ewalletStore.isActive ? "Status: Active" : "Status: Inactive"}
				</span>
				<button
					onClick={() => ewalletStore.setIsActive(!ewalletStore.isActive)}
					className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-rose-300 transition-colors cursor-pointer"
				>
					Toggle Active
				</button>
			</div>
		</BaseDevHijackPanel>
	)
}

export default DevHijackPanel
