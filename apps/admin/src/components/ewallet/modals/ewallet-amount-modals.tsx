import { useEffect, useRef, useState, type JSX, type ReactNode } from "react"
import { useRouter } from "@tanstack/react-router"

import type { EwalletDetail, EwalletMoneyResult } from "@roja/types"

import LegacyButton from "@/components/legacy/legacy-button"
import LegacyCurrencyInput from "@/components/legacy/legacy-currency-input"
import { closeEwalletModal, openEwalletModal, useEwalletModalState, type EwalletModalName } from "@/components/ewallet/modals/ewallet-modal-store"
import { EwalletTopUpIcon, EwalletWithdrawIcon } from "@/components/ewallet/modals/ewallet-modal-icons"
import EwalletBsModal from "@/components/ewallet/modals/ewallet-bs-modal"
import { useEwalletParkWithdraw, useEwalletTopUp, useRefreshEwallets } from "@/hooks/use-ewallet-money"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"

// Legacy ewallet/top-up-modal.blade.php + top-up-confirmation-modal.blade.php and
// withdraw-modal.blade.php + withdraw-confirmation-modal.blade.php. The two pairs differ only in
// their words, icon, ids and the endpoint the form posts to, so one component renders both.
export type AmountKind = "topUp" | "withdraw"

const COPY = {
	topUp: {
		modal: "topUp",
		confirm: "topUpConfirm",
		modalId: "tbr_top_up_modal",
		confirmId: "tbr_top_up_confirmation_modal",
		amountId: "top-up-amount",
		Icon: EwalletTopUpIcon,
		title: "Isi saldo",
		lead: "yang Anda terima dari",
		confirmText: "Transaksi pengisian saldo akan diproses.",
	},
	withdraw: {
		modal: "withdraw",
		confirm: "withdrawConfirm",
		modalId: "tbr_withdraw_modal",
		confirmId: "tbr_withdraw_confirmation_modal",
		amountId: "withdraw-amount",
		Icon: EwalletWithdrawIcon,
		title: "Tarik saldo",
		lead: "yang ingin ditarik oleh",
		confirmText: "Transaksi penarikan saldo akan diproses.",
	},
} as const

// `<h5 class="tbr_weight-bold text-center">`: app.css 306 (22px, 16px below 768px), line-height 1.4rem, porto `h5 { margin: 10px 0 }`; `!` beats globals.css
const TITLE_CLASS =
	"m-0! my-[10px]! text-center text-[22px]! leading-[22.4px]! font-bold! tracking-[0px]! text-[var(--heading-txt-inverse)]! max-[768px]:text-[16px]!"
// porto `p { line-height: 24px; margin: 0 0 20px }`
const PARAGRAPH_CLASS = "mt-0 mb-[20px] leading-[24px]"

// bootstrap `.col-lg-1.col-md-1` spacer, `.col-5`, `.col-1`, `.col-5` inside `.row.w-100`
const COL_SPACER = "relative w-full px-[15px] min-[768px]:w-[8.333333%] min-[768px]:flex-none"
const COL_5 = "relative w-[41.666667%] flex-none px-[15px]"
const COL_1 = "relative w-[8.333333%] flex-none px-[15px]"

const ConfirmRow = ({ label, children, valueIsParagraph = false }: { label: string; children: ReactNode; valueIsParagraph?: boolean }): JSX.Element => (
	<div className="flex justify-center">
		<div className="-ml-[15px] -mr-[15px] flex w-full flex-wrap">
			<div className={COL_SPACER} />
			<div className={COL_5}>
				<p className={PARAGRAPH_CLASS}>{label}</p>
			</div>
			<div className={COL_1}>:</div>
			<div className={COL_5}>{valueIsParagraph ? <p className={PARAGRAPH_CLASS}>{children}</p> : children}</div>
		</div>
	</div>
)

