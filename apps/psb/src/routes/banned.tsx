import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { BannedCard, PageLayout, RojaHeader } from "@roja/ui"

const BannedPage = (): JSX.Element => {
	return (
		<PageLayout header={<RojaHeader roleLabel="PENDAFTAR" isAuthenticated={false} />} maxWidth="max-w-md" variant="center">
			<BannedCard contactInfo="Jika ini adalah kesalahan, hubungi sekretariat pendaftaran Pondok Roja." />
		</PageLayout>
	)
}

export const Route = createFileRoute("/banned")({
	component: BannedPage,
})

export default BannedPage
