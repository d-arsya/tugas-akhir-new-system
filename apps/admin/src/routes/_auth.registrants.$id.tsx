import { useState, type JSX } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/lib/api"
import { RojaCard, Button, PageLoader } from "@roja/ui"
import { AdminPageHeader } from "@/components/layout/admin-page-header"
import { toast } from "sonner"
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"

export const Route = createFileRoute("/_auth/registrants/$id")({
	component: RegistrantDetailPage,
})

function RegistrantDetailPage(): JSX.Element {
	const params = Route.useParams() as { id?: string }
	const regId = params?.id || "1"
	const queryClient = useQueryClient()
	const [rejectReason, setRejectReason] = useState("")
	const [showRejectModal, setShowRejectModal] = useState(false)

	const { data, isLoading } = useQuery({
		queryKey: ["admin-registrant-detail", regId],
		queryFn: () => adminApi.getRegistrantById(Number(regId)),
	})

	const acceptMutation = useMutation({
		mutationFn: () => adminApi.acceptRegistrant(Number(regId)),
		onSuccess: (res) => {
			toast.success(res.message)
			queryClient.invalidateQueries({ queryKey: ["admin-registrant-detail", regId] })
			queryClient.invalidateQueries({ queryKey: ["admin-registrants"] })
		},
	})

	const rejectMutation = useMutation({
		mutationFn: () => adminApi.rejectRegistrant(Number(regId), rejectReason),
		onSuccess: (res) => {
			toast.success(res.message)
			queryClient.invalidateQueries({ queryKey: ["admin-registrant-detail", regId] })
			queryClient.invalidateQueries({ queryKey: ["admin-registrants"] })
			setShowRejectModal(false)
		},
	})

	const invalidMutation = useMutation({
		mutationFn: () => adminApi.markRegistrantInvalid(Number(regId), "Berkas tidak jelas"),
		onSuccess: (res) => {
			toast.success(res.message)
			queryClient.invalidateQueries({ queryKey: ["admin-registrant-detail", regId] })
			queryClient.invalidateQueries({ queryKey: ["admin-registrants"] })
		},
	})

	const reg = data?.data

	if (isLoading || !reg) return <PageLoader />

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-3">
				<Link to={"/registrants" as any} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
					<ArrowLeft className="w-4 h-4" />
				</Link>
				<AdminPageHeader
					title={reg.fullName}
					subtitle={`No. Pendaftaran: ${reg.registrationNumber} • ${reg.chosenLevel} (${reg.chosenMajor})`}
				/>
			</div>

			{/* Status Banner */}
			<RojaCard className="p-6 bg-white shadow-xs border-0 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
				<div>
					<span className="text-xs text-slate-400 font-medium block">Status Verifikasi Berkas:</span>
					<span
						className={`text-lg font-bold ${
							reg.status === "ACCEPTED"
								? "text-emerald-600"
								: reg.status === "REJECTED"
								? "text-rose-600"
								: reg.status === "INVALID"
								? "text-amber-600"
								: "text-blue-600"
						}`}
					>
						{reg.status}
					</span>
				</div>

				<div className="flex items-center gap-3">
					<Button
						onClick={() => invalidMutation.mutate()}
						variant="outline"
						className="gap-1.5 text-amber-700 hover:bg-amber-50"
					>
						<AlertTriangle className="w-4 h-4" />
						Tandai Tidak Valid
					</Button>

					<Button
						onClick={() => setShowRejectModal(true)}
						variant="outline"
						className="gap-1.5 text-rose-700 hover:bg-rose-50"
					>
						<XCircle className="w-4 h-4" />
						Tolak Pendaftaran
					</Button>

					<Button
						onClick={() => acceptMutation.mutate()}
						className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
					>
						<CheckCircle2 className="w-4 h-4" />
						Terima Pendaftar
					</Button>
				</div>
			</RojaCard>

			{/* Details Grid */}
			<RojaCard className="p-6 bg-white shadow-xs border-0 rounded-2xl space-y-4">
				<h5 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">Informasi Lengkap Pendaftar</h5>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
					<div>
						<span className="text-slate-400 block font-medium">Nama Lengkap</span>
						<span className="font-bold text-slate-900 text-sm">{reg.fullName}</span>
					</div>
					<div>
						<span className="text-slate-400 block font-medium">Email Terdaftar</span>
						<span className="font-mono text-slate-800">{reg.email}</span>
					</div>
					<div>
						<span className="text-slate-400 block font-medium">No. Telepon / HP</span>
						<span className="font-mono text-slate-800">{reg.phone}</span>
					</div>
					<div>
						<span className="text-slate-400 block font-medium">Waktu Pendaftaran</span>
						<span className="font-semibold text-slate-800">{reg.registeredAt}</span>
					</div>
				</div>
			</RojaCard>

			{/* Reject Modal */}
			{showRejectModal && (
				<div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
						<h5 className="font-bold text-slate-900 text-base">Alasan Penolakan Berkas</h5>
						<textarea
							value={rejectReason}
							onChange={(e) => setRejectReason(e.target.value)}
							placeholder="Masukkan alasan penolakan untuk calon santri..."
							className="w-full p-3 bg-slate-50 border-0 rounded-xl text-xs h-24"
						/>
						<div className="flex justify-end gap-2">
							<Button variant="outline" onClick={() => setShowRejectModal(false)}>
								Batal
							</Button>
							<Button onClick={() => rejectMutation.mutate()} className="bg-rose-600 text-white hover:bg-rose-700">
								Konfirmasi Tolak
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
