import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AccountancyDeleteCard from "@/components/accountancy/accountancy-delete-card"
import AdminPageTitle from "@/components/layout/admin-page-title"
import { useDeleteAccountancy } from "@/hooks/use-accountancy"

// Legacy accountancy/delete/delete.blade.php — linked only when the account has no children.
// Its `@section('title', 'Delegasi')` names the wrong page (this is the plain confirm, not the
// delegation); corrected to "Hapus Akun", which is what the header already says.
export const Route = createFileRoute("/_auth/accountancy/$accountancyId/delete")({
	component: AccountancyDeletePage,
})

function AccountancyDeletePage(): JSX.Element {
	const { accountancyId } = Route.useParams()
	const id = Number(accountancyId)
	const submit = useDeleteAccountancy(id)

	return (
		<>
			<AdminPageTitle title="Hapus Akun" breadcrumbs={[{ label: "…", dropdown: [{ label: "Data Master", to: "/accountancy" }] }, { label: "Keuangan", to: "/accountancy" }, { label: "Akun", to: "/accountancy" }, { label: "Hapus" }]} />

			<AccountancyDeleteCard accountancyId={id} step="delete" submit={submit} />
		</>
	)
}

export default AccountancyDeletePage
