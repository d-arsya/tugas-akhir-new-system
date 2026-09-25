import { useState, type JSX } from "react"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyCard from "@/components/legacy/legacy-card"
import { NO_EWALLET_FILTERS, useEwalletTable, useEwalletWidget, type EwalletFilters } from "@/hooks/use-ewallets"

import EwalletTable from "./ewallet-table"
import EwalletToolbar from "./ewallet-toolbar"
import EwalletWidgets from "./ewallet-widgets"

/**
 * Legacy `ewallet/index.blade.php`: the three tiles, then the card holding the toolbar and the
 * server-side table. Changing either filter redraws the table **and** refetches the tiles
 * (`ewalletDatatable.draw()` + `defaultEwalletWidget(...)`).
 */
const EwalletList = (): JSX.Element => {
	const [filters, setFilters] = useState<EwalletFilters>(NO_EWALLET_FILTERS)
	const table = useEwalletTable(filters)
	const widget = useEwalletWidget(filters)

	const changeFilters = (next: EwalletFilters): void => {
		setFilters(next)
		// A new filter starts from page 1, as `draw()` without `false` does
		table.setState({ ...table.state, page: 1 })
	}

	return (
		<>
			<AdminPageTitle title="Dompet" breadcrumbs={[{ label: "Dompet" }]} />

			<EwalletWidgets widget={widget.data} />

			{/* `.row.pt-0 > .col > .card.tbr_card > .card-body.p-4` — `.content-body > .row:not(.tbr_dashboard)` has a min-height */}
			<div className="mx-[-15px] flex min-h-[calc(100vh-216px)] flex-wrap pt-0">
				<div className="w-full min-w-0 flex-1 basis-0 px-[15px]">
					<LegacyCard>
						<EwalletToolbar state={table.state} onStateChange={table.setState} filters={filters} onFiltersChange={changeFilters} />
						<EwalletTable table={table} />
					</LegacyCard>
				</div>
			</div>
		</>
	)
}

export default EwalletList
