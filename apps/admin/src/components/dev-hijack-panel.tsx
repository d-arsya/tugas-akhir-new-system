import type { JSX } from "react"
import { IS_DEV_HIJACK, hijackAuthUser } from "@/lib/dev-hijack"
import useAuthStore from "@/stores/auth.store"
import { DevHijackPanel as BaseDevHijackPanel, type DevHijackRoute } from "@roja/ui"
import type { AdminRole } from "@roja/types"

const quickRoutes: DevHijackRoute[] = [
	{ label: "Dashboard", path: "/dashboard" },
	{ label: "Pengguna", path: "/users" },
	{ label: "Auth Logs", path: "/auth-logs" },
	{ label: "IP Bans", path: "/ip-bans" },
	{ label: "Pengaturan", path: "/settings" },
	{ label: "Tahun Akademik", path: "/academic-years" },
	{ label: "Jenjang", path: "/levels" },
	{ label: "Jurusan", path: "/majors" },
	{ label: "Kelas & Rombel", path: "/grades" },
]

export const DevHijackPanel = (): JSX.Element | null => {
	const auth = useAuthStore()

	const setRole = (role: AdminRole, name: string) => {
		const user = { ...hijackAuthUser, role, name }
		auth.login(user)
	}

	return (
		<BaseDevHijackPanel
			appName="Admin"
			isDev={IS_DEV_HIJACK}
			isAuthenticated={auth.isAuthenticated}
			quickRoutes={quickRoutes}
			onToggleAuth={() => {
				if (auth.isAuthenticated) {
					auth.logout()
				} else {
					auth.login(hijackAuthUser)
				}
			}}
		>
			<div className="p-3 bg-slate-900/90 text-white rounded-lg space-y-2 border border-slate-700 text-xs">
				<p className="font-semibold text-slate-300">Fast Role Switcher:</p>
				<div className="grid grid-cols-2 gap-1.5">
					<button
						type="button"
						onClick={() => setRole("SUPERADMIN", "Super Administrator")}
						className={`px-2 py-1 rounded text-left transition ${
							auth.user?.role === "SUPERADMIN" ? "bg-pink-600 text-white font-bold" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
						}`}
					>
						Superadmin
					</button>
					<button
						type="button"
						onClick={() => setRole("ADMIN", "Ust. Ahmad Dahlan (Admin)")}
						className={`px-2 py-1 rounded text-left transition ${
							auth.user?.role === "ADMIN" ? "bg-pink-600 text-white font-bold" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
						}`}
					>
						Admin
					</button>
					<button
						type="button"
						onClick={() => setRole("BENDAHARA", "Hj. Siti Rahmah (Bendahara)")}
						className={`px-2 py-1 rounded text-left transition ${
							auth.user?.role === "BENDAHARA" ? "bg-pink-600 text-white font-bold" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
						}`}
					>
						Bendahara
					</button>
					<button
						type="button"
						onClick={() => setRole("KASIR_EWALLET", "Kasir E-Wallet Utama")}
						className={`px-2 py-1 rounded text-left transition ${
							auth.user?.role === "KASIR_EWALLET" ? "bg-pink-600 text-white font-bold" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
						}`}
					>
						Kasir E-Wallet
					</button>
				</div>
			</div>
		</BaseDevHijackPanel>
	)
}

export default DevHijackPanel
