import { type JSX, useState, useEffect, useCallback } from "react"
import { createFileRoute, useNavigate, useParams, Link } from "@tanstack/react-router"
import { ArrowLeft, ShieldCheck, XCircle, ArrowRight, Copy, CheckCircle2 } from "lucide-react"
import { RojaCard, Button, toast } from "@roja/ui"
import { hijackMerchantApi } from "@/lib/dev-hijack"
import { createMerchantApi, type CheckoutDataResponse } from "@roja/api-client"

import SantriSection from "@/components/checkout/SantriSection"
import ItemsSection from "@/components/checkout/ItemsSection"
import TotalSection from "@/components/checkout/TotalSection"
import PinKeypadSection from "@/components/checkout/PinKeypadSection"
import InsufficientBalanceDialog from "@/components/checkout/InsufficientBalanceDialog"
import BlockedWalletDialog from "@/components/checkout/BlockedWalletDialog"
import VoidConfirmDialog from "@/components/checkout/VoidConfirmDialog"

const merchantApi = hijackMerchantApi(createMerchantApi())

export const Route = createFileRoute("/_member/transactions/$id/checkout")({
	component: CheckoutRouteComponent,
})

function CheckoutRouteComponent(): JSX.Element {
	const navigate = useNavigate()
	const { id } = useParams({ from: "/_member/transactions/$id/checkout" })

	const [data, setData] = useState<CheckoutDataResponse | null>(null)
	const [pin, setPin] = useState("")
	const [attemptsLeft, setAttemptsLeft] = useState(3)
	const [pinError, setPinError] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [copied, setCopied] = useState(false)

	// Dialog states
	const [voidOpen, setVoidOpen] = useState(false)
	const [blockedOpen, setBlockedOpen] = useState(false)
	const [insufficientOpen, setInsufficientOpen] = useState(false)

	useEffect(() => {
		const loadData = async () => {
			try {
				const res = await merchantApi.getCheckoutData(Number(id))
				setData(res)
			} catch (err) {
				toast.error("Gagal Memuat Data Checkout")
			}
		}
		loadData()
	}, [id])

	const handleUpdateItem = async (itemId: number, description: string, price: number) => {
		try {
			const res = await merchantApi.updateTransactionItem(itemId, { description, price })
			if (data) {
				setData({
					...data,
					totalAmount: res.totalAmount,
					items: data.items.map((i) => (i.id === itemId ? { ...i, description, price } : i)),
				})
			}
			toast.success("Item Berhasil Diperbarui")
		} catch (err) {
			toast.error("Gagal Memperbarui Item")
		}
	}

	const handleSubmitPayment = useCallback(async () => {
		if (pin.length !== 6 || isSubmitting) return

		setIsSubmitting(true)
		setPinError(false)

		try {
			const res = await merchantApi.validatePin(Number(id), pin)
			if (res.success) {
				toast.success("Transaksi Berhasil!", { description: res.message || "Pembayaran e-wallet berhasil dikonfirmasi." })
				navigate({ to: "/e-wallet" })
				return
			}

			if (res.blocked) {
				setBlockedOpen(true)
				return
			}

			if (res.insufficientBalance) {
				setInsufficientOpen(true)
				setPin("")
				return
			}

			if (res.wrongPin) {
				setPinError(true)
				setPin("")
				const newAttempts = res.attempts ? 3 - res.attempts : Math.max(0, attemptsLeft - 1)
				setAttemptsLeft(newAttempts)
				toast.error("PIN Tidak Cocok!", { description: res.message || `Sisa kesempatan: ${newAttempts} kali.` })
				setTimeout(() => setPinError(false), 800)
			}
		} catch (err: unknown) {
			setPinError(true)
			setPin("")
			toast.error("Gagal Memproses Pembayaran")
			setTimeout(() => setPinError(false), 800)
		} finally {
			setIsSubmitting(false)
		}
	}, [pin, isSubmitting, id, attemptsLeft, navigate])

	// Keyboard shortcut listener
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (isSubmitting) return
			if (/^[0-9]$/.test(e.key)) {
				if (pin.length < 6) setPin((prev) => prev + e.key)
			} else if (e.key === "Backspace") {
				if (pin.length > 0) setPin((prev) => prev.slice(0, -1))
			} else if (e.key === "Escape") {
				setPin("")
			} else if (e.key === "Enter" && pin.length === 6) {
				handleSubmitPayment()
			}
		}

		window.addEventListener("keydown", handleKeyDown)
		return () => window.removeEventListener("keydown", handleKeyDown)
	}, [pin, isSubmitting, handleSubmitPayment])

	const copyCode = (code: string) => {
		navigator.clipboard.writeText(code)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
		toast.success("Kode Transaksi Disalin", { description: code })
	}

	if (!data) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
				<div className="w-8 h-8 rounded-full border-2 border-[#8dc31e] border-t-transparent animate-spin" />
				<p className="text-xs text-slate-500 font-medium">Memuat data konfirmasi transaksi...</p>
			</div>
		)
	}

	return (
		<div className="space-y-4 w-full mx-auto pb-10">
			{/* Top Bar Navigation */}
			<div className="flex items-center justify-between">
				<Link
					to="/e-wallet"
					className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium transition-colors"
				>
					<ArrowLeft className="w-4 h-4" />
					Kembali ke Dompet Digital
				</Link>

				<button
					type="button"
					onClick={() => copyCode(data.code)}
					className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
					title="Klik untuk salin kode"
				>
					<span>{data.code}</span>
					{copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
				</button>
			</div>

			{/* Single Unified Card Container */}
			<RojaCard className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
				{/* Section 2: Data Santri */}
				<SantriSection buyerName={data.buyerName} />

				{/* Section 3: Data Transaksi / Rincian Belanja */}
				<ItemsSection items={data.items} onUpdateItem={handleUpdateItem} />

				{/* Section 4: Ringkasan Total Tagihan */}
				<TotalSection itemCount={data.items.length} totalAmount={data.totalAmount} />

				{/* Section 5: Otorisasi PIN & Keypad */}
				<PinKeypadSection
					pin={pin}
					onPinChange={setPin}
					isSubmitting={isSubmitting}
					pinError={pinError}
					attemptsLeft={attemptsLeft}
				/>

				{/* Section 6: Action Buttons */}
				<div className="p-4 sm:p-5 flex flex-col-reverse sm:flex-row items-center gap-3">
					<Button
						type="button"
						variant="outline"
						onClick={() => setVoidOpen(true)}
						disabled={isSubmitting}
						className="w-full sm:w-1/3 h-11 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5"
					>
						<span>Batalkan</span>
					</Button>

					<Button
						type="button"
						onClick={handleSubmitPayment}
						disabled={pin.length !== 6 || isSubmitting}
						className="w-full sm:w-2/3 h-11 bg-[#8dc31e] hover:bg-[#8dc31e]/90 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
					>
						<span>{isSubmitting ? "Memproses..." : "Konfirmasi Pembayaran"}</span>
						<ArrowRight className="w-4 h-4" />
					</Button>
				</div>
			</RojaCard>

			{/* Dialogs */}
			<VoidConfirmDialog
				open={voidOpen}
				onOpenChange={setVoidOpen}
				onConfirmVoid={() => {
					setVoidOpen(false)
					toast.info("Transaksi Dibatalkan")
					navigate({ to: "/e-wallet" })
				}}
			/>

			<BlockedWalletDialog
				open={blockedOpen}
				onClose={() => {
					setBlockedOpen(false)
					navigate({ to: "/e-wallet" })
				}}
			/>

			<InsufficientBalanceDialog
				open={insufficientOpen}
				onOpenChange={setInsufficientOpen}
				buyerName={data.buyerName}
			/>
		</div>
	)
}

export default Route
