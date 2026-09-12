import type { JSX } from "react"
import { Trash2 } from "lucide-react"
import { Input, Button } from "@roja/ui"
import RupiahInput from "./RupiahInput"

export interface ItemRowProps {
	index: number
	description: string
	price: number
	onDescriptionChange: (val: string) => void
	onPriceChange: (val: number) => void
	onRemove: () => void
	canRemove: boolean
	descriptionError?: string
	priceError?: string
}

export const ItemRow = ({
	index,
	description,
	price,
	onDescriptionChange,
	onPriceChange,
	onRemove,
	canRemove,
	descriptionError,
	priceError,
}: ItemRowProps): JSX.Element => {
	return (
		<div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
			<div className="md:col-span-8 flex gap-1">
				{canRemove && (
					<button
						type="button"
						onClick={onRemove}
						className="text-slate-400 hover:text-rose-500 transition-colors p-1 rounded-md"
						title="Hapus Item"
					>
						<Trash2 className="w-4 h-4" />
					</button>
				)}
				<Input
					type="text"
					placeholder="Nama / Deskripsi Item (cth: Nasi Goreng Special)"
					value={description}
					onChange={(e) => onDescriptionChange(e.target.value)}
					className="h-10 text-xs font-medium"
				/>
				{descriptionError && (
					<p className="text-[11px] text-rose-500 mt-1 font-medium">{descriptionError}</p>
				)}
			</div>

			<div className="md:col-span-4">
				<RupiahInput
					value={price}
					onChange={onPriceChange}
					placeholder="0"
					className="h-10 text-xs"
				/>
				{priceError && (
					<p className="text-[11px] text-rose-500 mt-1 font-medium">{priceError}</p>
				)}
			</div>
		</div>
	)
}

export default ItemRow
