import type { JSX } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import { legacyButtonClass } from "@/components/legacy/legacy-button"
import LegacyCard from "@/components/legacy/legacy-card"
import MerchantTable from "@/components/merchants/merchant-table"

// Legacy merchant/index.blade.php — note the breadcrumb says 'Master Data', reversed, and 'Data merchant' lowercase
export const Route = createFileRoute("/_auth/merchants/")({
	component: MerchantsIndexPage,
})

function MerchantsIndexPage(): JSX.Element {
	return (
		<>
			<AdminPageTitle title="Semua Merchant" breadcrumbs={[{ label: "Master Data", to: "/merchants" }, { label: "Merchant", to: "/merchants" }, { label: "Data merchant" }]} />

			{/* The blade has no `.row` wrapper here — the button and the card sit straight in the container */}
			<div className="text-right">
				<Link to="/merchants/create" className={legacyButtonClass("info", "mb-[16px]")}>
					Tambah Merchant
				</Link>
			</div>
			{/* `.card.tbr_card > .card-body.p-4` */}
			<LegacyCard>
				<MerchantTable />
			</LegacyCard>
		</>
	)
}

export default MerchantsIndexPage
