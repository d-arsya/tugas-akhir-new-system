import { useState, type JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { adminApi } from "@/lib/api"
import { RojaCard, Button, Input, Label, PageLoader } from "@roja/ui"
import { AdminPageHeader } from "@/components/layout/admin-page-header"
import { toast } from "sonner"
import {
	DollarSign,
	Plus,
	FolderTree,
	HelpCircle,
	CheckCircle2,
	Trash2,
	Edit,
} from "lucide-react"

export const Route = createFileRoute("/_auth/accountancy")({
	component: AccountancyPage,
})

interface AccountFormData {
	name: string
	isParent: boolean
	parentId?: number
	group: "income" | "expense"
	isStudentCost: boolean
	note?: string
}

export function AccountancyPage(): JSX.Element {
	const queryClient = useQueryClient()
	const [isParent, setIsParent] = useState(true)

	// Mock accounts list
	const [accounts, setAccounts] = useState([
		{
			id: 1,
			name: "Pendapatan SPP & Pendidikan",
			isParent: true,
			group: "income",
			isStudentCost: true,
			childrenCount: 3,
			note: "Akun induk tagihan bulanan santri",
		},
		{
			id: 2,
			name: "Pendapatan Uang Masuk PSB",
			isParent: true,
			group: "income",
			isStudentCost: true,
			childrenCount: 2,
			note: "Akun induk pendaftaran santri baru",
		},
		{
			id: 3,
			name: "Belanja Dapur & Katering",
			isParent: false,
			parentId: 10,
			parentName: "Biaya Operasional Pondok",
			group: "expense",
			isStudentCost: false,
			childrenCount: 0,
			note: "Logistik beras dan sayur santri",
		},
		{
			id: 4,
			name: "Honor & Gaji Pengajar",
			isParent: false,
			parentId: 10,
			parentName: "Biaya Operasional Pondok",
			group: "expense",
			isStudentCost: false,
			childrenCount: 0,
			note: "Gaji rutin asatidz bulanan",
		},
	])

	const form = useForm<AccountFormData>({
		defaultValues: {
			name: "",
			isParent: true,
			group: "income",
			isStudentCost: false,
			note: "",
		},
	})

	const handleSave = (data: AccountFormData) => {
		const newAccount = {
			id: accounts.length + 1,
			name: data.name,
			isParent: isParent,
			group: data.group,
			isStudentCost: data.isStudentCost,
			childrenCount: 0,
			note: data.note,
		}
		setAccounts([...accounts, newAccount])
		toast.success(`Akun "${data.name}" berhasil ditambahkan`)
		form.reset()
		setIsParent(true)
	}

	const handleDelete = (id: number) => {
		setAccounts(accounts.filter((a) => a.id !== id))
		toast.success("Akun berhasil dihapus")
	}

	return (
		<div className="space-y-6">
			<AdminPageHeader
				title="Akun Keuangan"
				subtitle="Daftar akun buku besar pembukuan keuangan pondok (Chart of Accounts)"
			/>

			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
				{/* Left Column: Form Tambah Akun */}
				<div className="lg:col-span-5">
					<RojaCard className="p-6 bg-white shadow-xs border-0 rounded-2xl space-y-4">
						<div className="border-b border-slate-100 pb-3">
							<h5 className="font-bold text-slate-900 text-sm flex items-center gap-2">
								<Plus className="w-4 h-4 text-[var(--primary)]" /> Tambah Akun
							</h5>
							<p className="text-xs text-slate-500 mt-1">
								Silakan tambahkan akun baru pada formulir di bawah ini.
							</p>
						</div>

						<form onSubmit={form.handleSubmit(handleSave)} className="space-y-4 text-xs">
							<div>
								<Label className="flex items-center justify-between">
									<span>Nama Akun</span>
									<span className="text-[10px] text-pink-600 font-semibold">required</span>
								</Label>
								<Input
									{...form.register("name", { required: true })}
									placeholder="cth: Biaya Listrik & Air"
									className="mt-1"
								/>
							</div>

							<div>
								<Label className="block mb-2 font-semibold">Terapkan Sebagai</Label>
								<div className="flex items-center gap-4">
									<label className="flex items-center gap-2 cursor-pointer">
										<input
											type="radio"
											name="isParentRadio"
											checked={isParent}
											onChange={() => setIsParent(true)}
											className="text-[var(--primary)]"
										/>
										<span className="font-medium text-slate-700">Induk Akun</span>
									</label>
									<label className="flex items-center gap-2 cursor-pointer">
										<input
											type="radio"
											name="isParentRadio"
											checked={!isParent}
											onChange={() => setIsParent(false)}
											className="text-[var(--primary)]"
										/>
										<span className="font-medium text-slate-700">Anak Akun</span>
									</label>
								</div>
							</div>

							{/* Child specifics */}
							{!isParent && (
								<div className="p-3 bg-slate-50 rounded-xl space-y-3 border border-slate-100 animate-in fade-in">
									<div>
										<Label>Pilih Induk Akun</Label>
										<select
											{...form.register("parentId")}
											className="w-full mt-1 px-3 py-2 bg-white rounded-xl text-xs border border-slate-200"
										>
											{accounts
												.filter((a) => a.isParent)
												.map((a) => (
													<option key={a.id} value={a.id}>
														{a.name}
													</option>
												))}
										</select>
									</div>

									<div>
										<Label className="block mb-1.5 font-semibold">Pengelompokan</Label>
										<div className="flex items-center gap-4">
											<label className="flex items-center gap-1.5 cursor-pointer">
												<input
													type="radio"
													value="income"
													{...form.register("group")}
													className="text-emerald-600"
												/>
												<span className="text-slate-700">Pemasukan</span>
											</label>
											<label className="flex items-center gap-1.5 cursor-pointer">
												<input
													type="radio"
													value="expense"
													{...form.register("group")}
													className="text-rose-600"
												/>
												<span className="text-slate-700">Pengeluaran</span>
											</label>
										</div>
									</div>

									<label className="flex items-center gap-2 pt-1 cursor-pointer">
										<input
											type="checkbox"
											{...form.register("isStudentCost")}
											className="rounded text-[var(--primary)]"
										/>
										<span className="text-slate-700 font-medium">
											Tetapkan sebagai biaya santri
										</span>
									</label>
								</div>
							)}

							<div>
								<Label className="flex items-center justify-between">
									<span>Keterangan</span>
									<span className="text-[10px] text-slate-400">optional</span>
								</Label>
								<Input
									{...form.register("note")}
									placeholder="Catatan tambahan..."
									className="mt-1"
								/>
							</div>

							<div className="flex justify-end pt-2">
								<Button type="submit" className="bg-[var(--primary)] text-white w-full">
									Simpan Akun
								</Button>
							</div>
						</form>
					</RojaCard>
				</div>

				{/* Right Column: Datatable Akun */}
				<div className="lg:col-span-7">
					<RojaCard className="bg-white shadow-xs border-0 rounded-2xl overflow-hidden">
						<div className="p-4 border-b border-slate-100 flex items-center justify-between">
							<h5 className="font-bold text-slate-900 text-sm flex items-center gap-2">
								<FolderTree className="w-4 h-4 text-slate-500" /> Daftar Akun Terdaftar
							</h5>
						</div>

						<div className="overflow-x-auto">
							<table className="w-full text-left text-xs">
								<thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-100">
									<tr>
										<th className="p-4 w-10">No</th>
										<th className="p-4">Nama Akun</th>
										<th className="p-4">Tipe</th>
										<th className="p-4">Pengelompokan</th>
										<th className="p-4 text-right">Aksi</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-100 text-slate-700">
									{accounts.map((item, idx) => (
										<tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
											<td className="p-4 font-semibold text-slate-900">{idx + 1}</td>
											<td className="p-4">
												<div className="font-semibold text-slate-900">{item.name}</div>
												{item.note && (
													<div className="text-[10px] text-slate-400 mt-0.5">{item.note}</div>
												)}
											</td>
											<td className="p-4">
												<span
													className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
														item.isParent
															? "bg-indigo-50 text-indigo-700"
															: "bg-slate-100 text-slate-600"
													}`}
												>
													{item.isParent ? "Induk Akun" : "Anak Akun"}
												</span>
											</td>
											<td className="p-4">
												<span
													className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
														item.group === "income"
															? "bg-emerald-50 text-emerald-700"
															: "bg-rose-50 text-rose-700"
													}`}
												>
													{item.group === "income" ? "Pemasukan" : "Pengeluaran"}
												</span>
											</td>
											<td className="p-4 text-right">
												<button
													type="button"
													onClick={() => handleDelete(item.id)}
													className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
													title="Hapus Akun"
												>
													<Trash2 className="w-3.5 h-3.5" />
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</RojaCard>
				</div>
			</div>
		</div>
	)
}
