import { useRef, useState, type JSX } from "react"

import LegacyButton from "@/components/legacy/legacy-button"
import { EwalletDoneIcon, EwalletPinIcon } from "@/components/ewallet/modals/ewallet-modal-icons"
import EwalletErrorAlert from "@/components/ewallet/modals/ewallet-error-alert"
import EwalletBsModal from "@/components/ewallet/modals/ewallet-bs-modal"
import { closeEwalletModal, openEwalletModal, useEwalletModalState } from "@/components/ewallet/modals/ewallet-modal-store"
import EwalletPincode, { type EwalletPincodeHandle } from "@/components/ewallet/modals/ewallet-pincode"
import { EWALLET_TITLE_CLASS } from "@/components/ewallet/modals/ewallet-title-class"
import { useEwalletResetPin, useRefreshEwallets } from "@/hooks/use-ewallet-money"
import { useEwalletSetting } from "@/hooks/use-ewallets"
import { legacyErrors } from "@/lib/legacy-errors"

const PARAGRAPH_CLASS = "mt-0 mb-[20px] text-center leading-[24px]"

const STEP_ONE = { title: "Reset Pin", subtitle: (who: string) => `Ubah pin dompet untuk menarik saldo ${who}.` }
const STEP_TWO = { title: "Konfirmasi Pin", subtitle: "Untuk memastikan kamu ingat, masukkan ulang pin di bawah ini ya." }

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
			<EwalletBsModal id="modalResetPin" open={state.resetPin} isStatic>
				<EwalletPinIcon />
				<form autoComplete="off" onSubmit={(event) => event.preventDefault()}>
					<h5 id="title" className={EWALLET_TITLE_CLASS}>
						{heading.title}
					</h5>
					<p id="subtitle" className={PARAGRAPH_CLASS}>
						{heading.subtitle}
					</p>
					<div className="tbr_alert_wrapper">{alertLines.length > 0 ? <EwalletErrorAlert lines={alertLines} /> : null}</div>
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

			<EwalletBsModal id="modalDoneReset" open={state.doneReset} onClose={() => closeEwalletModal("doneReset")}>
				<EwalletDoneIcon />
				<h5 className={EWALLET_TITLE_CLASS}>Pin telah berhasil direset</h5>
				<p className={PARAGRAPH_CLASS}>Silakan gunakan pin untuk melakukan tarik saldo {who}.</p>
				<div className="flex justify-center px-[16px]">
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
