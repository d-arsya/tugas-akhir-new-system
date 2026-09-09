import type { JSX } from "react"
import { useNavigate, Link, createFileRoute } from "@tanstack/react-router"
import { psbApi } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import { AlertTriangle, Download, CheckCircle } from "lucide-react"
import {
	Button,
	Badge,
	Alert,
	AlertTitle,
	AlertDescription,
	Skeleton,
	RojaCard,
} from "@roja/ui"
import { AnnouncementResultCard } from "@/components/dashboard/AnnouncementResultCard"
import PageHeader from "@/components/page-header"

const DashboardPage = (): JSX.Element => {
	const navigate = useNavigate()

	const { data, isLoading } = useQuery({
		queryKey: ["dashboard"],
		queryFn: () => psbApi.getDashboard(),
	})

	if (isLoading) {
		return (
			<RojaCard className="w-full flex flex-col gap-6 p-6 md:p-8">
				<div className="flex justify-between items-center pb-4 border-b">
					<div className="flex flex-col gap-2">
						<Skeleton className="h-8 w-64 rounded-lg" />
						<Skeleton className="h-4 w-48 rounded" />
					</div>
					<Skeleton className="h-10 w-36 rounded-lg" />
				</div>
				<Skeleton className="h-40 w-full rounded-2xl" />
			</RojaCard>
		)
	}

	const reg = data?.registrant
	const announcement = data?.announcement
	const statusInfo = data?.statusInfo

	// Determine active status: statusInfo.status -> reg.dataValidation -> reg.approvalStatus
	let rawStatus =
		statusInfo?.status ||
		(reg?.dataValidation && reg.dataValidation !== "valid" ? reg.dataValidation : reg?.approvalStatus) ||
		"wait"
	if (rawStatus === "reject") rawStatus = "failed"
	const status = rawStatus === "indent failed" ? "indent_failed" : rawStatus
	const validationNote = statusInfo?.description || reg?.dataValidationNote

	const levelLabel = reg?.levelId === 1 ? "Setingkat SMP" : reg?.levelId === 2 ? "Setingkat SMA" : "Pondok Roja"
	const printType =
		status === "approve"
			? "accepted"
			: status === "failed"
			? "rejected"
			: status === "indent_failed"
			? "indent-rejected"
			: "registration"
	const printLabel = status === "approve" ? "Cetak Surat Kelulusan" : "Cetak Bukti PSB"
	const registrantIdParam = reg?.id ? String(reg.id) : ""

	const printAction = registrantIdParam ? (
		<Button asChild variant="roja-primary" size="sm">
			<Link
				to="/print/$type/$registrantId"
				params={{ type: printType, registrantId: registrantIdParam }}
				target="_blank"
				className="flex items-center gap-2"
			>
				<Download className="w-4 h-4" />
				<span>{printLabel}</span>
			</Link>
		</Button>
	) : undefined

	return (
		<RojaCard className="w-full flex flex-col gap-8 p-6 md:p-8">
			<PageHeader
				title={`Hallo, ${reg?.fullname || reg?.fullName || ""}`}
				subtitle={
					reg ? `ID: ${reg.registrantId || "-"}  •  Jenjang: ${levelLabel}` : undefined
				}
				action={printAction}
			/>

			{/* Status Scenario Content */}

			{/* 1. Wait (Menunggu Verifikasi) */}
			{status === "wait" && (
				<Alert variant="default" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center p-6 border-slate-200 bg-slate-50/50">
					<div className="lg:col-span-7 flex flex-col gap-3">
						<div className="flex items-center gap-2">
							<Badge variant="wait">Menunggu Verifikasi</Badge>
							<AlertTitle className="text-sm font-bold text-slate-800 m-0">
								Status Pendaftaran: In Review
							</AlertTitle>
						</div>
						<AlertDescription className="text-xs md:text-sm text-slate-600 leading-relaxed font-medium">
							Data kamu sedang kami proses, mohon menunggu. Informasi penerimaan dan jika ada kelengkapan data akan kami tampilkan pada halaman ini.
						</AlertDescription>
					</div>
					<div className="lg:col-span-5 flex justify-center items-center">
						<img
							src="/assets/svg/illustration/No-Activity.svg"
							alt="Status Review"
							className="max-w-xs w-full h-auto object-contain select-none pointer-events-none"
						/>
					</div>
				</Alert>
			)}

			{/* 2. Fixed (Data Telah Diperbaiki) */}
			{status === "fixed" && (
				<Alert variant="info" className="flex flex-col gap-2 p-6">
					<div className="flex items-center gap-2.5 font-bold text-sm">
						<CheckCircle className="w-5 h-5 shrink-0" />
						<span>Perbaikan Data Tersimpan</span>
					</div>
					<AlertDescription className="text-xs md:text-sm leading-relaxed font-medium">
						Kamu berhasil melakukan update data. Silakan tunggu keputusan selanjutnya dari admin kami. Semoga proses pendaftaran kamu berjalan lancar ya.
					</AlertDescription>
				</Alert>
			)}

			{/* 3. Invalid (Data / Berkas Tidak Valid) */}
			{status === "invalid" && (
				<Alert variant="warning" className="flex flex-col gap-4 p-6">
					<div className="flex items-center gap-2.5 font-bold text-sm">
						<AlertTriangle className="w-5 h-5 shrink-0" />
						<span>Data / Berkas Tidak Valid!</span>
					</div>
					<AlertDescription className="text-xs leading-relaxed font-medium flex flex-col gap-3">
						<span>Panitia menemukan bahwa beberapa data/berkas yang Anda unggah tidak valid. Silakan lakukan perbaikan data.</span>
						{validationNote && (
							<div
								className="bg-white/90 p-3.5 rounded-xl border border-amber-200 text-xs italic text-amber-900"
								dangerouslySetInnerHTML={{ __html: validationNote }}
							/>
						)}
					</AlertDescription>
					<div>
						<Button
							onClick={() => navigate({ to: "/invalid" })}
							variant="roja-warning"
							size="sm"
							className="font-bold"
						>
							Perbaiki Data Saya
						</Button>
					</div>
				</Alert>
			)}

			{/* 4/5/6. Announcement Result Card (Approve / Failed / Indent Failed) */}
			<AnnouncementResultCard status={status} announcement={announcement} />
		</RojaCard>
	)
}

export const Route = createFileRoute("/_member/dashboard")({
	component: DashboardPage,
})

export default DashboardPage

