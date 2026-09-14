import type { JSX } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { adminApi } from "@/lib/api"
import { RojaCard, PageLoader } from "@roja/ui"
import { AdminPageHeader } from "@/components/layout/admin-page-header"
import { formatRupiah } from "@roja/utils"
import { Users, Calendar, UserPlus, Wallet, TrendingUp, ArrowRight } from "lucide-react"

export const Route = createFileRoute("/_auth/dashboard")({
	component: DashboardPage,
})

function DashboardPage(): JSX.Element {
	const { data, isLoading } = useQuery({
		queryKey: ["admin-dashboard-stats"],
		queryFn: () => adminApi.getDashboardStats(),
	})

	if (isLoading || !data) {
		return <PageLoader />
	}

	return (
		<div className="space-y-6">
			<AdminPageHeader
				title="Dashboard Utama"
				subtitle="Ringkasan statistik data santri, keuangan, dan status operasional sistem."
			/>

			{/* Executive Stat Widgets */}
			<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
				<RojaCard className="p-4 bg-gradient-to-br from-pink-500 to-rose-600 text-white rounded-2xl border-0 shadow-md">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-xs font-medium text-pink-100 uppercase tracking-wider">Total Santri</p>
							<p className="text-2xl font-bold mt-1 text-white">{data.totalStudents}</p>
						</div>
						<div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
							<Users className="w-5 h-5 text-white" />
						</div>
					</div>
				</RojaCard>

				<RojaCard className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl border-0 shadow-md">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-xs font-medium text-emerald-100 uppercase tracking-wider">Tahun Ajaran</p>
							<p className="text-sm font-bold mt-2 text-white">{data.activeAcademicYear}</p>
						</div>
						<div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
							<Calendar className="w-5 h-5 text-white" />
						</div>
					</div>
				</RojaCard>

				<RojaCard className="p-4 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-2xl border-0 shadow-md">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-xs font-medium text-purple-100 uppercase tracking-wider">Pendaftar PSB</p>
							<p className="text-2xl font-bold mt-1 text-white">{data.pendingRegistrants}</p>
						</div>
						<div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
							<UserPlus className="w-5 h-5 text-white" />
						</div>
					</div>
				</RojaCard>

				<RojaCard className="p-4 bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-2xl border-0 shadow-md">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-xs font-medium text-blue-100 uppercase tracking-wider">Saldo E-Wallet</p>
							<p className="text-base font-bold mt-2 text-white">{formatRupiah(data.totalEwalletBalance)}</p>
						</div>
						<div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
							<Wallet className="w-5 h-5 text-white" />
						</div>
					</div>
				</RojaCard>

				<RojaCard className="p-4 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl border-0 shadow-md">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-xs font-medium text-amber-100 uppercase tracking-wider">Pemasukan Bulan Ini</p>
							<p className="text-base font-bold mt-2 text-white">{formatRupiah(data.incomeThisMonth)}</p>
						</div>
						<div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
							<TrendingUp className="w-5 h-5 text-white" />
						</div>
					</div>
				</RojaCard>
			</div>

			{/* Quick Shortcut Panel */}
			<RojaCard title="Navigasi Pengelolaan Cepat" className="border-0 shadow-sm">
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
					<Link to="/users" className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all group flex items-center justify-between shadow-xs">
						<div>
							<h4 className="font-semibold text-slate-800 text-sm group-hover:text-pink-600">Pengguna System</h4>
							<p className="text-xs text-slate-500 mt-0.5">Kelola akun admin & kasir</p>
						</div>
						<ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-pink-600 group-hover:translate-x-1 transition" />
					</Link>

					<Link to="/academic-years" className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all group flex items-center justify-between shadow-xs">
						<div>
							<h4 className="font-semibold text-slate-800 text-sm group-hover:text-emerald-600">Tahun Akademik</h4>
							<p className="text-xs text-slate-500 mt-0.5">Atur periode & semester</p>
						</div>
						<ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition" />
					</Link>

					<Link to="/levels" className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all group flex items-center justify-between shadow-xs">
						<div>
							<h4 className="font-semibold text-slate-800 text-sm group-hover:text-purple-600">Jenjang Pendidikan</h4>
							<p className="text-xs text-slate-500 mt-0.5">Tsanawiyah, Aliyah, dsb.</p>
						</div>
						<ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition" />
					</Link>

					<Link to="/settings" className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all group flex items-center justify-between shadow-xs">
						<div>
							<h4 className="font-semibold text-slate-800 text-sm group-hover:text-slate-600">Pengaturan Sekolah</h4>
							<p className="text-xs text-slate-500 mt-0.5">Profil, pengumuman & PSB</p>
						</div>
						<ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition" />
					</Link>
				</div>
			</RojaCard>
		</div>
	)
}

export default DashboardPage
