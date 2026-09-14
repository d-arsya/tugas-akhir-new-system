import type { JSX } from "react"
import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { ArrowLeft, Download, Upload, Plus, Eye, CheckCircle2, XCircle, Clock, Search, Filter } from "lucide-react"
import { Input } from "@roja/ui"

interface PsbLevel2WorkbenchProps {
	academicYear: { id: number; year: string; semester: string }
	registrants: any[]
	onBackToAy: () => void
	onOpenCreate: () => void
}

export function PsbLevel2Workbench({
	academicYear,
	registrants,
	onBackToAy,
	onOpenCreate,
}: PsbLevel2WorkbenchProps): JSX.Element {
	const [activeTab, setActiveTab] = useState<"new" | "accepted" | "rejected">("new")
	const [search, setSearch] = useState("")

	const newItems = registrants.filter((r) => r.status === "PENDING" || !r.status || r.status === "wait")
	const acceptedItems = registrants.filter((r) => r.status === "APPROVED" || r.status === "approve")
	const rejectedItems = registrants.filter((r) => r.status === "REJECTED" || r.status === "reject")

	const currentList =
		activeTab === "new" ? newItems : activeTab === "accepted" ? acceptedItems : rejectedItems

	const filteredList = currentList.filter(
		(r) =>
			!search ||
			r.fullName?.toLowerCase().includes(search.toLowerCase()) ||
			r.registrationNo?.includes(search)
	)

	return (
		<div className="space-y-6 animate-in fade-in">
			{/* Page Header Bar */}
			<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
				<div>
					<h2 className="text-xl font-bold text-slate-900 tracking-tight">
						Workbench PSB — T.A <span className="text-[var(--primary)]">{academicYear.year}</span>
					</h2>
					<p className="text-xs text-slate-500 mt-0.5">
						Verifikasi kelengkapan berkas, proses seleksi pendaftaran, dan cetak bukti penerimaan santri baru
					</p>
				</div>

				{/* Group Actions Parity with registrant/partials/group-actions.blade.php */}
				<div className="flex flex-wrap items-center gap-2">
					<button
						type="button"
						onClick={onBackToAy}
						className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
					>
						<ArrowLeft className="w-4 h-4" />
						Kembali
					</button>

					<button
						type="button"
						onClick={() => alert("Membuka Modal Import Calon Santri...")}
						className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 font-semibold rounded-xl text-xs transition-colors"
					>
						<Upload className="w-4 h-4 text-amber-600" />
						Import Excel
					</button>

					<button
						type="button"
						onClick={() => alert("Mengunduh Rekapitulasi Data PSB Excel...")}
						className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 font-semibold rounded-xl text-xs transition-colors"
					>
						<Download className="w-4 h-4 text-emerald-600" />
						Export Excel
					</button>

					<button
						type="button"
						onClick={onOpenCreate}
						className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[var(--primary)] hover:bg-pink-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs"
					>
						<Plus className="w-4 h-4" />
						Tambah Pendaftar
					</button>
				</div>
			</div>

			{/* 3-Tab Workbench Header (Parity with tbr_tabs-registrant) */}
			<div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
				<div className="flex border-b border-slate-200 bg-slate-50/80 p-2 gap-2">
					<button
						type="button"
						onClick={() => setActiveTab("new")}
						className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs transition-all ${
							activeTab === "new"
								? "bg-[var(--primary)] text-white shadow-2xs"
								: "text-slate-600 hover:bg-slate-200/60"
						}`}
					>
						<Clock className="w-4 h-4" />
						<span>Pendaftar Baru / Menunggu</span>
						<span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-mono">
							{newItems.length}
						</span>
					</button>

					<button
						type="button"
						onClick={() => setActiveTab("accepted")}
						className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs transition-all ${
							activeTab === "accepted"
								? "bg-emerald-600 text-white shadow-2xs"
								: "text-slate-600 hover:bg-slate-200/60"
						}`}
					>
						<CheckCircle2 className="w-4 h-4" />
						<span>Santri Diterima</span>
						<span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-mono">
							{acceptedItems.length}
						</span>
					</button>

					<button
						type="button"
						onClick={() => setActiveTab("rejected")}
						className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs transition-all ${
							activeTab === "rejected"
								? "bg-red-600 text-white shadow-2xs"
								: "text-slate-600 hover:bg-slate-200/60"
						}`}
					>
						<XCircle className="w-4 h-4" />
						<span>Pendaftaran Ditolak</span>
						<span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-mono">
							{rejectedItems.length}
						</span>
					</button>
				</div>

				{/* Filter & Search Bar */}
				<div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
					<div className="w-full max-w-sm">
						<Input
							type="text"
							placeholder="Cari No. Registrasi / Nama Pendaftar..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[var(--secondary)]"
						/>
					</div>
					<span className="text-xs text-slate-500 font-medium">
						Menampilkan {filteredStudentsCount(filteredList.length)} calon santri
					</span>
				</div>

				{/* Datatable Table */}
				<div className="overflow-x-auto">
					<table className="w-full text-left text-xs">
						<thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200/60">
							<tr>
								<th className="py-3.5 px-4 w-12 text-center">No</th>
								<th className="py-3.5 px-4">No. Registrasi</th>
								<th className="py-3.5 px-4">Nama Lengkap Calon Santri</th>
								<th className="py-3.5 px-4">L/P</th>
								<th className="py-3.5 px-4">Asal Sekolah</th>
								<th className="py-3.5 px-4">No. HP Orang Tua</th>
								<th className="py-3.5 px-4">Status Verifikasi</th>
								<th className="py-3.5 px-4 text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 text-slate-700">
							{filteredList.length === 0 ? (
								<tr>
									<td colSpan={8} className="py-12 text-center text-slate-400">
										Tidak ada calon santri pada kategori ini.
									</td>
								</tr>
							) : (
								filteredList.map((item, idx) => (
									<tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
										<td className="py-3.5 px-4 font-semibold text-slate-900 text-center">{idx + 1}</td>
										<td className="py-3.5 px-4 font-mono font-bold text-slate-900">
											{item.registrationNo || `PSB2026-${item.id}`}
										</td>
										<td className="py-3.5 px-4 font-bold text-slate-900">{item.fullName}</td>
										<td className="py-3.5 px-4 font-semibold">{item.gender || "L"}</td>
										<td className="py-3.5 px-4 text-slate-600 font-medium">{item.previousSchool || "SMPN 1 Bogor"}</td>
										<td className="py-3.5 px-4 font-mono text-slate-700">{item.phone || "081234567890"}</td>
										<td className="py-3.5 px-4">
											<span
												className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
													activeTab === "accepted"
														? "bg-emerald-100 text-emerald-800 border border-emerald-200"
														: activeTab === "rejected"
															? "bg-red-100 text-red-800 border border-red-200"
															: "bg-pink-100 text-[var(--primary)] border border-pink-200"
												}`}
											>
												{activeTab === "accepted"
													? "DITERIMA"
													: activeTab === "rejected"
														? "DITOLAK"
														: "MENUNGGU"}
											</span>
										</td>
										<td className="py-3.5 px-4 text-right">
											<Link
												to={"/registrants/$id" as any}
												params={{ id: String(item.id) } as any}
												className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl font-semibold text-xs transition-colors shadow-2xs"
											>
												<Eye className="w-3.5 h-3.5 text-[var(--primary)]" />
												Review Detail
											</Link>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	)
}

function filteredStudentsCount(count: number): string {
	return `${count}`
}
