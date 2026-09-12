import { type JSX, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button, toast } from "@roja/ui"
import { formatRupiah } from "@roja/utils"
import { createMerchantApi } from "@roja/api-client"
import { hijackMerchantApi } from "@/lib/dev-hijack"
import ItemRow from "./ItemRow"

const merchantApi = hijackMerchantApi(createMerchantApi())

export interface TransactionModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

interface ItemForm {
	id: number
	description: string
	price: number
}

export const TransactionModal = ({
	open,
	onOpenChange,
}: TransactionModalProps): JSX.Element => {
	const navigate = useNavigate()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [itemErrors, setItemErrors] = useState<Record<string, string>>({})
	const [items, setItems] = useState<ItemForm[]>([
		{ id: 1, description: "", price: 0 },
	])

	const addItem = () => {
		setItems((prev) => [...prev, { id: Date.now(), description: "", price: 0 }])
	}

	const removeItem = (id: number) => {
		if (items.length <= 1) return
		setItems((prev) => prev.filter((item) => item.id !== id))
	}

	const updateItem = (id: number, field: "description" | "price", val: string | number) => {
		setItems((prev) =>
			prev.map((item) => (item.id === id ? { ...item, [field]: val } : item)),
		)
	}

	const totalAmount = items.reduce((sum, item) => sum + (item.price || 0), 0)

	const handleCheckout = async () => {
		const newErrors: Record<string, string> = {}
		items.forEach((item, index) => {
			if (!item.description.trim()) {
				newErrors[`desc_${index}`] = "Deskripsi wajib diisi"
			}
			if (!item.price || item.price <= 0) {
				newErrors[`price_${index}`] = "Nominal wajib diisi"
			}
		})

		if (Object.keys(newErrors).length > 0) {
			setItemErrors(newErrors)
			toast.error("Validasi Gagal", { description: "Mohon lengkapi seluruh item transaksi." })
			return
		}

		setItemErrors({})
		setIsSubmitting(true)
		try {
			const res = await merchantApi.createTransaction({
				items: items.map((i) => ({ description: i.description, price: i.price })),
			})
			toast.success("Transaksi Dibuat", {
				description: `Kode: ${res.code}. Silakan scan QR santri.`,
			})
			onOpenChange(false)
			setItems([{ id: Date.now(), description: "", price: 0 }])
			navigate({
				to: "/transactions/$id/scan-qr",
				params: { id: String(res.transactionId) },
			})
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Gagal membuat transaksi"
			toast.error("Gagal", { description: msg })
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-xl p-6 rounded-2xl bg-white dark:bg-slate-900">
				<DialogHeader>
					<DialogTitle className="text-center text-lg font-bold text-slate-800 dark:text-white">
						Transaksi
					</DialogTitle>
					<p className="text-center text-xs text-slate-500">
						Masukkan deskripsi dan nominal yang sesuai.
					</p>
				</DialogHeader>

				<div className="space-y-3 py-2 max-h-[50vh] overflow-y-auto pr-1">
					{items.map((item, index) => (
						<ItemRow
							key={item.id}
							index={index}
							description={item.description}
							price={item.price}
							canRemove={items.length > 1}
							onDescriptionChange={(val) => updateItem(item.id, "description", val)}
							onPriceChange={(val) => updateItem(item.id, "price", val)}
							onRemove={() => removeItem(item.id)}
							descriptionError={itemErrors[`desc_${index}`]}
							priceError={itemErrors[`price_${index}`]}
						/>
					))}

					<Button
						type="button"
						variant="outline"
						onClick={addItem}
						className="w-full h-10 border-dashed border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 rounded-xl cursor-pointer"
					>
						<Plus className="w-4 h-4 text-[#8dc31e]" />
						Tambah Item
					</Button>
				</div>

				<div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
					<span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
						Total Transaksi
					</span>
					<span className="text-base font-extrabold font-mono text-[#8dc31e]">
						{formatRupiah(totalAmount)}
					</span>
				</div>

				<div className="flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-3">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						className="h-10 px-5 text-xs font-bold rounded-xl cursor-pointer"
					>
						Batal
					</Button>
					<Button
						type="button"
						onClick={handleCheckout}
						disabled={isSubmitting}
						className="h-10 px-6 bg-[#8dc31e] hover:bg-[#8dc31e]/90 text-white font-bold text-xs rounded-xl cursor-pointer disabled:opacity-50"
					>
						{isSubmitting ? "Memproses..." : "Checkout"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default TransactionModal
