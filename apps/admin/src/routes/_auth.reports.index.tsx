import { createFileRoute } from "@tanstack/react-router"

import ReportIndexPage from "@/components/reports/report-index-page"

export const Route = createFileRoute("/_auth/reports/")({
	component: ReportIndexPage,
})