// The `?` icon both confirmation blades carry, byte for byte
const ConfirmIcon = (): JSX.Element => (
	<svg width="67" height="67" viewBox="0 0 67 67" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline">
		<path opacity="0.3" d="M33.5 62C49.2401 62 62 49.2401 62 33.5C62 17.7599 49.2401 5 33.5 5C17.7599 5 5 17.7599 5 33.5C5 49.2401 17.7599 62 33.5 62Z" fill="#FFA800" />
		<path fillRule="evenodd" clipRule="evenodd" d="M33.409 44.978C33.9776 44.978 34.5335 45.1466 35.0063 45.4625C35.4791 45.7784 35.8476 46.2274 36.0652 46.7528C36.2828 47.2781 36.3397 47.8562 36.2288 48.4139C36.1178 48.9716 35.844 49.4838 35.4419 49.8859C35.0399 50.288 34.5276 50.5618 33.9699 50.6727C33.4122 50.7837 32.8341 50.7267 32.3088 50.5091C31.7834 50.2915 31.3344 49.923 31.0185 49.4502C30.7026 48.9775 30.534 48.4216 30.534 47.853C30.534 47.0905 30.8369 46.3592 31.3761 45.82C31.9152 45.2809 32.6465 44.978 33.409 44.978ZM29.358 41.724V36.954H32.981C34.0396 36.9707 35.0906 36.7714 36.0696 36.3684C37.0487 35.9654 37.9353 35.3671 38.6755 34.61C39.4156 33.853 39.9937 32.953 40.3745 31.9651C40.7552 30.9771 40.9306 29.922 40.89 28.864C40.9306 27.806 40.7552 26.7508 40.3745 25.7629C39.9937 24.775 39.4156 23.875 38.6755 23.1179C37.9353 22.3608 37.0487 21.7625 36.0696 21.3595C35.0906 20.9565 34.0396 20.7573 32.981 20.774C28.332 20.774 25.132 24.274 25.132 28.864H20C19.9839 27.1603 20.3096 25.4707 20.9577 23.895C21.6059 22.3193 22.5634 20.8896 23.7735 19.6903C24.9837 18.491 26.4221 17.5465 28.0035 16.9127C29.585 16.2788 31.2775 15.9685 32.981 16C34.6833 15.9788 36.3729 16.2957 37.9517 16.9325C39.5306 17.5692 40.9673 18.5131 42.1786 19.7094C43.3899 20.9056 44.3516 22.3305 45.008 23.9013C45.6644 25.4721 46.0024 27.1576 46.0024 28.86C46.0024 30.5624 45.6644 32.2479 45.008 33.8187C44.3516 35.3895 43.3899 36.8143 42.1786 38.0106C40.9673 39.2069 39.5306 40.1508 37.9517 40.7875C36.3729 41.4243 34.6833 41.7412 32.981 41.72L29.358 41.724Z" fill="#FFA800" />
	</svg>
)

type AmountModalsProps = { kind: AmountKind; detail: EwalletDetail }

