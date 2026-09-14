import { type JSX } from "react"
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { adminApi } from "@/lib/api"
import { PageLoader } from "@roja/ui"
import { GraduationCap, ArrowLeft, Download, Eye, User } from "lucide-react"

export const Route = createFileRoute("/_auth/alumni/$graduationYear")({
	component: AlumniYearRosterPage,
})

function AlumniYearRosterPage(): JSX.Element {
	const navigate = useNavigate()
	const { graduationYear } = Route.useParams()

	const { data: alumniData, isLoading } = useQuery({
		queryKey: ["admin-alumni-year", graduationYear],
		queryFn: () => adminApi.getAlumni({ graduationYear }),
	})

	const alumniList = alumniData?.data?.items || [
		{ id: 101, fullName: "Muhammad Farhan", phone: "081211112222", province: "Jawa Barat", regency: "Kab. Bogor", talents: "Universitas Al-Azhar Kairo (Syariah)" },
		{ id: 102, fullName: "Aisyah Humaira", phone: "081233334444", province: "DKI Jakarta", regency: "Jakarta Timur", talents: "UI Depok (Kedokteran)" },
	]

	if (isLoading) return <PageLoader />

	return (
		<div className="space-y-6 animate-in fade-in">
			{/* Page Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
				<div>
					<h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
						<GraduationCap className="w-5 h-5 text-[var(--primary)]" />
						Data Alumni Lulusan Tahun <span className="text-[var(--primary)]">{graduationYear}</span>
					</h2>
					<p className="text-xs text-slate-500 mt-0.5">
						Roster alumni angkatan {graduationYear}, kontak domisili, dan peminatan universitas/karir
					</p>
				</div>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => navigate({ to: "/alumni" as any })}
						className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
					>
						<ArrowLeft className="w-4 h-4" />
						Kembali
					</button>
					<button
						type="button"
						onClick={() => alert("Mengunduh Roster Alumni Tahun " + graduationYear + " Excel...")}
						className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 font-semibold rounded-xl text-xs transition-colors"
					>
						<Download className="w-4 h-4 text-emerald-600" />
						Export Excel
					</button>
				</div>
			</div>

			{/* Datatable Card */}
			<div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
				<div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
					<span className="font-bold text-xs text-slate-800 uppercase tracking-wider">Roster Alumni Angkatan {graduationYear}</span>
					<span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-[var(--primary)]">
						{alumniList.length} Terdaftar
					</span>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full text-left text-xs min-w-[900px]">
						<thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200/60">
							<tr>
								<th className="py-3.5 px-4 w-12 text-center">No</th>
								<th className="py-3.5 px-4 w-12 text-center">Foto</th>
								<th className="py-3.5 px-4">Nama Lengkap Alumni</th>
								<th className="py-3.5 px-4 w-32">No. Telepon</th>
								<th className="py-3.5 px-4 w-32">Provinsi</th>
								<th className="py-3.5 px-4 w-32">Kabupaten</th>
								<th className="py-3.5 px-4">Studi Lanjut / Karir</th>
								<th className="py-3.5 px-4 text-right w-24">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 text-slate-700">
							{alumniList.map((item: any, idx: number) => (
								<tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
									<td className="py-3.5 px-4 font-semibold text-slate-900 text-center">{idx + 1}</td>
									<td className="py-3.5 px-4 text-center">
										<div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 mx-auto flex items-center justify-center overflow-hidden text-slate-400">
											<User className="w-4 h-4" />
										</div>
									</td>
									<td className="py-3.5 px-4 font-bold text-slate-900">{item.fullName}</td>
									<td className="py-3.5 px-4 font-mono text-slate-700">{item.phone}</td>
									<td className="py-3.5 px-4 font-medium text-slate-600">{item.province}</td>
									<td className="py-3.5 px-4 font-medium text-slate-600">{item.regency}</td>
									<td className="py-3.5 px-4 font-semibold text-purple-700">{item.talents}</td>
									<td className="py-3.5 px-4 text-right">
										<Link
											to={"/alumni/$id" as any}
											params={{ id: String(item.id) } as any}
											className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl font-semibold text-xs"
										>
											<Eye className="w-3.5 h-3.5 text-[var(--primary)]" />
											Detail
										</Link>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	)
}
