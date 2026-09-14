import { useState, type JSX } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { Input } from "@roja/ui"
import { toast } from "sonner"
import { User, ShieldCheck, Users, HeartHandshake, Paperclip, ArrowLeft, Save, ChevronRight, Check } from "lucide-react"

export const Route = createFileRoute("/_auth/students/create")({
	component: CreateStudentPage,
})

export function CreateStudentPage(): JSX.Element {
	const navigate = useNavigate()
	const [activeStep, setActiveStep] = useState(1)

	const form = useForm({
		defaultValues: {
			nis: "202607" + Math.floor(100 + Math.random() * 900),
			nisn: "008" + Math.floor(1000000 + Math.random() * 9000000),
			fullName: "",
			gender: "L",
			pob: "Jakarta",
			dob: "2010-01-01",
			nik: "3171000000000001",
			kkNumber: "3171000000000002",
			phone: "081234567890",
			fatherName: "",
			motherName: "",
			guardianName: "",
			previousSchool: "SMP Negeri 1 Bogor",
			gradeId: "7",
			academicYearId: "1",
		},
	})

	const handleSave = (data: any) => {
		toast.success(`Data Santri ${data.fullName || "Baru"} berhasil disimpan!`)
		navigate({ to: "/students" as any })
	}

	const steps = [
		{ step: 1, title: "1. Data Personal", icon: User },
		{ step: 2, title: "2. Data Identitas", icon: ShieldCheck },
		{ step: 3, title: "3. Data Keluarga", icon: Users },
		{ step: 4, title: "4. Data Wali", icon: HeartHandshake },
		{ step: 5, title: "5. Berkas & Penempatan", icon: Paperclip },
	]

	return (
		<div className="space-y-6 animate-in fade-in">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
				<div>
					<h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
						<User className="w-5 h-5 text-[var(--primary)]" />
						Formulir Pendaftaran Santri Baru (5-Langkah Wizard)
					</h2>
					<p className="text-xs text-slate-500 mt-0.5">
						Lengkapi formulir registrasi 5 langkah untuk santri pindahan atau entry manual baru
					</p>
				</div>
				<button
					type="button"
					onClick={() => navigate({ to: "/students" as any })}
					className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors self-start sm:self-auto"
				>
					<ArrowLeft className="w-4 h-4" />
					Kembali
				</button>
			</div>

			{/* Step Navigation Bar */}
			<div className="grid grid-cols-2 md:grid-cols-5 gap-2">
				{steps.map((s) => {
					const Icon = s.icon
					const isActive = activeStep === s.step
					const isDone = activeStep > s.step

					return (
						<button
							key={s.step}
							type="button"
							onClick={() => setActiveStep(s.step)}
							className={`p-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
								isActive
									? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs"
									: isDone
										? "bg-emerald-50 text-emerald-800 border-emerald-200"
										: "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
							}`}
						>
							{isDone ? <Check className="w-4 h-4 text-emerald-600" /> : <Icon className="w-4 h-4" />}
							<span className="truncate">{s.title}</span>
						</button>
					)
				})}
			</div>

			{/* Form Content */}
			<div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
				<form onSubmit={form.handleSubmit(handleSave)} className="space-y-6 text-xs">
					{/* Step 1: Personal */}
					{activeStep === 1 && (
						<div className="space-y-4 animate-in fade-in">
							<h5 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
								Step 1: Biodata Lengkap Santri
							</h5>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="font-semibold text-slate-700 block mb-1">Nomor Induk Santri (NIS)</label>
									<Input {...form.register("nis")} required className="w-full font-mono text-xs" />
								</div>
								<div>
									<label className="font-semibold text-slate-700 block mb-1">NISN (Nomor Induk Santri Nasional)</label>
									<Input {...form.register("nisn")} required className="w-full font-mono text-xs" />
								</div>
							</div>

							<div>
								<label className="font-semibold text-slate-700 block mb-1">Nama Lengkap Santri</label>
								<Input {...form.register("fullName")} required placeholder="cth: Ahmad Fauzi Al-Attas" className="w-full text-xs" />
							</div>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div>
									<label className="font-semibold text-slate-700 block mb-1">Jenis Kelamin</label>
									<select {...form.register("gender")} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
										<option value="L">Laki-laki (Putra)</option>
										<option value="P">Perempuan (Putri)</option>
									</select>
								</div>
								<div>
									<label className="font-semibold text-slate-700 block mb-1">Tempat Lahir</label>
									<Input {...form.register("pob")} required className="w-full text-xs" />
								</div>
								<div>
									<label className="font-semibold text-slate-700 block mb-1">Tanggal Lahir</label>
									<Input type="date" {...form.register("dob")} required className="w-full text-xs" />
								</div>
							</div>
						</div>
					)}

					{/* Step 2: Identitas */}
					{activeStep === 2 && (
						<div className="space-y-4 animate-in fade-in">
							<h5 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
								Step 2: Nomor Identitas Kependudukan (NIK/KK)
							</h5>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="font-semibold text-slate-700 block mb-1">NIK Santri (16 Digit)</label>
									<Input {...form.register("nik")} required className="w-full font-mono text-xs" />
								</div>
								<div>
									<label className="font-semibold text-slate-700 block mb-1">No. Kartu Keluarga (KK)</label>
									<Input {...form.register("kkNumber")} required className="w-full font-mono text-xs" />
								</div>
							</div>
						</div>
					)}

					{/* Step 3: Keluarga */}
					{activeStep === 3 && (
						<div className="space-y-4 animate-in fade-in">
							<h5 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
								Step 3: Data Orang Tua Kandung
							</h5>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="font-semibold text-slate-700 block mb-1">Nama Ayah Kandung</label>
									<Input {...form.register("fatherName")} required placeholder="Nama lengkap ayah" className="w-full text-xs" />
								</div>
								<div>
									<label className="font-semibold text-slate-700 block mb-1">Nama Ibu Kandung</label>
									<Input {...form.register("motherName")} required placeholder="Nama lengkap ibu" className="w-full text-xs" />
								</div>
							</div>
						</div>
					)}

					{/* Step 4: Wali */}
					{activeStep === 4 && (
						<div className="space-y-4 animate-in fade-in">
							<h5 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
								Step 4: Data Wali Santri & Kontak Darurat
							</h5>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="font-semibold text-slate-700 block mb-1">Nama Wali Santri</label>
									<Input {...form.register("guardianName")} placeholder="Jika diwakilkan wali" className="w-full text-xs" />
								</div>
								<div>
									<label className="font-semibold text-slate-700 block mb-1">No. WhatsApp / HP</label>
									<Input {...form.register("phone")} required className="w-full font-mono text-xs" />
								</div>
							</div>
						</div>
					)}

					{/* Step 5: Berkas & Penempatan */}
					{activeStep === 5 && (
						<div className="space-y-4 animate-in fade-in">
							<h5 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
								Step 5: Berkas Asal Sekolah & Penempatan Rombel
							</h5>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="font-semibold text-slate-700 block mb-1">Asal Sekolah</label>
									<Input {...form.register("previousSchool")} className="w-full text-xs" />
								</div>
								<div>
									<label className="font-semibold text-slate-700 block mb-1">Pilihan Kelas Penempatan</label>
									<select {...form.register("gradeId")} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
										<option value="7">Kelas 7 - Tsanawiyah</option>
										<option value="8">Kelas 8 - Tsanawiyah</option>
										<option value="10">Kelas 10 - Aliyah</option>
									</select>
								</div>
							</div>
						</div>
					)}

					{/* Step Action Buttons */}
					<div className="flex justify-between items-center pt-4 border-t border-slate-100">
						{activeStep > 1 ? (
							<button
								type="button"
								onClick={() => setActiveStep((s) => s - 1)}
								className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
							>
								Sebelumnya
							</button>
						) : (
							<div />
						)}

						{activeStep < 5 ? (
							<button
								type="button"
								onClick={() => setActiveStep((s) => s + 1)}
								className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--primary)] hover:bg-pink-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs"
							>
								Langkah Selanjutnya
								<ChevronRight className="w-4 h-4" />
							</button>
						) : (
							<button
								type="submit"
								className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
							>
								<Save className="w-4 h-4" />
								Simpan Final Data Santri
							</button>
						)}
					</div>
				</form>
			</div>
		</div>
	)
}
