import { type JSX } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { adminApi } from "@/lib/api"
import { RojaCard, PageLoader } from "@roja/ui"
import { AdminPageHeader } from "@/components/layout/admin-page-header"
import { CreditCard, Eye } from "lucide-react"

export const Route = createFileRoute("/_auth/student-capabilities/")({
	component: StudentCapabilitiesIndexLevel1Page,
})

function StudentCapabilitiesIndexLevel1Page(): JSX.Element {
	const navigate = useNavigate()

	const { data: ayData, isLoading } = useQuery({
		queryKey: ["admin-academic-years"],
		queryFn: () => adminApi.getAcademicYearRows(),
	})

	const academicYears = ayData ?? []

	if (isLoading) return <PageLoader />

	return (
		<div className="space-y-6 animate-in fade-in">
			<AdminPageHeader
				title="Kesanggupan Santri - Pilih Tahun Ajaran"
				subtitle="Pilih tahun ajaran untuk mengatur tarif kesanggupan, potongan beasiswa, dan penerbitan invoice"
			/>

			<RojaCard className="bg-white shadow-xs border border-slate-200/80 rounded-2xl overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left text-xs">
						<thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200/60">
							<tr>
								<th className="py-3.5 px-4 w-12 text-center">No</th>
								<th className="py-3.5 px-4">Tahun Ajaran</th>
								<th className="py-3.5 px-4">Total Santri Terdaftar</th>
								<th className="py-3.5 px-4">Santri Beasiswa</th>
								<th className="py-3.5 px-4">Status</th>
								<th className="py-3.5 px-4 text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 text-slate-700">
							{academicYears.map((ay, idx) => (
								<tr key={ay.id} className="hover:bg-slate-50/80 transition-colors">
									<td className="py-3.5 px-4 font-semibold text-slate-900 text-center">{idx + 1}</td>
									<td className="py-3.5 px-4 font-bold text-slate-900">{ay.year}</td>
									<td className="py-3.5 px-4 font-medium">412 Santri</td>
									<td className="py-3.5 px-4">
										<span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
											38 Santri (9.2%)
										</span>
									</td>
									<td className="py-3.5 px-4">
										<span
											className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
												ay.statusAkademik === "berjalan"
													? "bg-emerald-100 text-emerald-800 border border-emerald-200"
													: "bg-slate-100 text-slate-600 border border-slate-200"
											}`}
										>
											{ay.statusAkademik === "berjalan" ? "AKTIF" : "ARSIP"}
										</span>
									</td>
									<td className="py-3.5 px-4 text-right">
										<button
											type="button"
											onClick={() => {
												navigate({
													to: "/student-capabilities/$academicYearId" as any,
													params: { academicYearId: String(ay.id) } as any,
												})
											}}
											className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-800 hover:bg-slate-50 rounded-xl font-semibold text-xs transition-all shadow-2xs"
										>
											<Eye className="w-3.5 h-3.5 text-[var(--primary)]" />
											Buka Matriks
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</RojaCard>
		</div>
	)
}
