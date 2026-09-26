import type { JSX } from "react"
import { Link } from "@tanstack/react-router"

import AdminPageTitle, { CRUMB_LINK_CLASS } from "@/components/layout/admin-page-title"
import { legacyButtonClass } from "@/components/legacy/legacy-button"
import LegacyCard from "@/components/legacy/legacy-card"
import { EwalletBlockedIcon } from "@/components/ewallet/modals/ewallet-modal-icons"
import { EWALLET_TITLE_CLASS } from "@/components/ewallet/modals/ewallet-title-class"
import { useForceSidebarCollapsed } from "@/hooks/use-force-sidebar-collapsed"

type EwalletBlockedPageProps = { ewalletId: number }

const EwalletBlockedPage = ({ ewalletId }: EwalletBlockedPageProps): JSX.Element => {
	useForceSidebarCollapsed()

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

			<div className="flex w-full flex-col justify-center min-[992px]:flex-row">
				<div className="mx-0! mb-[20px] w-full min-[992px]:w-[37%]">
					<LegacyCard bodyClassName="p-[24px]">
						<EwalletBlockedIcon />
						<h5 className={EWALLET_TITLE_CLASS}>Akun Anda telah diblokir</h5>
						<p className="mt-0 mb-[20px] text-center leading-[24px]">
							Hubungi Kasir E-Wallet untuk mengaktifkan kembali akun dompet digital Anda dan membuat pin baru.
						</p>
						<div className="flex justify-center">
							<Link to="/ewallets/$ewalletId" params={{ ewalletId: String(ewalletId) }} className={legacyButtonClass("info")}>
								Kembali
							</Link>
						</div>
					</LegacyCard>
				</div>
			</div>
		</>
	)
}

export default EwalletBlockedPage
