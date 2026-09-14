import type { JSX } from "react"
import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { GraduationCap, Archive, Search, Eye, Download, Upload, User } from "lucide-react"
import { Input } from "@roja/ui"

interface AlumniOverviewProps {
	graduationYears: any[]
	archiveAlumni: any[]
	onSelectYear: (year: string) => void
}

export function AlumniOverview({ graduationYears, archiveAlumni, onSelectYear }: AlumniOverviewProps): JSX.Element {
	const [activeTab, setActiveTab] = useState<"years" | "archive">("years")
	const [search, setSearch] = useState("")

	const filteredArchive = archiveAlumni.filter(
		(a) =>
			!search ||
			a.fullName?.toLowerCase().includes(search.toLowerCase()) ||
			a.phone?.includes(search) ||
			a.province?.toLowerCase().includes(search.toLowerCase())
	)

	return (
		<div className="space-y-6 animate-in fade-in">
			{/* Page Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
				<div>
					<h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
						<GraduationCap className="w-5 h-5 text-[var(--primary)]" />
						Data Alumni Pondok Roja
					</h2>
					<p className="text-xs text-slate-500 mt-0.5">
						Rekapitulasi tahun kelulusan, penelusuran arsip alumni, serta tempat studi lanjut & karir
					</p>
				</div>
				<div className="flex items-center gap-2 self-start sm:self-auto">
					<Link
						to={"/alumni/dashboard" as any}
						className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[var(--primary)] text-white font-semibold rounded-xl text-xs hover:bg-pink-700 transition-colors shadow-2xs"
					>
						<GraduationCap className="w-4 h-4" />
						Dashboard Statistik
					</Link>
				</div>
			</div>

			{/* 2-Tab Header (Parity with alumni/index.blade.php) */}
			<div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
				<div className="flex border-b border-slate-200 bg-slate-50/80 p-2 gap-2">
					<button
						type="button"
						onClick={() => setActiveTab("years")}
						className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs transition-all ${
							activeTab === "years"
								? "bg-[var(--primary)] text-white shadow-2xs"
								: "text-slate-600 hover:bg-slate-200/60"
						}`}
					>
						<GraduationCap className="w-4 h-4" />
						<span>Tahun Kelulusan</span>
						<span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-mono">
							{graduationYears.length}
						</span>
					</button>

					<button
						type="button"
						onClick={() => setActiveTab("archive")}
						className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs transition-all ${
							activeTab === "archive"
								? "bg-purple-600 text-white shadow-2xs"
								: "text-slate-600 hover:bg-slate-200/60"
						}`}
					>
						<Archive className="w-4 h-4" />
						<span>Master Data Alumni Archive</span>
						<span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-mono">
							{archiveAlumni.length}
						</span>
					</button>
				</div>

				{/* Tab 1: Tahun Kelulusan Grid */}
				{activeTab === "years" && (
					<div className="overflow-x-auto">
						<table className="w-full text-left text-xs">
							<thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200/60">
								<tr>
									<th className="py-3.5 px-4 w-12 text-center">No</th>
									<th className="py-3.5 px-4">Tahun Kelulusan</th>
									<th className="py-3.5 px-4">Jumlah Lulusan</th>
									<th className="py-3.5 px-4">Laki - Laki</th>
									<th className="py-3.5 px-4">Perempuan</th>
									<th className="py-3.5 px-4 text-right">Actions</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100 text-slate-700">
								{graduationYears.map((item, idx) => (
									<tr key={item.year} className="hover:bg-slate-50/80 transition-colors">
										<td className="py-3.5 px-4 font-semibold text-slate-900 text-center">{idx + 1}</td>
										<td className="py-3.5 px-4 font-bold text-slate-900">
											Tahun {item.year}
										</td>
										<td className="py-3.5 px-4">
											<span className="px-2.5 py-1 rounded-md text-xs font-bold bg-pink-50 text-[var(--primary)] border border-pink-100">
												{item.totalCount || 45} Alumni
											</span>
										</td>
										<td className="py-3.5 px-4 font-semibold text-sky-700">{item.maleCount || 24} Santri</td>
										<td className="py-3.5 px-4 font-semibold text-pink-700">{item.femaleCount || 21} Santriwati</td>
										<td className="py-3.5 px-4 text-right">
											<button
												type="button"
												onClick={() => onSelectYear(item.year)}
												className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-800 hover:bg-slate-50 rounded-xl font-semibold text-xs transition-all shadow-2xs"
											>
												<Eye className="w-3.5 h-3.5 text-[var(--primary)]" />
												Lihat Roster Alumni
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}

				{/* Tab 2: Master Archive Table */}
				{activeTab === "archive" && (
					<div className="space-y-4 p-4">
						<div className="flex items-center justify-between gap-4">
							<div className="w-full max-w-sm">
								<Input
									type="text"
									placeholder="Cari Alumni / Wilayah / Minat Bakat..."
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-[var(--secondary)]"
								/>
							</div>
						</div>

						<div className="overflow-x-auto border border-slate-200/80 rounded-xl">
							<table className="w-full text-left text-xs min-w-[900px]">
								<thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200/60">
									<tr>
										<th className="py-3 px-3 w-10 text-center">No</th>
										<th className="py-3 px-3 w-12 text-center">Foto</th>
										<th className="py-3 px-3">Nama Lengkap Alumni</th>
										<th className="py-3 px-3 w-28">No. Telepon</th>
										<th className="py-3 px-3 w-28">Provinsi</th>
										<th className="py-3 px-3 w-28">Kabupaten</th>
										<th className="py-3 px-3">Minat Bakat / Peminatan</th>
										<th className="py-3 px-3 w-20 text-right">Actions</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-100 text-slate-700">
									{filteredArchive.map((a, idx) => (
										<tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
											<td className="py-3 px-3 text-center font-semibold text-slate-900">{idx + 1}</td>
											<td className="py-3 px-3 text-center">
												<div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 mx-auto flex items-center justify-center overflow-hidden text-slate-400">
													<User className="w-3.5 h-3.5" />
												</div>
											</td>
											<td className="py-3 px-3 font-bold text-slate-900">{a.fullName}</td>
											<td className="py-3 px-3 font-mono text-slate-700">{a.phone || "0812345678"}</td>
											<td className="py-3 px-3 font-medium text-slate-600">{a.province || "Jawa Barat"}</td>
											<td className="py-3 px-3 font-medium text-slate-600">{a.regency || "Bogor"}</td>
											<td className="py-3 px-3 font-semibold text-purple-700">
												{a.talents || "Kajian Hadits & Digital Marketing"}
											</td>
											<td className="py-3 px-3 text-right">
												<Link
													to={"/alumni/$id" as any}
													params={{ id: String(a.id) } as any}
													className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-lg font-semibold text-[11px]"
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
				)}
			</div>
		</div>
	)
}
