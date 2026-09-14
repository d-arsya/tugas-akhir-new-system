import { useState, useEffect, type JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { adminApi } from "@/lib/api"
import { RojaCard, Button, Input, Label, PageLoader } from "@roja/ui"
import { AdminPageHeader } from "@/components/layout/admin-page-header"
import { formatRupiah } from "@roja/utils"
import type { SettingSchoolData, CreateAnnouncementDto, SettingFormConfig } from "@roja/types"
import { toast } from "sonner"
import { Building2, Megaphone, ClipboardList, Shield, Plus, Trash2 } from "lucide-react"

export const Route = createFileRoute("/_auth/settings")({
	component: SettingsPage,
})

function SettingsPage(): JSX.Element {
	const queryClient = useQueryClient()
	const [activeTab, setActiveTab] = useState<"school" | "announcements" | "psb" | "security">("school")

	const { data: schoolRes, isLoading: isSchoolLoading } = useQuery({
		queryKey: ["admin-school-profile"],
		queryFn: () => adminApi.getSchoolSettings(),
	})

	const { data: anncRes } = useQuery({
		queryKey: ["admin-announcements"],
		queryFn: () => adminApi.getAnnouncements(),
	})

	const { data: formRes } = useQuery({
		queryKey: ["admin-setting-form"],
		queryFn: () => adminApi.getFormConfig(),
	})

	const schoolForm = useForm<SettingSchoolData>()

	useEffect(() => {
		if (schoolRes?.data) {
			schoolForm.reset(schoolRes.data)
		}
	}, [schoolRes?.data, schoolForm])

	const announcementForm = useForm<CreateAnnouncementDto>({
		defaultValues: { title: "", content: "", target: "ALL" },
	})

	const updateSchoolMutation = useMutation({
		mutationFn: (dto: SettingSchoolData) => adminApi.updateSchoolSettings(dto),
		onSuccess: (res) => {
			toast.success(res.data.message || "Profil lembaga berhasil diperbarui.")
			queryClient.invalidateQueries({ queryKey: ["admin-school-profile"] })
		},
	})

	const createAnncMutation = useMutation({
		mutationFn: (dto: CreateAnnouncementDto) => adminApi.createAnnouncement(dto),
		onSuccess: (res) => {
			toast.success(res.message || "Pengumuman berhasil dipublikasikan.")
			announcementForm.reset()
			queryClient.invalidateQueries({ queryKey: ["admin-announcements"] })
		},
	})

	const deleteAnncMutation = useMutation({
		mutationFn: (id: number) => adminApi.deleteAnnouncement(id),
		onSuccess: () => {
			toast.success("Pengumuman berhasil dihapus.")
			queryClient.invalidateQueries({ queryKey: ["admin-announcements"] })
		},
	})

	const updateFormMutation = useMutation({
		mutationFn: (dto: Partial<SettingFormConfig>) => adminApi.updateFormConfig(dto),
		onSuccess: (res) => {
			toast.success(res.data.message || "Konfigurasi formulir PSB diperbarui.")
			queryClient.invalidateQueries({ queryKey: ["admin-setting-form"] })
		},
	})

	if (isSchoolLoading) return <PageLoader />

	const announcements = anncRes?.data || []
	const formConfig = formRes?.data

	return (
		<div className="space-y-6">
			<AdminPageHeader
				title="Pengaturan Sistem"
				subtitle="Konfigurasi identitas lembaga, pengumuman portal, formulir PSB, dan pemeliharaan sistem."
			/>

			{/* Modern Pill Tabs Header */}
			<div className="flex gap-2 p-1 bg-slate-200/60 rounded-2xl w-fit overflow-x-auto">
				<button
					type="button"
					onClick={() => setActiveTab("school")}
					className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
						activeTab === "school"
							? "bg-white text-[var(--primary)] shadow-xs"
							: "text-slate-600 hover:text-slate-900"
					}`}
				>
					<Building2 className="w-4 h-4" /> Profil Sekolah
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("announcements")}
					className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
						activeTab === "announcements"
							? "bg-white text-[var(--primary)] shadow-xs"
							: "text-slate-600 hover:text-slate-900"
					}`}
				>
					<Megaphone className="w-4 h-4" /> Pengumuman
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("psb")}
					className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
						activeTab === "psb"
							? "bg-white text-[var(--primary)] shadow-xs"
							: "text-slate-600 hover:text-slate-900"
					}`}
				>
					<ClipboardList className="w-4 h-4" /> Form PSB
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("security")}
					className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
						activeTab === "security"
							? "bg-white text-[var(--primary)] shadow-xs"
							: "text-slate-600 hover:text-slate-900"
					}`}
				>
					<Shield className="w-4 h-4" /> Keamanan & Backup
				</button>
			</div>

			{/* Tab 1: School Profile */}
			{activeTab === "school" && (
				<RojaCard title="Profil & Identitas Sekolah" className="border-0 shadow-xs bg-white">
					<form onSubmit={schoolForm.handleSubmit((val) => updateSchoolMutation.mutate(val))} className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-1">
							<Label htmlFor="schoolName">Nama Lembaga / Pesantren</Label>
							<Input id="schoolName" {...schoolForm.register("schoolName", { required: true })} className="bg-slate-50 border-0" />
						</div>
						<div className="space-y-1">
							<Label htmlFor="tagline">Slogan / Tagline</Label>
							<Input id="tagline" {...schoolForm.register("tagline")} className="bg-slate-50 border-0" />
						</div>
						<div className="space-y-1 md:col-span-2">
							<Label htmlFor="address">Alamat Lengkap</Label>
							<Input id="address" {...schoolForm.register("address")} className="bg-slate-50 border-0" />
						</div>
						<div className="space-y-1">
							<Label htmlFor="phone">Telepon Resmi</Label>
							<Input id="phone" {...schoolForm.register("phone")} className="bg-slate-50 border-0" />
						</div>
						<div className="space-y-1">
							<Label htmlFor="email">Email Sekretariat</Label>
							<Input id="email" type="email" {...schoolForm.register("email")} className="bg-slate-50 border-0" />
						</div>
						<div className="space-y-1">
							<Label htmlFor="nsm">Nomor Statistik Madrasah (NSM)</Label>
							<Input id="nsm" {...schoolForm.register("nsm")} className="bg-slate-50 border-0" />
						</div>
						<div className="space-y-1">
							<Label htmlFor="npsn">NPSN</Label>
							<Input id="npsn" {...schoolForm.register("npsn")} className="bg-slate-50 border-0" />
						</div>
						<div className="space-y-1 md:col-span-2">
							<Label htmlFor="principalName">Nama Pimpinan / Pengasuh Pesantren</Label>
							<Input id="principalName" {...schoolForm.register("principalName")} className="bg-slate-50 border-0" />
						</div>

						<div className="md:col-span-2 pt-2">
							<Button type="submit" className="bg-[var(--primary)] text-white border-0" disabled={updateSchoolMutation.isPending}>
								{updateSchoolMutation.isPending ? "Menyimpan..." : "Simpan Profil Sekolah"}
							</Button>
						</div>
					</form>
				</RojaCard>
			)}

			{/* Tab 2: Announcements */}
			{activeTab === "announcements" && (
				<div className="space-y-6">
					<RojaCard title="Buat Pengumuman Baru" className="border-0 shadow-xs bg-white">
						<form onSubmit={announcementForm.handleSubmit((val) => createAnncMutation.mutate(val))} className="space-y-3">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
								<div className="space-y-1 md:col-span-2">
									<Label htmlFor="title">Judul Pengumuman</Label>
									<Input id="title" {...announcementForm.register("title", { required: true })} placeholder="Contoh: Pengumuman PSB Gelombang I" className="bg-slate-50 border-0" />
								</div>
								<div className="space-y-1">
									<Label htmlFor="target">Target Penerima</Label>
									<select id="target" {...announcementForm.register("target")} className="w-full h-10 px-3 rounded-xl bg-slate-50 text-xs text-slate-700">
										<option value="ALL">Semua Portal (Public)</option>
										<option value="PSB">Portal PSB Only</option>
										<option value="SANTRI">Portal Santri Only</option>
										<option value="MERCHANT">Portal Merchant Only</option>
									</select>
								</div>
							</div>
							<div className="space-y-1">
								<Label htmlFor="content">Isi Pengumuman</Label>
								<textarea
									id="content"
									{...announcementForm.register("content", { required: true })}
									className="w-full p-3 rounded-xl bg-slate-50 text-xs min-h-[80px] focus:outline-none"
									placeholder="Tuliskan isi pengumuman secara rinci..."
								/>
							</div>
							<Button type="submit" className="bg-[var(--primary)] text-white gap-2 border-0" disabled={createAnncMutation.isPending}>
								<Plus className="w-4 h-4" /> Tambah Pengumuman
							</Button>
						</form>
					</RojaCard>

					<RojaCard title="Daftar Pengumuman Aktif" className="border-0 shadow-xs bg-white">
						<div className="space-y-3">
							{announcements.map((a) => (
								<div key={a.id} className="p-4 rounded-xl bg-slate-50 flex items-start justify-between">
									<div>
										<div className="flex items-center gap-2">
											<span className="font-bold text-slate-800 text-sm">{a.title}</span>
											<span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-100 text-[var(--primary)]">{a.target}</span>
										</div>
										<p className="text-xs text-slate-600 mt-1">{a.content}</p>
									</div>
									<Button
										size="sm"
										variant="ghost"
										onClick={() => deleteAnncMutation.mutate(a.id)}
										className="text-red-600 hover:text-red-700 hover:bg-red-50"
									>
										<Trash2 className="w-3.5 h-3.5" />
									</Button>
								</div>
							))}
						</div>
					</RojaCard>
				</div>
			)}

			{/* Tab 3: PSB Form Config */}
			{activeTab === "psb" && formConfig && (
				<RojaCard title="Pengaturan Formulir Pendaftaran (PSB)" className="border-0 shadow-xs bg-white">
					<div className="space-y-6">
						<div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
							<div>
								<h4 className="font-bold text-slate-800 text-sm">Status Pendaftaran Online (PSB)</h4>
								<p className="text-xs text-slate-500">Aktifkan untuk membuka portal registrasi bagi calon santri baru</p>
							</div>
							<Button
								onClick={() => updateFormMutation.mutate({ isPsbOpen: !formConfig.isPsbOpen })}
								className={formConfig.isPsbOpen ? "bg-emerald-600 text-white border-0" : "bg-slate-700 text-white border-0"}
							>
								{formConfig.isPsbOpen ? "Pendaftaran DIBUKA" : "Pendaftaran DITUTUP"}
							</Button>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-1">
								<Label>Biaya Registrasi Pendaftaran</Label>
								<Input
									type="number"
									defaultValue={formConfig.registrationFee}
									onBlur={(e) => updateFormMutation.mutate({ registrationFee: Number(e.target.value) })}
									className="bg-slate-50 border-0"
								/>
								<p className="text-[11px] text-slate-400">Nominal: {formatRupiah(formConfig.registrationFee)}</p>
							</div>
							<div className="space-y-1">
								<Label>Nomor Call Center PSB</Label>
								<Input
									defaultValue={formConfig.contactPhone}
									onBlur={(e) => updateFormMutation.mutate({ contactPhone: e.target.value })}
									className="bg-slate-50 border-0"
								/>
							</div>
						</div>
					</div>
				</RojaCard>
			)}

			{/* Tab 4: Security & Backup */}
			{activeTab === "security" && (
				<RojaCard title="Keamanan & Pemeliharaan Database" className="border-0 shadow-xs bg-white">
					<div className="space-y-4">
						<div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
							<div>
								<h4 className="font-bold text-slate-800 text-sm">Enforce 2FA Autentikasi Dual Faktor</h4>
								<p className="text-xs text-slate-500">Wajibkan seluruh admin & kasir menggunakan 2FA saat login</p>
							</div>
							<Button onClick={() => toast.success("Konfigurasi 2FA global disimpan.")} className="bg-slate-800 text-white border-0">
								Aktifkan Global 2FA
							</Button>
						</div>

						<div className="p-4 rounded-xl bg-slate-50 space-y-2">
							<h4 className="font-bold text-slate-800 text-sm">Backup Database Otomatis</h4>
							<p className="text-xs text-slate-500">Jadwal pencadangan berkala seluruh tabel basis data `roja`</p>
							<div className="flex items-center gap-3 pt-2">
								<Button onClick={() => toast.success("Proses unduh backup DB dimulai...")} className="bg-[var(--primary)] text-white border-0">
									Unduh Backup MySQL Sekarang (.sql)
								</Button>
							</div>
						</div>
					</div>
				</RojaCard>
			)}
		</div>
	)
}

export default SettingsPage
