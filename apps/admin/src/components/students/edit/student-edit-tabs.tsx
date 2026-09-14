import type { JSX } from "react"
import { useState } from "react"
import { User, ShieldCheck, Users, HeartHandshake, Paperclip, Lock, Plus, Trash2 } from "lucide-react"
import { Input } from "@roja/ui"

interface StudentEditTabsProps {
	student: any
}

export function StudentEditTabs({ student }: StudentEditTabsProps): JSX.Element {
	const [activeTab, setActiveTab] = useState<"personal" | "identity" | "family" | "guardian" | "attachment" | "account">("personal")

	// Disease History Repeater state
	const [diseases, setDiseases] = useState<Array<{ name: string; status: string }>>([
		{ name: "Asma / Sesak Napas", status: "Sembuh Total" },
	])

	const addDisease = () => {
		setDiseases([...diseases, { name: "", status: "Dalam Pengobatan" }])
	}

	const removeDisease = (idx: number) => {
		setDiseases(diseases.filter((_, i) => i !== idx))
	}

	const tabs = [
		{ id: "personal", label: "Personal", icon: User },
		{ id: "identity", label: "Identitas", icon: ShieldCheck },
		{ id: "family", label: "Keluarga", icon: Users },
		{ id: "guardian", label: "Wali", icon: HeartHandshake },
		{ id: "attachment", label: "Lampiran", icon: Paperclip },
		{ id: "account", label: "Akun", icon: Lock },
	]

	return (
		<div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
			{/* Nav Tabs Bar */}
			<div className="flex flex-wrap border-b border-slate-200 bg-slate-50/80 p-2 gap-1">
				{tabs.map((t) => {
					const Icon = t.icon
					const isActive = activeTab === t.id
					return (
						<button
							key={t.id}
							type="button"
							onClick={() => setActiveTab(t.id as any)}
							className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
								isActive
									? "bg-[var(--primary)] text-white shadow-2xs"
									: "text-slate-600 hover:bg-slate-200/60"
							}`}
						>
							<Icon className="w-3.5 h-3.5" />
							{t.label}
						</button>
					)
				})}
			</div>

			{/* Tab Contents */}
			<div className="p-5 text-xs space-y-4">
				{/* 1. Tab Personal */}
				{activeTab === "personal" && (
					<div className="space-y-4 animate-in fade-in">
						<h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
							Biodata Lengkap Santri & Alamat
						</h5>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<div>
								<label className="font-semibold text-slate-700 block mb-1">Nama Lengkap</label>
								<Input
									type="text"
									defaultValue={student?.fullName || "Ahmad Fauzi Al-Attas"}
									className="w-full text-xs"
								/>
							</div>
							<div>
								<label className="font-semibold text-slate-700 block mb-1">Nama Panggilan</label>
								<Input
									type="text"
									defaultValue="Fauzi"
									className="w-full text-xs"
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
							<div>
								<label className="font-semibold text-slate-700 block mb-1">Tempat Lahir</label>
								<Input
									type="text"
									defaultValue="Jakarta"
									className="w-full text-xs"
								/>
							</div>
							<div>
								<label className="font-semibold text-slate-700 block mb-1">Tanggal Lahir</label>
								<Input
									type="date"
									defaultValue="2010-08-15"
									className="w-full text-xs"
								/>
							</div>
							<div>
								<label className="font-semibold text-slate-700 block mb-1">Jenis Kelamin</label>
								<select
									defaultValue="L"
									className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[var(--secondary)] outline-hidden"
								>
									<option value="L">Laki-laki</option>
									<option value="P">Perempuan</option>
								</select>
							</div>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<div>
								<label className="font-semibold text-slate-700 block mb-1">No. HP Santri</label>
								<Input
									type="text"
									defaultValue="081234567890"
									className="w-full font-mono text-xs"
								/>
							</div>
							<div>
								<label className="font-semibold text-slate-700 block mb-1">Cita-cita</label>
								<Input
									type="text"
									defaultValue="Ulama / Pengusaha"
									className="w-full text-xs"
								/>
							</div>
						</div>

						<div>
							<label className="font-semibold text-slate-700 block mb-1">Alamat Tinggal Lengkap</label>
							<textarea
								rows={2}
								defaultValue="Jl. Raya Pondok Roja No. 45, RT 02 / RW 05"
								className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[var(--secondary)] outline-hidden"
							/>
						</div>

						{/* Disease History Repeater */}
						<div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
							<div className="flex items-center justify-between">
								<span className="font-bold text-slate-800 text-xs">Riwayat Penyakit Khusus</span>
								<button
									type="button"
									onClick={addDisease}
									className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--primary)] hover:underline"
								>
									<Plus className="w-3.5 h-3.5" /> Tambah Penyakit
								</button>
							</div>
							{diseases.map((d, idx) => (
								<div key={idx} className="flex items-center gap-2">
									<Input
										type="text"
										value={d.name}
										onChange={(e) => {
											const copy = [...diseases]
											if (copy[idx]) copy[idx].name = e.target.value
											setDiseases(copy)
										}}
										placeholder="Nama penyakit..."
										className="flex-1 text-xs"
									/>
									<Input
										type="text"
										value={d.status}
										onChange={(e) => {
											const copy = [...diseases]
											if (copy[idx]) copy[idx].status = e.target.value
											setDiseases(copy)
										}}
										placeholder="Status penyakit..."
										className="flex-1 text-xs"
									/>
									<button
										type="button"
										onClick={() => removeDisease(idx)}
										className="p-1 text-red-500 hover:text-red-700"
									>
										<Trash2 className="w-4 h-4" />
									</button>
								</div>
							))}
						</div>
					</div>
				)}

				{/* 2. Tab Identitas */}
				{activeTab === "identity" && (
					<div className="space-y-4 animate-in fade-in">
						<h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
							Nomor Identitas Kependudukan & Bantuan
						</h5>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<div>
								<label className="font-semibold text-slate-700 block mb-1">NIK Santri (16 Digit)</label>
								<Input
									type="text"
									defaultValue="3171000000000001"
									className="w-full font-mono text-xs"
								/>
							</div>
							<div>
								<label className="font-semibold text-slate-700 block mb-1">No. Kartu Keluarga (KK)</label>
								<Input
									type="text"
									defaultValue="3171000000000002"
									className="w-full font-mono text-xs"
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<div>
								<label className="font-semibold text-slate-700 block mb-1">No. Akta Kelahiran</label>
								<Input
									type="text"
									defaultValue="1234/AKTA/2010"
									className="w-full font-mono text-xs"
								/>
							</div>
							<div>
								<label className="font-semibold text-slate-700 block mb-1">Agama</label>
								<Input
									type="text"
									defaultValue="Islam"
									disabled
									className="w-full font-semibold text-slate-600"
								/>
							</div>
						</div>
					</div>
				)}

				{/* 3. Tab Keluarga */}
				{activeTab === "family" && (
					<div className="space-y-4 animate-in fade-in">
						<h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
							Data Ayah & Ibu Kandung
						</h5>

						<div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
							<span className="font-bold text-slate-800 block text-xs">Data Ayah Kandung</span>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<div>
									<label className="font-semibold text-slate-700 block mb-1">Nama Ayah</label>
									<Input
										type="text"
										defaultValue="Abdullah Ahmad"
										className="w-full text-xs"
									/>
								</div>
								<div>
									<label className="font-semibold text-slate-700 block mb-1">Pekerjaan Ayah</label>
									<Input
										type="text"
										defaultValue="Wiraswasta / Pedagang"
										className="w-full text-xs"
									/>
								</div>
							</div>
						</div>

						<div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
							<span className="font-bold text-slate-800 block text-xs">Data Ibu Kandung</span>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<div>
									<label className="font-semibold text-slate-700 block mb-1">Nama Ibu</label>
									<Input
										type="text"
										defaultValue="Fatimah Az-Zahra"
										className="w-full text-xs"
									/>
								</div>
								<div>
									<label className="font-semibold text-slate-700 block mb-1">Pekerjaan Ibu</label>
									<Input
										type="text"
										defaultValue="Ibu Rumah Tangga"
										className="w-full text-xs"
									/>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* 4. Tab Wali */}
				{activeTab === "guardian" && (
					<div className="space-y-4 animate-in fade-in">
						<h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
							Data Wali Santri
						</h5>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<div>
								<label className="font-semibold text-slate-700 block mb-1">Nama Wali</label>
								<Input
									type="text"
									defaultValue="H. Muhammad Ridwan"
									className="w-full text-xs"
								/>
							</div>
							<div>
								<label className="font-semibold text-slate-700 block mb-1">Hubungan Keluarga</label>
								<Input
									type="text"
									defaultValue="Paman"
									className="w-full text-xs"
								/>
							</div>
						</div>
					</div>
				)}

				{/* 5. Tab Lampiran */}
				{activeTab === "attachment" && (
					<div className="space-y-4 animate-in fade-in">
						<h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
							Berkas Dokumen Santri
						</h5>
						<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
							{["Kartu Keluarga", "Akta Kelahiran", "KTP Ayah", "KTP Ibu", "Ijazah Terakhir"].map((doc) => (
								<div key={doc} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
									<Paperclip className="w-5 h-5 text-slate-400 mx-auto" />
									<span className="font-semibold text-slate-800 block text-xs">{doc}</span>
									<span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
										Terverifikasi
									</span>
								</div>
							))}
						</div>
					</div>
				)}

				{/* 6. Tab Akun */}
				{activeTab === "account" && (
					<div className="space-y-4 animate-in fade-in">
						<h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
							Akun Login & Kredensial Portal Santri
						</h5>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<div>
								<label className="font-semibold text-slate-700 block mb-1">Email Kredensial</label>
								<Input
									type="email"
									defaultValue="santri.fauzi@pondokroja.com"
									className="w-full text-xs"
								/>
							</div>
							<div>
								<label className="font-semibold text-slate-700 block mb-1">Status Blokir Akun</label>
								<select defaultValue="0" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
									<option value="0">Aktif (Bisa Login)</option>
									<option value="1">Diblokir (Tolak Login)</option>
								</select>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
