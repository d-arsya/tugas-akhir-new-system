import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import PageLayout from "@/components/page-layout"
import { BannedCard } from "@roja/ui"

const BannedPage = (): JSX.Element => {
	return (
		<PageLayout maxWidth="max-w-md" variant="center">
			<BannedCard contactInfo="Jika ini adalah kesalahan, hubungi sekretariat santri Pondok Roja." />
		</PageLayout>
	)
}

export const Route = createFileRoute("/banned")({
	component: BannedPage,
})

export default BannedPage
