import type { JSX } from "react"
import { Lock, ShieldAlert, RotateCcw, Delete } from "lucide-react"
import { cn } from "@roja/utils"

interface PinKeypadSectionProps {
	pin: string
	onPinChange: (nextPin: string) => void
	isSubmitting: boolean
	pinError: boolean
	attemptsLeft: number
}

export default function PinKeypadSection({
	pin,
	onPinChange,
	isSubmitting,
	pinError,
	attemptsLeft,
}: PinKeypadSectionProps): JSX.Element {
	return (
		<div className="p-4 sm:p-5 space-y-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
					<Lock className="w-4 h-4 text-[#8dc31e]" />
					<span>PIN Santri (6 Digit)</span>
				</div>
				{attemptsLeft < 3 && (
					<span className="flex items-center gap-1 text-[11px] font-bold text-rose-500 animate-pulse">
						<ShieldAlert className="w-3.5 h-3.5" />
						Sisa {attemptsLeft} Kesempatan
					</span>
				)}
			</div>

			{/* 6-Digit PIN Indicator */}
			<div
				className={cn(
					"flex justify-center gap-2.5 sm:gap-3 py-3 px-4 rounded-xl bg-slate-50 dark:bg-slate-850 border transition-all",
					pinError ? "border-rose-500 bg-rose-500/5 animate-shake" : "border-slate-200 dark:border-slate-800"
				)}
			>
				{Array.from({ length: 6 }).map((_, idx) => {
					const isFilled = idx < pin.length
					const isCurrent = idx === pin.length
					return (
						<div
							key={idx}
							className={cn(
								"w-9 h-11 sm:w-10 sm:h-12 rounded-xl flex items-center justify-center font-mono text-lg font-bold transition-all border",
								isFilled
									? "bg-white dark:bg-slate-800 border-[#8dc31e] text-slate-900 dark:text-white shadow-xs"
									: isCurrent
										? "bg-white dark:bg-slate-800 border-slate-400 dark:border-slate-600 scale-105"
										: "bg-slate-100/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/50 text-slate-400"
							)}
						>
							{isFilled ? "•" : ""}
						</div>
					)
				})}
			</div>

			{/* Numeric Touch Keypad */}
			<div className="grid grid-cols-3 gap-2 pt-1 max-w-sm mx-auto">
				{["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
					<button
						key={digit}
						type="button"
						disabled={isSubmitting || pin.length >= 6}
						onClick={() => pin.length < 6 && onPinChange(pin + digit)}
						className="h-11 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 text-slate-800 dark:text-white font-mono text-base font-bold shadow-xs transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center"
					>
						{digit}
					</button>
				))}

				<button
					type="button"
					disabled={isSubmitting || pin.length === 0}
					onClick={() => onPinChange("")}
					className="h-11 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-600 dark:text-slate-300 text-xs font-semibold shadow-xs transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1"
					title="Clear"
				>
					<RotateCcw className="w-3.5 h-3.5" />
					<span>C</span>
				</button>

				<button
					type="button"
					disabled={isSubmitting || pin.length >= 6}
					onClick={() => pin.length < 6 && onPinChange(pin + "0")}
					className="h-11 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 text-slate-800 dark:text-white font-mono text-base font-bold shadow-xs transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center"
				>
					0
				</button>

				<button
					type="button"
					disabled={isSubmitting || pin.length === 0}
					onClick={() => onPinChange(pin.slice(0, -1))}
					className="h-11 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-600 dark:text-slate-300 shadow-xs transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center"
					title="Hapus"
				>
					<Delete className="w-4 h-4" />
				</button>
			</div>
		</div>
	)
}
