import { type JSX, useEffect, useState, useRef } from "react"
import { createFileRoute, useNavigate, useParams, Link } from "@tanstack/react-router"
import { ArrowLeft, Flashlight, Camera, QrCode } from "lucide-react"
import { Input, Button, RojaCard, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@roja/ui"
import { toast } from "sonner"

import { merchantApi } from "@/lib/api"
import { useValidateScanMutation } from "@/hooks/use-merchant-queries"

export const Route = createFileRoute("/_member/transactions/$id/scan-qr")({
	component: ScanQrRouteComponent,
})


function ScanQrRouteComponent(): JSX.Element {
	const navigate = useNavigate()
	const { id } = useParams({ from: "/_member/transactions/$id/scan-qr" })
	const validateScanMutation = useValidateScanMutation()
	const videoRef = useRef<HTMLVideoElement | null>(null)

	const [manualId, setManualId] = useState("")
	const [isSubmittingManual, setIsSubmittingManual] = useState(false)
	const [retryModalOpen, setRetryModalOpen] = useState(false)
	const [isCameraActive, setIsCameraActive] = useState(false)
	const [flashOn, setFlashOn] = useState(false)

	useEffect(() => {
		let stream: MediaStream | null = null

		const startCamera = async () => {
			try {
				if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
					stream = await navigator.mediaDevices.getUserMedia({
						video: { facingMode: "environment" },
					})
					if (videoRef.current) {
						videoRef.current.srcObject = stream
						videoRef.current.play()
						setIsCameraActive(true)
					}
				}
			} catch (err) {
				// Camera unavailable or permission denied, fallback smoothly
				setIsCameraActive(false)
			}
		}

		startCamera()

		return () => {
			if (stream) {
				stream.getTracks().forEach((track) => track.stop())
			}
		}
	}, [])

	const handleManualSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		const scanValue = manualId.trim() || "2026001"

		setIsSubmittingManual(true)
		validateScanMutation.mutate(
			{ transactionId: Number(id), scannedQrValue: scanValue },
			{
				onSuccess: (res) => {
					toast.success("Santri Terkonfirmasi", {
						description: `E-Wallet Santri (${res.studentName || "Santri"}) terhubung.`,
					})
					navigate({
						to: "/transactions/$id/checkout",
						params: { id },
					})
				},
				onError: () => {
					toast.error("Scan Gagal", { description: "QR Code Santri tidak valid." })
					setRetryModalOpen(true)
				},
				onSettled: () => {
					setIsSubmittingManual(false)
				},
			},
		)
	}

	return (
		<div className="space-y-6 w-full mx-auto">
			<div className="flex items-center justify-between">
				<Link
					to="/e-wallet"
					className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium"
				>
					<ArrowLeft className="w-3.5 h-3.5" />
					Kembali
				</Link>
				<span className="text-xs font-bold text-slate-700">
					Scan Barcode Santri
				</span>
			</div>

			{/* 1:1 Camera Scanner Container */}
			<RojaCard className="p-6 rounded-2xl border border-slate-200/80 text-center space-y-4 shadow-sm relative">
				<div className="relative w-full aspect-square max-w-sm mx-auto bg-slate-900 rounded-2xl overflow-hidden flex flex-col items-center justify-center border-4 border-slate-800">
					<video
						ref={videoRef}
						className={`absolute inset-0 w-full h-full object-cover ${isCameraActive ? "block" : "hidden"}`}
						autoPlay
						playsInline
						muted
					/>

					{/* Camera Viewfinder Overlay Frame */}
					<div className="relative z-10 w-48 h-48 border-2 border-dashed border-white/80 rounded-2xl animate-pulse flex items-center justify-center pointer-events-none">
						{!isCameraActive && <Camera className="w-8 h-8 text-white/60" />}
					</div>

					<button
						type="button"
						onClick={() => setFlashOn(!flashOn)}
						className={`absolute top-4 right-4 p-2 ${flashOn ? "bg-amber-500 text-slate-900" : "bg-slate-800/80 text-white"} rounded-xl transition-colors cursor-pointer z-20`}
						title="Toggle Flash"
					>
						<Flashlight className="w-4 h-4" />
					</button>

					<p className="absolute bottom-4 z-20 text-[11px] text-white/90 font-medium bg-black/60 backdrop-blur-xs px-3 py-1 rounded-full">
						{isCameraActive ? "Arahkan kamera ke QR Code Santri" : "Kamera siap / masukkan NIS manual"}
					</p>
				</div>

				{/* 1:1 Legacy Alert Banner */}
				<div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-xl text-xs font-bold">
					Letakkan QR code santri pada bingkai
				</div>

				<Button
					type="button"
					onClick={() => handleManualSubmit({ preventDefault: () => { } } as any)}
					className="w-full h-10 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm"
				>
					<QrCode className="w-4 h-4" />
					Simulasikan Scan QR Santri
				</Button>
			</RojaCard>

			{/* Manual Fallback Entry */}
			<RojaCard className="p-5 rounded-2xl border border-slate-200/80 space-y-3">
				<p className="text-xs font-bold text-slate-800">Input Manual Barcode Santri</p>
				<form onSubmit={handleManualSubmit} className="flex gap-2">
					<Input
						type="text"
						placeholder="Nomor Induk Santri (cth: 2026001)"
						value={manualId}
						onChange={(e) => setManualId(e.target.value)}
						className="h-10 text-xs font-mono font-bold"
					/>
					<Button
						type="submit"
						disabled={isSubmittingManual || !manualId.trim()}
						className="h-10 px-4 bg-[#e4007e] text-white font-bold text-xs rounded-xl cursor-pointer"
					>
						Proses
					</Button>
				</form>
			</RojaCard>

			{/* 1:1 Legacy Retry Scan Modal */}
			<Dialog open={retryModalOpen} onOpenChange={setRetryModalOpen}>
				<DialogContent className="sm:max-w-xs text-center space-y-4">
					<DialogHeader>
						<DialogTitle className="text-center text-base font-bold">Scan Gagal!</DialogTitle>
						<DialogDescription className="text-center text-xs">
							QR Code tidak dapat terbaca atau tidak valid. Silakan coba scan ulang.
						</DialogDescription>
					</DialogHeader>
					<Button onClick={() => setRetryModalOpen(false)} className="w-full h-10 bg-[#e4007e] text-white text-xs font-bold">
						Coba Scan Lagi
					</Button>
				</DialogContent>
			</Dialog>
		</div>
	)
}

export default Route
