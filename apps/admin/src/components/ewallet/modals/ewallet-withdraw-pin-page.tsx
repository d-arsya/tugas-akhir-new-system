import { useEffect, useRef, useState, type JSX } from "react"
import { Link, useRouter } from "@tanstack/react-router"

import AdminPageTitle, { CRUMB_LINK_CLASS } from "@/components/layout/admin-page-title"
import LegacyButton, { legacyButtonClass } from "@/components/legacy/legacy-button"
import LegacyCard from "@/components/legacy/legacy-card"
import { legacyNotify } from "@/components/legacy/legacy-notify"
import { EwalletWithdrawIcon } from "@/components/ewallet/modals/ewallet-modal-icons"
import EwalletPincode, { type EwalletPincodeHandle } from "@/components/ewallet/modals/ewallet-pincode"
import { useEwalletPendingWithdraw, useEwalletVerifyPin, useEwalletWithdraw, useRefreshEwallets } from "@/hooks/use-ewallet-money"
import { useEwalletDetail } from "@/hooks/use-ewallets"
import { useForceSidebarCollapsed } from "@/hooks/use-force-sidebar-collapsed"
import { legacyErrors } from "@/lib/legacy-errors"

// Legacy ewallet/validate-pin.blade.php + public/assets/js/ewallet/validate-pin.js: the santri types the
// six-digit pin, "Konfirmasi" checks it and then posts the withdrawal.
const TITLE_CLASS =
	"m-0! my-[10px]! text-center text-[22px]! leading-[22.4px]! font-bold! tracking-[0px]! text-[var(--heading-txt-inverse)]! max-[768px]:text-[16px]!"

type ErrorBody = { redirect?: string; message?: string }
const bodyOf = (error: unknown): ErrorBody | undefined => (error as { response?: { data?: ErrorBody } })?.response?.data

// validate-pin.js: the lock message is matched by text, and its `redirect` is followed at once
const LOCKED = "Terlalu banyak percobaan. Silahkan coba lagi nanti."

type EwalletWithdrawPinPageProps = { ewalletId: number }

const EwalletWithdrawPinPage = ({ ewalletId }: EwalletWithdrawPinPageProps): JSX.Element => {
	useForceSidebarCollapsed()
	const router = useRouter()
	const detail = useEwalletDetail(ewalletId)
	const pending = useEwalletPendingWithdraw(ewalletId)
	const verify = useEwalletVerifyPin(ewalletId)
	const withdraw = useEwalletWithdraw(ewalletId)
	const refresh = useRefreshEwallets()
	const pincode = useRef<EwalletPincodeHandle>(null)
	const [pin, setPin] = useState("")
	const [alertLines, setAlertLines] = useState<string[]>([])
	const [busy, setBusy] = useState(false)

	// Nothing parked (a reload after the withdrawal, or the ten minutes ran out): back to the wallet
	useEffect(() => {
		if (pending.isSuccess && pending.data === null) router.history.replace(`/ewallets/${ewalletId}`)
	}, [pending.isSuccess, pending.data, ewalletId, router])

	const who = detail.data?.ownerType === "merchant" ? "merchant" : "santri"

	const confirm = (): void => {
		setBusy(true)
		verify.mutate(pin, {
			// `.done`: `defaultAjax($('#withdraw_form'))` — notice, then the redirect 1000 ms later
			onSuccess: () => {
				pincode.current?.reset()
				withdraw.mutate(undefined, {
					onSuccess: (data) => {
						legacyNotify.success(data.message)
						window.setTimeout(() => {
							void refresh()
							router.history.push(data.redirect ?? `/ewallets/${ewalletId}`)
						}, 1000)
					},
					onError: (error) => {
						setBusy(false)
						legacyNotify.error(legacyErrors(error))
						const redirect = bodyOf(error)?.redirect
						if (bodyOf(error)?.message === "Saldo tidak mencukupi." && redirect) {
							window.setTimeout(() => router.history.push(redirect), 1000)
						}
					},
				})
			},
			onError: (error) => {
				const body = bodyOf(error)
				setBusy(false)
				pincode.current?.reset()
				if (body?.message === LOCKED && body.redirect) {
					router.history.push(body.redirect)
					return
				}
				setAlertLines(legacyErrors(error))
			},
		})
	}

	return (
		<>
			<AdminPageTitle
				title="Detail"
				breadcrumbs={[
					{ label: "Dompet", to: "/ewallets" },
					{
						label: "Transaksi",
						node: (
							<Link to="/ewallets/$ewalletId" params={{ ewalletId: String(ewalletId) }} className={CRUMB_LINK_CLASS}>
								Transaksi
							</Link>
						),
					},
					{ label: "Detail" },
				]}
			/>

			{/* `.tbr_custom_row.justify-content-center > .tbr_col_info.mx-0` (detail-transaction.css 4-30) */}
			<div className="flex w-full flex-col justify-center min-[992px]:flex-row">
				<div className="mx-0! mb-[20px] w-full min-[992px]:w-[37%]">
					<LegacyCard bodyClassName="p-[24px]">
						<EwalletWithdrawIcon />
						<form autoComplete="off" onSubmit={(event) => event.preventDefault()}>
							<h5 className={TITLE_CLASS}>Tarik saldo</h5>
							<p className="mt-0 mb-[20px] text-center leading-[24px]">
								Minta {who} untuk memasukkan pin dompet <br /> dengan keyboard yang Anda punya.
							</p>
							<div className="tbr_alert_wrapper">
								{alertLines.length > 0 ? (
									<div role="alert" className="relative mt-[8px] mb-0 rounded-[8px] border-0 bg-[rgba(248,55,75,0.1)] px-[20px] py-[12px] text-center font-bold text-[var(--danger)]">
										{alertLines.map((line, index) => (
											<span key={index}>
												{line}
												<br />
											</span>
										))}
									</div>
								) : null}
							</div>
							<div className="my-[16px]">
								<EwalletPincode id="tbr_ewallet_pin" ref={pincode} autoFocus onInput={setPin} />
							</div>
							<div className="flex justify-between px-[16px]">
								<Link to="/ewallets/$ewalletId" params={{ ewalletId: String(ewalletId) }} className={legacyButtonClass("light", "mr-[8px]")}>
									Batal
								</Link>
								<LegacyButton variant="info" loading={busy} onClick={confirm}>
									Konfirmasi
								</LegacyButton>
							</div>
						</form>
					</LegacyCard>
				</div>
			</div>
		</>
	)
}

export default EwalletWithdrawPinPage
