import type { JSX } from "react"
import { Check, Clock, AlertCircle, FileText, GraduationCap, Award } from "lucide-react"

export interface PsbJourneyTrackerProps {
	status: string
	registrationPath?: string | null
	dataValidation?: string | null
	regularTest?: string | null
	indentTest?: string | null
	approvalStatus?: string | null
}

type StepState = "completed" | "active" | "error" | "pending"

interface JourneyStep {
	id: number
	title: string
	subtitle: string
	state: StepState
	icon: any
}

export const PsbJourneyTracker = ({
	status,
	registrationPath,
	dataValidation,
	regularTest,
	indentTest,
	approvalStatus,
}: PsbJourneyTrackerProps): JSX.Element => {
	const isIndent = registrationPath === "indent"
	const activeTest = isIndent ? indentTest : regularTest

	// 1. Step 1: Verifikasi Berkas
	let step1State: StepState = "pending"
	if (
		dataValidation === "valid" ||
		activeTest !== null ||
		approvalStatus === "approve" ||
		status === "data_valid" ||
		status === "regular_test_passed" ||
		status === "indent_test_passed"
	) {
		step1State = "completed"
	} else if (dataValidation === "invalid" || status === "invalid") {
		step1State = "error"
	} else {
		step1State = "active" // wait or fixed
	}

	// 2. Step 2: Tes Seleksi Masuk
	let step2State: StepState = "pending"
	if (approvalStatus === "approve" || activeTest === "success" || status === "regular_test_passed" || status === "indent_test_passed") {
		step2State = "completed"
	} else if (activeTest === "failed" || status === "regular_test_failed" || status === "indent_failed") {
		step2State = "active" // Masih aktif dalam proses evaluasi lanjutan/pengalihan
	} else if (step1State === "completed" && approvalStatus === "wait") {
		step2State = "active"
	}

	// 3. Step 3: Pengumuman & Daftar Ulang
	let step3State: StepState = "pending"
	if (approvalStatus === "approve" || status === "approve") {
		step3State = "completed"
	} else if (approvalStatus === "reject" || status === "failed") {
		step3State = "error"
	} else if (
		step2State === "completed" ||
		approvalStatus === "reserve" ||
		status === "reserve" ||
		status === "regular_test_failed" ||
		activeTest !== null
	) {
		step3State = "active"
	}

	const isTestUnderEvaluation = activeTest === "failed" || status === "regular_test_failed"
	const isIndentDiverted = isIndent && (activeTest === "failed" || status === "indent_failed")

	const steps: JourneyStep[] = [
		{
			id: 1,
			title: "Verifikasi Berkas",
			subtitle:
				step1State === "completed"
					? "Berkas Lengkap & Valid"
					: step1State === "error"
						? "Perlu Perbaikan Berkas"
						: "Dalam Antrean Review",
			state: step1State,
			icon: FileText,
		},
		{
			id: 2,
			title: isIndent ? "Tes Jalur Indent" : "Ujian Seleksi Masuk",
			subtitle:
				step2State === "completed"
					? "Lulus Ujian Seleksi"
					: isIndentDiverted
						? "Dialihkan ke Tes Reguler"
						: isTestUnderEvaluation
							? "Dalam Peninjauan Dewan Penguji"
							: step2State === "active"
								? "Jadwal & Pelaksanaan Tes"
								: "Menunggu Berkas Valid",
			state: step2State,
			icon: GraduationCap,
		},
		{
			id: 3,
			title: "Pengumuman & Daftar Ulang",
			subtitle:
				step3State === "completed"
					? "Diterima Santri Baru"
					: step3State === "error"
						? "Belum Berhasil"
						: isTestUnderEvaluation
							? "Menunggu Keputusan Sidang Pleno"
							: step3State === "active"
								? "Tahap Penetapan Kelulusan"
								: "Tahap Akhir",
			state: step3State,
			icon: Award,
		},
	]

	return (
		<div className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 md:p-4">
			<div className="flex items-center justify-between mb-3 px-0.5">
				<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
					Alur Tahapan Pendaftaran
				</span>
				<span className="text-[11px] font-medium text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
					Jalur: <span className="capitalize text-emerald-800 font-bold">{registrationPath || "Reguler"}</span>
				</span>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 relative">
				{steps.map((step) => {
					const Icon = step.icon
					const isDone = step.state === "completed"
					const isActive = step.state === "active"
					const isError = step.state === "error"

					return (
						<div
							key={step.id}
							className={`relative flex items-center gap-2.5 p-2.5 rounded-lg border transition-all duration-200 ${isActive
								? "bg-white border-emerald-500/50 shadow-2xs ring-1 ring-emerald-500/15"
								: isDone
									? "bg-emerald-50/40 border-emerald-200/70 text-slate-800"
									: isError
										? "bg-rose-50/40 border-rose-200/80 text-slate-800"
										: "bg-slate-100/50 border-slate-200/60 opacity-60"
								}`}
						>
							<div
								className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-colors ${isDone
									? "bg-emerald-600 text-white shadow-2xs"
									: isActive
										? "bg-emerald-800 text-white shadow-2xs animate-pulse"
										: isError
											? "bg-rose-600 text-white shadow-2xs"
											: "bg-slate-200 text-slate-400"
									}`}
							>
								{isDone ? (
									<Check className="w-3.5 h-3.5 stroke-[2.5]" />
								) : isError ? (
									<AlertCircle className="w-3.5 h-3.5" />
								) : isActive ? (
									<Clock className="w-3.5 h-3.5" />
								) : (
									<Icon className="w-3.5 h-3.5" />
								)}
							</div>

							<div className="flex flex-col min-w-0">
								<div className="flex items-center gap-1">
									<span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
										0{step.id}
									</span>
									{isActive && (
										<span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
									)}
								</div>
								<h6
									className="text-xs font-bold text-primary truncate"
									style={{ color: "var(--primary)" }}
								>
									{step.title}
								</h6>
								<p className="text-[10px] text-slate-500 font-normal leading-tight truncate">
									{step.subtitle}
								</p>
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}

export default PsbJourneyTracker
