import { createFileRoute } from "@tanstack/react-router"

import ReportIncomePage from "@/components/reports/report-income-page"

export const Route = createFileRoute("/_auth/reports/income")({
	component: ReportIncomePage,
})
