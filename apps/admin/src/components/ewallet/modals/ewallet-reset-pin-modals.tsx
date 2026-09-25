import { useRef, useState, type JSX } from "react"

import LegacyButton from "@/components/legacy/legacy-button"
import { EwalletDoneIcon, EwalletPinIcon } from "@/components/ewallet/modals/ewallet-modal-icons"
import EwalletBsModal from "@/components/ewallet/modals/ewallet-bs-modal"
import { closeEwalletModal, openEwalletModal, useEwalletModalState } from "@/components/ewallet/modals/ewallet-modal-store"
import EwalletPincode, { type EwalletPincodeHandle } from "@/components/ewallet/modals/ewallet-pincode"
import { useEwalletResetPin, useRefreshEwallets } from "@/hooks/use-ewallet-money"
import { useEwalletSetting } from "@/hooks/use-ewallets"
import { legacyErrors } from "@/lib/legacy-errors"

// Legacy ewallet/_partials/modal-reset-pin.blade.php + modal-done-reset.blade.php, driven by
// public/assets/js/ewallet/reset-pin.js: enter a six-digit pin, "Selanjutnya", enter it again as
// "Konfirmasi Pin", POST it, then show the "Pin telah berhasil direset" modal.
const TITLE_CLASS =
	"m-0! my-[10px]! text-center text-[22px]! leading-[22.4px]! font-bold! tracking-[0px]! text-[var(--heading-txt-inverse)]! max-[768px]:text-[16px]!"
const PARAGRAPH_CLASS = "mt-0 mb-[20px] text-center leading-[24px]"

const STEP_ONE = { title: "Reset Pin", subtitle: (who: string) => `Ubah pin dompet untuk menarik saldo ${who}.` }
const STEP_TWO = { title: "Konfirmasi Pin", subtitle: "Untuk memastikan kamu ingat, masukkan ulang pin di bawah ini ya." }

// `.alert.tbr_alert-danger.tbr_weight-bold.text-center.mt-2.mb-0` (bootstrap `.alert` padding, app.css 1322 + 1342)
const ErrorAlert = ({ lines }: { lines: string[] }): JSX.Element => (
	<div role="alert" className="relative mt-[8px] mb-0 rounded-[8px] border-0 bg-[rgba(248,55,75,0.1)] px-[20px] py-[12px] text-center font-bold text-[var(--danger)]">
		{lines.map((line, index) => (
			<span key={index}>
				{line}
				<br />
			</span>
		))}
	</div>
)

type EwalletResetPinModalsProps = { ewalletId: number }

const EwalletResetPinModals = ({ ewalletId }: EwalletResetPinModalsProps): JSX.Element => {
	const state = useEwalletModalState()
	const setting = useEwalletSetting(ewalletId)
	const refresh = useRefreshEwallets()
	const resetPin = useEwalletResetPin(ewalletId)
	const first = useRef<EwalletPincodeHandle>(null)
	const second = useRef<EwalletPincodeHandle>(null)
	const [pin, setPin] = useState("")
	const [confirmPin, setConfirmPin] = useState("")
	const [confirming, setConfirming] = useState(false)
	const [alertLines, setAlertLines] = useState<string[]>([])

	const who = setting.data?.ownerType === "merchant" ? "merchant" : setting.data?.ownerType === "santri" ? "santri" : "-"

	// `resetForm(isClearPincode)`
	const resetForm = (clear = false): void => {
		setConfirming(false)
		setAlertLines([])
		if (clear) {
			window.setTimeout(() => {
				first.current?.reset()
				second.current?.reset()
			}, 500)
		}
	}

	const next = (): void => {
		if (confirming) {
			if (pin === confirmPin) {
				resetPin.mutate(pin, {
					onSuccess: () => {
						closeEwalletModal("resetPin")
						openEwalletModal("doneReset")
					},
					onError: (error) => {
						setAlertLines(legacyErrors(error))
						first.current?.reset()
					},
				})
			} else {
				setAlertLines(["Pin tidak cocok!"])
				second.current?.reset()
			}
			return
		}
		if (pin.length < 6) {
			setAlertLines(["Kolom pin harus 6 digit"])
			return
		}
		second.current?.reset()
		setAlertLines([])
		setConfirming(true)
	}

	const heading = confirming ? STEP_TWO : { title: STEP_ONE.title, subtitle: STEP_ONE.subtitle(who) }

	return (
		<>
			{/* modal-reset-pin: `data-backdrop="static" data-keyboard="false"` */}
			<EwalletBsModal id="modalResetPin" open={state.resetPin} isStatic>
				<EwalletPinIcon />
				<form autoComplete="off" onSubmit={(event) => event.preventDefault()}>
					<h5 id="title" className={TITLE_CLASS}>
						{heading.title}
					</h5>
					<p id="subtitle" className={PARAGRAPH_CLASS}>
						{heading.subtitle}
					</p>
					<div className="tbr_alert_wrapper">{alertLines.length > 0 ? <ErrorAlert lines={alertLines} /> : null}</div>
					<div className="my-[16px]">
						<div className={confirming ? "hidden" : undefined}>
							<EwalletPincode id="tbr_ewallet_pin" ref={first} autoFocus={state.resetPin} onInput={setPin} />
						</div>
						<div className={confirming ? undefined : "hidden"}>
							<EwalletPincode id="tbr_ewallet_pin2" ref={second} onInput={setConfirmPin} />
						</div>
					</div>
					<div className="flex justify-between px-[16px]">
						<LegacyButton
							variant="light"
							className="mr-[8px]"
							onClick={() => {
								if (confirming) resetForm()
								else {
									closeEwalletModal("resetPin")
									resetForm(true)
								}
							}}
						>
							Batal
						</LegacyButton>
						<LegacyButton variant="info" loading={resetPin.isPending} onClick={next}>
							Selanjutnya
						</LegacyButton>
					</div>
				</form>
			</EwalletBsModal>

			{/* modal-done-reset */}
			<EwalletBsModal id="modalDoneReset" open={state.doneReset} onClose={() => closeEwalletModal("doneReset")}>
				<EwalletDoneIcon />
				<h5 className={TITLE_CLASS}>Pin telah berhasil direset</h5>
				<p className={PARAGRAPH_CLASS}>Silakan gunakan pin untuk melakukan tarik saldo {who}.</p>
				<div className="flex justify-center px-[16px]">
					{/* legacy `<a href="">` reloads the page */}
					<LegacyButton
						variant="info"
						onClick={() => {
							closeEwalletModal("doneReset")
							void refresh()
						}}
					>
						Kembali
					</LegacyButton>
				</div>
			</EwalletBsModal>
		</>
	)
}

export default EwalletResetPinModals
