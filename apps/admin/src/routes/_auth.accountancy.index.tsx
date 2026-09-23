import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AccountancyForm from "@/components/accountancy/accountancy-form"
import AccountancyTable from "@/components/accountancy/accountancy-table"
import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyCard from "@/components/legacy/legacy-card"

// Legacy accountancy/index.blade.php
export const Route = createFileRoute("/_auth/accountancy/")({
	component: AccountancyIndexPage,
})

function AccountancyIndexPage(): JSX.Element {
	return (
		<>
			<AdminPageTitle title="Akun" breadcrumbs={[{ label: "Data Master", to: "/accountancy" }, { label: "Keuangan", to: "/accountancy" }, { label: "Akun" }]} />

			{/* `.row.justify-content-center > .col-xl-4 + .col-xl-8` (both `col-lg-*` at the same split) */}
			<div className="mx-[-15px] flex flex-wrap justify-center">
				<div className="w-full px-[15px] min-[992px]:max-w-[33.333333%] min-[992px]:flex-[0_0_33.333333%]">
					<AccountancyForm />
				</div>
				<div className="w-full px-[15px] min-[992px]:max-w-[66.666667%] min-[992px]:flex-[0_0_66.666667%]">
					{/* `.card.tbr_card > .card-body.overflow-hidden.p-4` */}
					<LegacyCard bodyClassName="overflow-hidden">
						<AccountancyTable />
					</LegacyCard>
				</div>
			</div>
		</>
	)
}

export default AccountancyIndexPage
