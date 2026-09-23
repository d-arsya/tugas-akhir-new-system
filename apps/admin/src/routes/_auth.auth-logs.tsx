import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import AuthLogTable from "@/components/auth-logs/auth-log-table"
import LegacyCard from "@/components/legacy/legacy-card"
import { requireRoles } from "@/lib/route-guards"

// WS-A: legacy auth-log/index.blade.php
export const Route = createFileRoute("/_auth/auth-logs")({
	beforeLoad: () => requireRoles("superadmin"),
	component: AuthLogsPage,
})

function AuthLogsPage(): JSX.Element {
	return (
		<>
			<AdminPageTitle
				title="Authentication Log"
				breadcrumbs={[{ label: "Lainnya", to: "/auth-logs" }, { label: "Authentication Log" }]}
			/>

			{/* `.row > .col` */}
			<div className="mx-[-15px] flex flex-wrap">
				<div className="w-full min-w-0 flex-1 px-[15px]">
					{/* `.card-body.overflow-hidden` — this page leaves out `p-4`, so bootstrap's 20px stays */}
					<LegacyCard bodyClassName="overflow-hidden p-[20px]">
						<AuthLogTable />
					</LegacyCard>
				</div>
			</div>
		</>
	)
}

export default AuthLogsPage
