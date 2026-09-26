import { createFileRoute } from "@tanstack/react-router"

import ReportArrearsPage from "@/components/reports/report-arrears-page"

export const Route = createFileRoute("/_auth/reports/arrears")({
	component: ReportArrearsPage,
})