const EwalletAmountModals = ({ kind, detail }: AmountModalsProps): JSX.Element => {
	const copy = COPY[kind]
	const state = useEwalletModalState()
	const router = useRouter()
	const refresh = useRefreshEwallets()
	const [amount, setAmount] = useState("")
	const timer = useRef<number | undefined>(undefined)

	useEffect(() => () => window.clearTimeout(timer.current), [])

	const topUp = useEwalletTopUp(detail.id)
	const park = useEwalletParkWithdraw(detail.id)
	const mutation = kind === "topUp" ? topUp : park

	// `defaultAjax`: notice, then `window.location = res.redirect` 1000 ms later (a reload when it is the same page)
	const submission = useLegacySubmit<string, EwalletMoneyResult>({
		mutationFn: (masked) => mutation.mutateAsync(masked),
		onDone: (data) => {
			closeEwalletModal(copy.modal)
			setAmount("")
			void refresh()
			if (data.redirect && data.redirect !== `/ewallets/${detail.id}`) router.history.push(data.redirect)
		},
	})

	const who = detail.ownerType === "santri" ? "santri" : "merchant"
	const shownAmount = amount !== "" ? amount : "0"

	const dismiss = (name: EwalletModalName) => (): void => closeEwalletModal(name)

	return (
		<>
			{/* top-up-modal / withdraw-modal */}
			<EwalletBsModal id={copy.modalId} open={state[copy.modal]} onClose={dismiss(copy.modal)}>
				<copy.Icon />
				<form
					autoComplete="off"
					onSubmit={(event) => {
						event.preventDefault()
						openEwalletModal(copy.confirm)
					}}
				>
					<h5 className={TITLE_CLASS}>{copy.title}</h5>
					<p className={`${PARAGRAPH_CLASS} text-center`}>
						Masukkan nominal sesuai dengan uang <br /> {copy.lead} {who}.
					</p>
					{/* `.form-group.tbr_w-lg-290px.my-4.px-3` — the 290px class has no rule in app.css */}
					<div className="my-[24px] px-[16px]">
						<label className="m-0 flex" htmlFor={`${copy.modalId}-amount`}>
							Nominal
							<span className="m-0 mb-[4px] ml-[8px] p-0 text-[11px] leading-[20px] font-normal text-[var(--grey)] opacity-80">required</span>
						</label>
						<div className="relative flex w-full flex-wrap items-stretch">
							<span className="mr-[-2px] flex items-center justify-center rounded-l-[6px] border-2 border-[var(--bg-form-border)]! bg-[var(--bg-form)] px-[12px] py-[4px] text-[var(--grey)]">
								Rp
							</span>
							<LegacyCurrencyInput
								id={`${copy.modalId}-amount`}
								name="amount"
								value={amount}
								onChange={setAmount}
								className="relative w-[1%] min-w-0 flex-auto rounded-l-none focus:z-[3]"
							/>
						</div>
					</div>
					<div className="flex justify-between px-[16px]">
						<LegacyButton variant="light" className="mr-[8px]" onClick={dismiss(copy.modal)}>
							Batal
						</LegacyButton>
						<LegacyButton variant="info" type="submit" loading={submission.submitting}>
							Selanjutnya
						</LegacyButton>
					</div>
				</form>
			</EwalletBsModal>

			{/* top-up-confirmation-modal / withdraw-confirmation-modal */}
			<EwalletBsModal id={copy.confirmId} open={state[copy.confirm]} onClose={dismiss(copy.confirm)}>
				<div className="mb-[16px] text-center">
					<ConfirmIcon />
				</div>
				<h5 className={`${TITLE_CLASS} mb-[24px]!`}>Konfirmasi</h5>
				<ConfirmRow label="ID eWallet">{detail.uniqueId}</ConfirmRow>
				<ConfirmRow label="Total Pembayaran" valueIsParagraph>
					<span id={copy.amountId}>Rp {shownAmount}</span>
				</ConfirmRow>
				<ConfirmRow label="Metode">Cash</ConfirmRow>
				<div className="flex justify-center">
					<p className={`${PARAGRAPH_CLASS} w-3/4 text-center`}>
						{copy.confirmText}
						<br />
						Apakah benar ingin melanjutkannya?
					</p>
				</div>
				<div className="flex justify-center px-[16px]">
					<LegacyButton variant="light" className="mr-[24px]" onClick={dismiss(copy.confirm)}>
						Batal
					</LegacyButton>
					<LegacyButton
						variant="warning"
						onClick={() => {
							closeEwalletModal(copy.confirm)
							// top-up waits 500 ms for the confirmation to fade; withdraw posts at once
							if (kind === "topUp") timer.current = window.setTimeout(() => submission.submit(amount), 500)
							else submission.submit(amount)
						}}
					>
						Konfirmasi
					</LegacyButton>
				</div>
			</EwalletBsModal>
		</>
	)
}

export default EwalletAmountModals
