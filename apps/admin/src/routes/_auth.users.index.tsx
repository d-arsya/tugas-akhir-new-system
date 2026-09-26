import type { JSX } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import { legacyButtonClass } from "@/components/legacy/legacy-button"
import LegacyCard from "@/components/legacy/legacy-card"
import UserTable from "@/components/users/user-table"

export const Route = createFileRoute("/_auth/users/")({
	component: UsersIndexPage,
})

function UsersIndexPage(): JSX.Element {
	return (
		<>
			<AdminPageTitle
				title="Semua Pengelola"
				breadcrumbs={[{ label: "Lainnya", to: "/users" }, { label: "Pengelola", to: "/users" }, { label: "Semua" }]}
			/>

			<div className="mx-[-15px] flex flex-wrap">
				<div className="w-full min-w-0 flex-1 px-[15px]">
					<div className="text-right">
						<Link to="/users/create" className={legacyButtonClass("primary", "mb-[16px]")}>
							Tambah Pengelola
						</Link>
					</div>
					<LegacyCard bodyClassName="overflow-hidden">
						<UserTable />
					</LegacyCard>
				</div>
			</div>
		</>
	)
}

export default UsersIndexPage
