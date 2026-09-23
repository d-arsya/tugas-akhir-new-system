import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"

// Legacy student-capability/academic-year.blade.php — level 1 of the five-level
// drill-down. Implemented in phase 2.
export const Route = createFileRoute("/_auth/student-capabilities/")({
	component: StudentCapabilityYearsPage,
})

function StudentCapabilityYearsPage(): JSX.Element {
	return (
		<>
			<AdminPageTitle
				title="Kesanggupan"
				breadcrumbs={[
					{ label: "Pembayaran Santri", to: "/student-capabilities" },
					{ label: "Kesanggupan" },
				]}
			/>
		</>
	)
}

export default StudentCapabilityYearsPage
