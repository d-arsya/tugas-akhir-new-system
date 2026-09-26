import type { JSX } from "react"
import { Link } from "@tanstack/react-router"

import AdminPageTitle, { CRUMB_LINK_CLASS } from "@/components/layout/admin-page-title"
import { useEwalletSetting } from "@/hooks/use-ewallets"

import { EwalletOwnerCard, EwalletQrCard } from "./ewallet-owner-cards"
import EwalletResetPinCard from "./ewallet-reset-pin-card"
import EwalletStatusCard, { EwalletBlockedNotice } from "./ewallet-status-card"
import EwalletResetPinModals from "./modals/ewallet-reset-pin-modals"

const EwalletSetting = ({ ewalletId }: { ewalletId: number }): JSX.Element => {
	const { data: setting } = useEwalletSetting(ewalletId)

	return (
		<>
			<AdminPageTitle
				title="Pengaturan"
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
					{ label: "Pengaturan" },
				]}
			/>

			{setting ? (
				<div className="mx-[-15px] flex min-h-[calc(100vh-216px)] flex-wrap">
					<div className="w-full px-[15px] min-[992px]:w-1/4">
						<EwalletOwnerCard owner={setting.owner} isActive={setting.isActive} dashForMissingName={false} />
						<EwalletQrCard
							ewalletId={setting.id}
							qrValue={setting.uniqueId}
							caption={
								setting.owner.kind === "santri" ? `NISP ${setting.owner.nis ?? ""}` : `No Merchant ${setting.uniqueId ?? ""}`
							}
						/>
					</div>
					<div className="w-full px-[15px] min-[992px]:w-3/4">
						{setting.ownerBlocked ? <EwalletBlockedNotice setting={setting} /> : null}
						<EwalletResetPinCard key={setting.resetEmailRetryAfter} setting={setting} />
						{!setting.ownerBlocked ? <EwalletStatusCard key={String(setting.isActive)} setting={setting} /> : null}
					</div>
				</div>
			) : null}

			<EwalletResetPinModals ewalletId={ewalletId} />
		</>
	)
}

export default EwalletSetting
