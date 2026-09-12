import type { JSX } from "react"
import { IS_DEV_HIJACK, hijackAuthUser } from "@/lib/dev-hijack"
import useAuthStore from "@/stores/authStore"
import useEwalletStore from "@/stores/ewalletStore"
import { Lock, Unlock } from "lucide-react"
import { DevHijackPanel as BaseDevHijackPanel, type DevHijackRoute } from "@roja/ui"

const quickRoutes: DevHijackRoute[] = [
	{ path: "/login", label: "Login" },
	{ path: "/verify-2fa", label: "2FA OTP" },
	{ path: "/forgot-password", label: "Forgot Password" },
	{ path: "/reset-password", label: "Reset Password" },
	{ path: "/profile", label: "Profil Saya" },
	{ path: "/setting", label: "Pengaturan" },
	{ path: "/e-wallet", label: "Dompet Digital" },
	{ path: "/banned", label: "Banned IP" },
]

export const DevHijackPanel = (): JSX.Element | null => {
	const auth = useAuthStore()
	const ewalletStore = useEwalletStore()

	const toggleAuth = () => {
		if (auth.isAuthenticated) {
			auth.logout()
		} else {
			auth.login(hijackAuthUser)
		}
	}

	const togglePinSession = () => {
		ewalletStore.setPinAuthenticated(!ewalletStore.isPinAuthenticated)
	}

	return (
		<BaseDevHijackPanel
			appName="MERCHANT"
			isDev={IS_DEV_HIJACK}
			isAuthenticated={auth.isAuthenticated}
			onToggleAuth={toggleAuth}
			quickRoutes={quickRoutes}
		>
			<div className="flex items-center justify-between bg-slate-800/60 p-2.5 rounded-xl border border-slate-800">
				<div className="flex items-center gap-2 text-xs">
					{ewalletStore.isPinAuthenticated ? (
						<Unlock className="w-4 h-4 text-emerald-400" />
					) : (
						<Lock className="w-4 h-4 text-slate-400" />
					)}
					<span className="text-slate-300 font-medium">
						{ewalletStore.isPinAuthenticated ? "PIN: Unlocked" : "PIN: Locked"}
					</span>
				</div>
				<button
					type="button"
					onClick={togglePinSession}
					className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-emerald-300 transition-colors cursor-pointer"
				>
					{ewalletStore.isPinAuthenticated ? "Lock PIN" : "Unlock PIN"}
				</button>
			</div>
		</BaseDevHijackPanel>
	)
}

export default DevHijackPanel
