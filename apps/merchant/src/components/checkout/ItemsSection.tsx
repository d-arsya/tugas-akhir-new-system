import { type JSX, useState } from "react"
import { ShoppingBag, Edit2, Check, X } from "lucide-react"
import { Button, Input } from "@roja/ui"
import { formatRupiah } from "@roja/utils"
import type { CheckoutItem } from "@roja/api-client"
import RupiahInput from "@/components/transactions/RupiahInput"

interface ItemsSectionProps {
	items: CheckoutItem[]
	onUpdateItem: (itemId: number, description: string, price: number) => Promise<void>
}

export default function ItemsSection({ items, onUpdateItem }: ItemsSectionProps): JSX.Element {
	const [editingItemId, setEditingItemId] = useState<number | null>(null)
	const [editDesc, setEditDesc] = useState("")
	const [editPrice, setEditPrice] = useState(0)
	const [isSaving, setIsSaving] = useState(false)

	const startEditing = (item: CheckoutItem) => {
		setEditingItemId(item.id)
		setEditDesc(item.description)
		setEditPrice(item.price)
	}

	const handleSave = async (itemId: number) => {
		if (!editDesc.trim() || editPrice <= 0) return
		setIsSaving(true)
		try {
			await onUpdateItem(itemId, editDesc.trim(), editPrice)
			setEditingItemId(null)
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<div className="p-4 sm:p-5 space-y-3">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wide">
					<ShoppingBag className="w-4 h-4 text-[#8dc31e]" />
					<span>Rincian Belanja ({items.length} Item)</span>
				</div>
				<span className="text-[11px] text-slate-400">Klik icon pensil untuk koreksi</span>
			</div>

			<div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
				{items.map((item, idx) => (
					<div key={item.id} className="p-3 bg-slate-50/40 flex items-center justify-between gap-3 text-xs">
						<span className="w-5 h-5 rounded-md bg-slate-200 text-slate-600 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
							{idx + 1}
						</span>

						{editingItemId === item.id ? (
							<div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
								<Input
									value={editDesc}
									onChange={(e) => setEditDesc(e.target.value)}
									placeholder="Nama barang"
									className="sm:col-span-6 h-8 text-xs"
									disabled={isSaving}
								/>
								<RupiahInput
									value={editPrice}
									onChange={setEditPrice}
									className="sm:col-span-4 h-8 text-xs"
								/>
								<div className="sm:col-span-2 flex gap-1 justify-end">
									<Button
										size="sm"
										onClick={() => handleSave(item.id)}
										disabled={isSaving || !editDesc.trim() || editPrice <= 0}
										className="h-8 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg cursor-pointer"
										title="Simpan"
									>
										<Check className="w-3.5 h-3.5" />
									</Button>
									<Button
										size="sm"
										variant="outline"
										onClick={() => setEditingItemId(null)}
										disabled={isSaving}
										className="h-8 px-2 rounded-lg cursor-pointer"
										title="Batal"
									>
										<X className="w-3.5 h-3.5" />
									</Button>
								</div>
							</div>
						) : (
							<>
								<div className="flex-1 min-w-0">
									<p className="font-semibold text-slate-800 truncate">{item.description}</p>
								</div>
								<div className="flex items-center gap-3">
									<span className="font-mono font-bold text-slate-700">
										{formatRupiah(item.price)}
									</span>
									<button
										type="button"
										onClick={() => startEditing(item)}
										className="p-1 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-500/10 transition-colors cursor-pointer"
										title="Edit item"
									>
										<Edit2 className="w-3.5 h-3.5" />
									</button>
								</div>
							</>
						)}
					</div>
				))}
			</div>
		</div>
	)
}
