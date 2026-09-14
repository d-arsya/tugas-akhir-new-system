import { type JSX } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { RojaCard, Button, Input, Label } from "@roja/ui"
import { AdminPageHeader } from "@/components/layout/admin-page-header"
import { toast } from "sonner"
import { Calendar, ArrowLeft, Save } from "lucide-react"

export const Route = createFileRoute("/_auth/academic-years/create")({
	component: CreateAcademicYearPage,
})

function CreateAcademicYearPage(): JSX.Element {
	const navigate = useNavigate()

	const form = useForm({
		defaultValues: {
			year: "2027/2028",
			semester: "Ganjil",
			startDate: "2027-07-15",
			endDate: "2027-12-20",
			isActive: false,
		},
	})

	const handleSave = (data: any) => {
		toast.success(`Tahun Ajaran ${data.year} (${data.semester}) berhasil ditambahkan!`)
		navigate({ to: "/academic-years" as any })
	}

	return (
		<div className="space-y-6">
			<AdminPageHeader
				title="Tambah Tahun Ajaran Baru"
				subtitle="Pengaturan periode kalender akademik dan penetapan status semester aktif"
				actions={
					<Button
						variant="outline"
						onClick={() => navigate({ to: "/academic-years" as any })}
						className="gap-2 bg-white text-xs"
					>
						<ArrowLeft className="w-4 h-4" /> Kembali
					</Button>
				}
			/>

			<RojaCard className="p-6 bg-white shadow-xs border-0 rounded-2xl max-w-lg mx-auto space-y-4">
				<h5 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 flex items-center gap-2">
					<Calendar className="w-4 h-4 text-[var(--primary)]" /> Periode Akademik
				</h5>

				<form onSubmit={form.handleSubmit(handleSave)} className="space-y-4 text-xs">
					<div>
						<Label>Tahun Ajaran</Label>
						<Input {...form.register("year")} required placeholder="cth: 2027/2028" className="mt-1 text-xs" />
					</div>

					<div>
						<Label>Semester</Label>
						<select {...form.register("semester")} className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-xl text-xs border border-slate-200">
							<option value="Ganjil">Ganjil</option>
							<option value="Genap">Genap</option>
						</select>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label>Tanggal Mulai KBM</Label>
							<Input type="date" {...form.register("startDate")} required className="mt-1 text-xs" />
						</div>
						<div>
							<Label>Tanggal Selesai KBM</Label>
							<Input type="date" {...form.register("endDate")} required className="mt-1 text-xs" />
						</div>
					</div>

					<label className="flex items-center gap-2 pt-2 cursor-pointer">
						<input type="checkbox" {...form.register("isActive")} className="rounded text-[var(--primary)]" />
						<span className="font-semibold text-slate-800">Set sebagai Tahun Ajaran Aktif Sekarang</span>
					</label>

					<div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
						<Button type="button" variant="outline" onClick={() => navigate({ to: "/academic-years" as any })}>
							Batal
						</Button>
						<Button type="submit" className="bg-[var(--primary)] text-white gap-2">
							<Save className="w-4 h-4" /> Simpan Tahun Ajaran
						</Button>
					</div>
				</form>
			</RojaCard>
		</div>
	)
}
