import { useState, type JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { adminApi } from "@/lib/api"
import { RojaCard, Input, PageLoader } from "@roja/ui"
import { AdminPageHeader } from "@/components/layout/admin-page-header"
import { formatDate } from "@roja/utils"
import { Search, Monitor, Globe } from "lucide-react"

export const Route = createFileRoute("/_auth/auth-logs")({
	component: AuthLogsPage,
})

function AuthLogsPage(): JSX.Element {
	const [search, setSearch] = useState("")

	const { data, isLoading } = useQuery({
		queryKey: ["admin-auth-logs", search],
		queryFn: () => adminApi.getAuthLogs({ search }),
	})

	if (isLoading) return <PageLoader />

	const logs = data?.data.items || []

	return (
		<div className="space-y-6">
			<AdminPageHeader
				title="Log Aktivitas Autentikasi"
				subtitle="Catatan riwayat sesi login, IP address, dan perangkat pengguna yang mengakses sistem."
			/>

			<RojaCard className="p-4 border-0 shadow-xs">
				<div className="w-full sm:w-80">
					<Input
						placeholder="Cari pengguna atau IP address..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="bg-slate-50 border-0"
					/>
				</div>
			</RojaCard>

			<RojaCard className="overflow-x-auto p-0 border-0 shadow-xs">
				<table className="w-full text-left text-xs">
					<thead>
						<tr className="bg-slate-50/80 text-slate-600 font-semibold uppercase tracking-wider">
							<th className="py-3.5 px-4">Pengguna</th>
							<th className="py-3.5 px-4">Peran (Role)</th>
							<th className="py-3.5 px-4">Alamat IP</th>
							<th className="py-3.5 px-4">Perangkat / Browser</th>
							<th className="py-3.5 px-4">Waktu Masuk</th>
							<th className="py-3.5 px-4">Waktu Keluar</th>
							<th className="py-3.5 px-4">Status</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100/60">
						{logs.map((log) => (
							<tr key={log.id} className="hover:bg-slate-50/50 transition">
								<td className="py-3 px-4">
									<div className="font-semibold text-slate-800">{log.userName}</div>
									<div className="text-[11px] text-slate-400">{log.userEmail}</div>
								</td>
								<td className="py-3 px-4 font-medium text-slate-700">{log.role}</td>
								<td className="py-3 px-4 font-mono text-slate-600">
									<div className="flex items-center gap-1">
										<Globe className="w-3.5 h-3.5 text-slate-400" />
										<span>{log.ipAddress}</span>
									</div>
								</td>
								<td className="py-3 px-4 text-slate-500 max-w-xs truncate" title={log.userAgent}>
									<span className="flex items-center gap-1">
										<Monitor className="w-3.5 h-3.5 text-slate-400 shrink-0" />
										<span className="truncate">{log.userAgent}</span>
									</span>
								</td>
								<td className="py-3 px-4 text-slate-600 font-medium">{formatDate(log.loginAt, "dd MMM yyyy HH:mm")}</td>
								<td className="py-3 px-4 text-slate-500">{log.logoutAt ? formatDate(log.logoutAt, "dd MMM yyyy HH:mm") : "-"}</td>
								<td className="py-3 px-4">
									{log.status === "ACTIVE" ? (
										<span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">Aktif</span>
									) : (
										<span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">Selesai</span>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</RojaCard>
		</div>
	)
}

export default AuthLogsPage
