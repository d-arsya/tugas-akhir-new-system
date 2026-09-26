import type { JSX, ReactNode } from "react"
import { Link } from "@tanstack/react-router"

import type { EwalletDetail } from "@roja/types"
import { cn } from "@roja/utils"

import { legacyButtonClass } from "@/components/legacy/legacy-button"
import LegacyTooltip from "@/components/legacy/legacy-tooltip"
import { rupiahDots } from "@/lib/legacy-format"
import { RIPPLE_CLASS, triggerRipple } from "@/lib/ripple"

import { InactiveNoticeIcon, SettingIcon, TopUpIcon, WithdrawIcon } from "./ewallet-icons"
import { EwalletTile } from "./ewallet-widgets"
import { useEwalletModals } from "./modals/ewallet-money-modals"

const ActionButton = ({
	enabled,
	onOpen,
	icon,
	children,
}: {
	enabled: boolean
	onOpen: () => void
	icon: ReactNode
	children: ReactNode
}): JSX.Element =>
	enabled ? (
		<a
			href="#"
			onClick={(event) => {
				triggerRipple(event)
				event.preventDefault()
				onOpen()
			}}
			className={legacyButtonClass("info", cn("mr-[16px]", RIPPLE_CLASS))}
		>
			<span className="mr-[4px] inline-flex">{icon}</span>
			{children}
		</a>
	) : (
		<a className={legacyButtonClass("info", "pointer-events-none mr-[16px] opacity-65")}>
			<span className="mr-[4px] inline-flex">{icon}</span>
			{children}
		</a>
	)

const EwalletDetailHeader = ({ detail }: { detail: EwalletDetail }): JSX.Element => {
	const { openTopUp, openWithdraw } = useEwalletModals()

	return (
		<div className="mx-[-15px] mb-[24px] flex flex-wrap items-center justify-between">
			<div className="w-full px-[15px] min-[1200px]:w-5/12">
				<EwalletTile
					variant="info"
					value={rupiahDots(detail.balance)}
					label="Total saldo"
					className="mb-[16px] min-[1200px]:mb-0"
				/>
			</div>
			<div className="w-full px-[15px] min-[1200px]:w-1/2">
				<div className="flex justify-center min-[1200px]:justify-end">
					<Link
						to="/ewallets/$ewalletId/setting"
						params={{ ewalletId: String(detail.id) }}
						onClick={triggerRipple}
						className={legacyButtonClass("info", cn("mr-[16px] p-[8px]", RIPPLE_CLASS))}
					>
						<SettingIcon />
					</Link>
					<ActionButton enabled={detail.canTopUp} onOpen={openTopUp} icon={<TopUpIcon />}>
						Isi Saldo
					</ActionButton>
					<ActionButton enabled={detail.canWithdraw} onOpen={openWithdraw} icon={<WithdrawIcon />}>
						Tarik Saldo
					</ActionButton>
					{detail.showInactiveNotice ? (
						<LegacyTooltip
							placement="left"
							content="Akun ini tidak dapat melakukan transaksi karena layanan eWallet saat ini dinonaktifkan."
							className="mr-[8px]"
						>
							<a
								onClick={triggerRipple}
								className={legacyButtonClass(
									"light",
									cn(
										"inline-flex bg-[rgba(255,168,0,0.16)] p-[8px] text-[var(--warning)] hover:bg-[var(--warning)] hover:text-white focus:bg-[var(--warning)] focus:text-white [&:hover_circle]:fill-white [&:hover_path]:fill-white",
										RIPPLE_CLASS,
									),
								)}
							>
								<InactiveNoticeIcon />
							</a>
						</LegacyTooltip>
					) : null}
				</div>
			</div>
		</div>
	)
}

export default EwalletDetailHeader
