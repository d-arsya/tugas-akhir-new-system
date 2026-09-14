import { type JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { RojaCard } from "@roja/ui"
import { AdminPageHeader } from "@/components/layout/admin-page-header"
import { Award, GraduationCap, Briefcase, Globe, TrendingUp, Users } from "lucide-react"

export const Route = createFileRoute("/_auth/alumni/dashboard")({
	component: AlumniDashboardPage,
})

function AlumniDashboardPage(): JSX.Element {
	return (
		<div className="space-y-6">
			<AdminPageHeader
				title="Dashboard Statistik Alumni"
				subtitle="Ringkasan sebaran studi lanjut perguruan tinggi, dunia kerja, dan kiprah alumni Pondok Roja"
			/>

			{/* KPI Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<RojaCard className="p-4 bg-white shadow-xs border-0 rounded-2xl flex items-center gap-4">
					<div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
						<GraduationCap className="w-6 h-6" />
					</div>
					<div>
						<div className="text-[11px] text-slate-500 font-medium">Kuliah Timur Tengah</div>
						<div className="text-lg font-bold text-slate-900 mt-0.5">48 Alumni</div>
						<div className="text-[10px] text-purple-600 font-semibold">Al-Azhar, Madinah, Yaman</div>
					</div>
				</RojaCard>

				<RojaCard className="p-4 bg-white shadow-xs border-0 rounded-2xl flex items-center gap-4">
					<div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
						<Globe className="w-6 h-6" />
					</div>
					<div>
						<div className="text-[11px] text-slate-500 font-medium">PTN & PTIN Dalam Negeri</div>
						<div className="text-lg font-bold text-slate-900 mt-0.5">142 Alumni</div>
						<div className="text-[10px] text-emerald-600 font-semibold">UI, ITB, UIN, IPB</div>
					</div>
				</RojaCard>

				<RojaCard className="p-4 bg-white shadow-xs border-0 rounded-2xl flex items-center gap-4">
					<div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
						<Briefcase className="w-6 h-6" />
					</div>
					<div>
						<div className="text-[11px] text-slate-500 font-medium">Kiprah Pengabdian / Karir</div>
						<div className="text-lg font-bold text-slate-900 mt-0.5">86 Alumni</div>
						<div className="text-[10px] text-blue-600 font-semibold">Guru, Da'i, Entrepreneur</div>
					</div>
				</RojaCard>

				<RojaCard className="p-4 bg-white shadow-xs border-0 rounded-2xl flex items-center gap-4">
					<div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
						<Users className="w-6 h-6" />
					</div>
					<div>
						<div className="text-[11px] text-slate-500 font-medium">Total Alumni Terdata</div>
						<div className="text-lg font-bold text-slate-900 mt-0.5">320 Santri</div>
						<div className="text-[10px] text-amber-600 font-semibold">9 Angkatan</div>
					</div>
				</RojaCard>
			</div>

			{/* Distribution Charts / Visual Representation */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<RojaCard className="p-6 bg-white shadow-xs border-0 rounded-2xl space-y-4">
					<h5 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
						<TrendingUp className="w-4 h-4 text-purple-600" /> Top Perguruan Tinggi Tujuan Alumni
					</h5>
					<div className="space-y-3 text-xs">
						{[
							{ name: "Universitas Al-Azhar Kairo", count: 32, pct: 70 },
							{ name: "UIN Syarif Hidayatullah Jakarta", count: 28, pct: 60 },
							{ name: "Universitas Islam Madinah", count: 16, pct: 35 },
							{ name: "Institut Pertanian Bogor (IPB)", count: 14, pct: 30 },
							{ name: "Universitas Indonesia (UI)", count: 12, pct: 25 },
						].map((univ) => (
							<div key={univ.name} className="space-y-1">
								<div className="flex justify-between font-semibold text-slate-800">
									<span>{univ.name}</span>
									<span className="text-purple-700">{univ.count} Alumni</span>
								</div>
								<div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
									<div className="h-full bg-[var(--primary)] rounded-full" style={{ width: `${univ.pct}%` }} />
								</div>
							</div>
						))}
					</div>
				</RojaCard>

				<RojaCard className="p-6 bg-white shadow-xs border-0 rounded-2xl space-y-4">
					<h5 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
						<Award className="w-4 h-4 text-emerald-600" /> Prestasi & Karir Alumni
					</h5>
					<div className="divide-y divide-slate-100 text-xs">
						<div className="py-3 flex items-start gap-3">
							<div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0">
								A
							</div>
							<div>
								<div className="font-semibold text-slate-900">Ustadz Abdullah Lc.</div>
								<div className="text-[11px] text-slate-500">Angkatan 2021 - Pengasuh Pesantren Qur'an Bogor</div>
							</div>
						</div>
						<div className="py-3 flex items-start gap-3">
							<div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
								F
							</div>
							<div>
								<div className="font-semibold text-slate-900">Fatimah Zahra S.T.</div>
								<div className="text-[11px] text-slate-500">Angkatan 2022 - Software Engineer & EdTech Founder</div>
							</div>
						</div>
					</div>
				</RojaCard>
			</div>
		</div>
	)
}
