import { useState, type JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { adminApi } from "@/lib/api"
import { RojaCard, Button, Input, Label, PageLoader } from "@roja/ui"
import { AdminPageHeader } from "@/components/layout/admin-page-header"
import type { StudentInvoiceItem, BulkGenerateInvoiceDto, AddInvoiceTransactionDto } from "@roja/types"
import { formatRupiah } from "@roja/utils"
import { toast } from "sonner"
import { Plus, Search, DollarSign, Printer, Eye, X, CheckCircle2, AlertCircle } from "lucide-react"

export const Route = createFileRoute("/_auth/student-invoices")({
	component: StudentInvoicesPage,
})

function StudentInvoicesPage(): JSX.Element {
	const queryClient = useQueryClient()
	const [search, setSearch] = useState("")
	const [statusFilter, setStatusFilter] = useState("ALL")
	const [showBulkModal, setShowBulkModal] = useState(false)
	const [selectedInvoice, setSelectedInvoice] = useState<StudentInvoiceItem | null>(null)
	const [receiptInvoice, setReceiptInvoice] = useState<StudentInvoiceItem | null>(null)

	const { data, isLoading } = useQuery({
		queryKey: ["admin-invoices", search, statusFilter],
		queryFn: () =>
			adminApi.getInvoices({
				...(search ? { search } : {}),
				...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
			}),
	})

	const bulkForm = useForm<BulkGenerateInvoiceDto>({
		defaultValues: { gradeName: "Kelas 7", costTermName: "SPP Oktober 2026", dueDate: "2026-10-10" },
	})

	const payForm = useForm<AddInvoiceTransactionDto>({
		defaultValues: { amount: 650000, paymentMethod: "TUNAI_KASIR", notes: "Lunas di kasir utama" },
	})

	const bulkMutation = useMutation({
		mutationFn: (dto: BulkGenerateInvoiceDto) => adminApi.bulkGenerateInvoices(dto),
		onSuccess: (res) => {
			toast.success(res.message)
			queryClient.invalidateQueries({ queryKey: ["admin-invoices"] })
			setShowBulkModal(false)
		},
	})

	const payMutation = useMutation({
		mutationFn: ({ id, dto }: { id: number; dto: AddInvoiceTransactionDto }) =>
			adminApi.addInvoiceTransaction(id, dto),
		onSuccess: (res) => {
			toast.success(res.message)
			queryClient.invalidateQueries({ queryKey: ["admin-invoices"] })
			queryClient.invalidateQueries({ queryKey: ["admin-student-transactions"] })
			setSelectedInvoice(null)
		},
	})

	const invoices = data?.data?.items || []

	if (isLoading) return <PageLoader />

	return (
		<div className="space-y-6">
			<AdminPageHeader
				title="Tagihan & Invoice Santri"
				subtitle="Penerbitan tagihan massal, kasir penerimaan pembayaran (Tunai, Transfer, E-Wallet), dan kwitansi resmi"
				actions={
					<Button
						onClick={() => setShowBulkModal(true)}
						className="gap-2 bg-[var(--primary)] text-white hover:bg-emerald-700"
					>
						<Plus className="w-4 h-4" />
						Generate Tagihan Massal
					</Button>
				}
			/>

			{/* Filter Toolbar */}
			<RojaCard className="p-4 bg-white shadow-xs border-0 rounded-2xl">
				<div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
					<div className="w-full sm:w-80">
						<Input
							placeholder="Cari No. Invoice / Nama Santri..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="bg-slate-50 border-0"
						/>
					</div>

					<div className="flex items-center gap-2">
						{["ALL", "UNPAID", "PARTIAL", "PAID"].map((st) => (
							<button
								key={st}
								type="button"
								onClick={() => setStatusFilter(st)}
								className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
									statusFilter === st
										? "bg-[var(--primary)] text-white"
										: "bg-slate-100 text-slate-600 hover:bg-slate-200"
								}`}
							>
								{st}
							</button>
						))}
					</div>
				</div>
			</RojaCard>

			{/* Datatable */}
			<RojaCard className="bg-white shadow-xs border-0 rounded-2xl overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left text-xs">
						<thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-100">
							<tr>
								<th className="p-4">No. Invoice</th>
								<th className="p-4">Nama Santri</th>
								<th className="p-4">Kelas</th>
								<th className="p-4">Komponen Tagihan</th>
								<th className="p-4">Total Tagihan</th>
								<th className="p-4">Dibayar</th>
								<th className="p-4">Status</th>
								<th className="p-4 text-right">Aksi</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 text-slate-700">
							{invoices.length === 0 ? (
								<tr>
									<td colSpan={8} className="p-8 text-center text-slate-400">
										Tidak ada data tagihan ditemukan.
									</td>
								</tr>
							) : (
								invoices.map((inv: StudentInvoiceItem) => (
									<tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
										<td className="p-4 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
										<td className="p-4 font-semibold text-slate-900">{inv.studentName}</td>
										<td className="p-4 font-medium text-emerald-700">{inv.gradeName}</td>
										<td className="p-4 text-slate-600">{inv.costTermName}</td>
										<td className="p-4 font-bold text-slate-900">{formatRupiah(inv.amount)}</td>
										<td className="p-4 font-semibold text-emerald-600">{formatRupiah(inv.paidAmount)}</td>
										<td className="p-4">
											<span
												className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
													inv.status === "PAID"
														? "bg-emerald-50 text-emerald-700"
														: inv.status === "PARTIAL"
															? "bg-amber-50 text-amber-700"
															: "bg-rose-50 text-rose-700"
												}`}
											>
												{inv.status}
											</span>
										</td>
										<td className="p-4 text-right">
											<div className="flex items-center justify-end gap-1.5">
												<button
													type="button"
													onClick={() => setReceiptInvoice(inv)}
													className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
													title="Lihat / Cetak Kwitansi"
												>
													<Printer className="w-3.5 h-3.5" />
												</button>
												{inv.status !== "PAID" && (
													<Button
														size="sm"
														onClick={() => setSelectedInvoice(inv)}
														className="gap-1 bg-emerald-600 text-white hover:bg-emerald-700 text-xs px-2.5 py-1"
													>
														<DollarSign className="w-3.5 h-3.5" />
														Bayar
													</Button>
												)}
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</RojaCard>

			{/* Bulk Generate Modal */}
			{showBulkModal && (
				<div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
						<div className="flex items-center justify-between border-b border-slate-100 pb-3">
							<h5 className="font-bold text-slate-900 text-base">Generate Tagihan Massal</h5>
							<button onClick={() => setShowBulkModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
						</div>
						<form onSubmit={bulkForm.handleSubmit((d) => bulkMutation.mutate(d))} className="space-y-3">
							<div>
								<Label>Pilih Kelas</Label>
								<Input {...bulkForm.register("gradeName")} required className="mt-1" />
							</div>
							<div>
								<Label>Nama Komponen Biaya</Label>
								<Input {...bulkForm.register("costTermName")} required className="mt-1" />
							</div>
							<div>
								<Label>Jatuh Tempo</Label>
								<Input type="date" {...bulkForm.register("dueDate")} required className="mt-1" />
							</div>
							<div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
								<Button type="button" variant="outline" onClick={() => setShowBulkModal(false)}>
									Batal
								</Button>
								<Button type="submit" disabled={bulkMutation.isPending} className="bg-[var(--primary)] text-white">
									{bulkMutation.isPending ? "Proses..." : "Terbitkan Tagihan"}
								</Button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Pay Invoice Drawer / Modal */}
			{selectedInvoice && (
				<div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
						<div className="flex items-center justify-between border-b border-slate-100 pb-3">
							<h5 className="font-bold text-slate-900 text-base flex items-center gap-2">
								<DollarSign className="w-5 h-5 text-emerald-600" /> Penerimaan Pembayaran Kasir
							</h5>
							<button onClick={() => setSelectedInvoice(null)} className="text-slate-400 hover:text-slate-700">✕</button>
						</div>

						<div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
							<div className="font-mono font-bold text-slate-900">{selectedInvoice.invoiceNumber}</div>
							<div className="text-slate-800 font-semibold">{selectedInvoice.studentName} ({selectedInvoice.gradeName})</div>
							<div className="text-slate-500">{selectedInvoice.costTermName}</div>
							<div className="font-bold text-emerald-600 pt-1 text-sm">
								{formatRupiah(selectedInvoice.amount - selectedInvoice.paidAmount)} sisa tagihan
							</div>
						</div>

						<form
							onSubmit={payForm.handleSubmit((d) => payMutation.mutate({ id: selectedInvoice.id, dto: d }))}
							className="space-y-3"
						>
							<div>
								<Label>Nominal Pembayaran (Rp)</Label>
								<Input
									type="number"
									{...payForm.register("amount", { valueAsNumber: true })}
									required
									className="mt-1 font-bold text-slate-900"
								/>
							</div>
							<div>
								<Label>Metode Pembayaran</Label>
								<select {...payForm.register("paymentMethod")} className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-xl text-xs">
									<option value="TUNAI_KASIR">Tunai di Meja Kasir</option>
									<option value="EWALLET">Potong Saldo E-Wallet Santri</option>
									<option value="BANK_TRANSFER">Transfer Bank / VA Syariah</option>
								</select>
							</div>
							<div>
								<Label>Catatan Transaksi</Label>
								<Input {...payForm.register("notes")} placeholder="cth: Lunas kasir utama" className="mt-1" />
							</div>
							<div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
								<Button type="button" variant="outline" onClick={() => setSelectedInvoice(null)}>
									Batal
								</Button>
								<Button type="submit" disabled={payMutation.isPending} className="bg-emerald-600 text-white hover:bg-emerald-700">
									{payMutation.isPending ? "Menyimpan..." : "Catat & Terbitkan Kwitansi"}
								</Button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Receipt Printable Preview Modal */}
			{receiptInvoice && (
				<div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
						<div className="flex items-center justify-between border-b border-slate-100 pb-3">
							<div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
								<Printer className="w-4 h-4 text-emerald-600" /> Kwitansi Resmi Pembayaran
							</div>
							<button onClick={() => setReceiptInvoice(null)} className="text-slate-400 hover:text-slate-700">✕</button>
						</div>

						<div className="p-6 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-4 font-sans text-xs">
							<div className="text-center pb-3 border-b border-slate-200">
								<div className="font-bold text-sm text-slate-900 tracking-wide uppercase">PONDOK PESANTREN ROJA ISLAMIYYAH</div>
								<div className="text-[10px] text-slate-500">Bukti Pembayaran Tagihan Keuangan Santri</div>
								<div className="font-mono font-bold text-slate-900 text-xs mt-1">{receiptInvoice.invoiceNumber}</div>
							</div>

							<div className="space-y-1.5">
								<div className="flex justify-between">
									<span className="text-slate-400">Nama Santri:</span>
									<span className="font-bold text-slate-900">{receiptInvoice.studentName}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-slate-400">Tingkat Kelas:</span>
									<span className="font-semibold text-slate-800">{receiptInvoice.gradeName}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-slate-400">Komponen Biaya:</span>
									<span className="font-semibold text-slate-800">{receiptInvoice.costTermName}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-slate-400">Status Pembayaran:</span>
									<span className="font-bold text-emerald-700 uppercase">{receiptInvoice.status}</span>
								</div>
							</div>

							<div className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between items-center text-sm font-bold">
								<span>Total Bayar:</span>
								<span className="text-emerald-700">{formatRupiah(receiptInvoice.paidAmount)}</span>
							</div>

							<div className="pt-2 text-[10px] text-slate-400 text-center">
								Dicetak secara otomatis oleh Sistem Manajemen Pondok Roja pada {new Date().toLocaleDateString("id-ID")}.
							</div>
						</div>

						<div className="flex justify-end gap-2 pt-2">
							<Button variant="outline" onClick={() => setReceiptInvoice(null)}>Tutup</Button>
							<Button
								onClick={() => {
									window.print()
									toast.success("Mencetak kwitansi pembayaran...")
								}}
								className="bg-emerald-600 text-white gap-1.5"
							>
								<Printer className="w-4 h-4" /> Cetak Kwitansi
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

