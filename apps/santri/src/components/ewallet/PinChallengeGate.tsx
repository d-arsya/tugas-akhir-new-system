import type { JSX } from "react"
import { useState } from "react"
import { KeyRound } from "lucide-react"
import { RojaCard, Alert, AlertDescription } from "@roja/ui"
import PinInput from "./PinInput"
import { santriApi } from "@/lib/api"
import useEwalletStore from "@/stores/ewalletStore"

export interface PinChallengeGateProps {
	onSuccess?: () => void
}

export const PinChallengeGate = ({ onSuccess }: PinChallengeGateProps): JSX.Element => {
	const setPinAuthenticated = useEwalletStore((s) => s.setPinAuthenticated)

	const [pinInputVal, setPinInputVal] = useState<string>("")
	const [pinError, setPinError] = useState<string>("")
	const [pinLoading, setPinLoading] = useState<boolean>(false)

	const submitPin = async (pinValue: string) => {
		if (pinValue.length < 6) {
			setPinError("Masukkan 6 digit PIN terlebih dahulu.")
			return
		}
		setPinError("")
		setPinLoading(true)
		try {
			await santriApi.loginEwalletPin(pinValue)
			setPinAuthenticated(true)
			onSuccess?.()
		} catch (err: any) {
			setPinError(err.message || "PIN yang kamu masukkan salah.")
			setPinInputVal("")
		} finally {
			setPinLoading(false)
		}
	}

	const handlePinSubmit = () => {
		submitPin(pinInputVal)
	}

	return (
		<div className="py-6">
			<RojaCard className="p-8 sm:p-12 text-center max-w-xl mx-auto shadow-xl rounded-2xl border-slate-100 bg-white dark:bg-[#17283c]">
				<div className="flex flex-col items-center">
					<div className="w-16 h-16 rounded-2xl bg-pink-50 dark:bg-pink-950/40 flex items-center justify-center mb-6 shadow-inner">
						<KeyRound className="w-8 h-8 text-[#e4007e]" />
					</div>

					<h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
						Masukkan pin
					</h3>
					<p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md">
						Memastikan bahwa benar dompet ini milik kamu.
					</p>

					{pinError && (
						<Alert variant="destructive" className="mt-4 text-xs py-2 max-w-sm">
							<AlertDescription>{pinError}</AlertDescription>
						</Alert>
					)}

					<div className="my-8">
						<PinInput
							value={pinInputVal}
							onChange={(val) => {
								setPinInputVal(val)
								if (val.length === 6) {
									setPinError("")
									submitPin(val)
								}
							}}
							disabled={pinLoading}
							error={!!pinError}
						/>
					</div>

					<button
						onClick={handlePinSubmit}
						disabled={pinLoading || pinInputVal.length < 6}
						className="w-full max-w-xs py-3.5 px-6 rounded-xl bg-[#e4007e] hover:bg-[#c9006f] text-white font-semibold text-sm shadow-md shadow-[#e4007e]/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{pinLoading ? "Memeriksa PIN..." : "Masuk ke Dompet"}
					</button>
				</div>
			</RojaCard>
		</div>
	)
}

export default PinChallengeGate
