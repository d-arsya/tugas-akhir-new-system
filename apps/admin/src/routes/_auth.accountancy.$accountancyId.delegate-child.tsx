import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AccountancyDeleteCard from "@/components/accountancy/accountancy-delete-card"
import AdminPageTitle from "@/components/layout/admin-page-title"
import { useDelegateAccountancyChild } from "@/hooks/use-accountancy"

// Legacy accountancy/delete/delegate-child.blade.php — linked instead of the plain confirm when
// the account has children. Only the **direct** children are re-parented; a grandchild keeps
// pointing at its own parent, so whole subtrees travel with the child that carries them.
export const Route = createFileRoute("/_auth/accountancy/$accountancyId/delegate-child")({
	component: AccountancyDelegateChildPage,
})

function AccountancyDelegateChildPage(): JSX.Element {
	const { accountancyId } = Route.useParams()
	const id = Number(accountancyId)
	const submit = useDelegateAccountancyChild(id)

	return (
		<>
			<AdminPageTitle title="Hapus Akun" breadcrumbs={[{ label: "…", dropdown: [{ label: "Data Master", to: "/accountancy" }] }, { label: "Keuangan", to: "/accountancy" }, { label: "Akun", to: "/accountancy" }, { label: "Hapus" }]} />

			<AccountancyDeleteCard accountancyId={id} step="delegate-child" submit={submit} />
		</>
	)
}

export default AccountancyDelegateChildPage
