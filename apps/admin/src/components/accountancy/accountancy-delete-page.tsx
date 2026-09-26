import type { JSX } from "react"

import AdminPageTitle from "@/components/layout/admin-page-title"
import { useDeleteAccountancy } from "@/hooks/use-accountancy"

import AccountancyDeleteCard from "./accountancy-delete-card"

const AccountancyDeletePage = ({ accountancyId }: { accountancyId: number }): JSX.Element => {
	const submit = useDeleteAccountancy(accountancyId)

	return (
		<>
			<AdminPageTitle title="Hapus Akun" breadcrumbs={[{ label: "…", dropdown: [{ label: "Data Master", to: "/accountancy" }] }, { label: "Keuangan", to: "/accountancy" }, { label: "Akun", to: "/accountancy" }, { label: "Hapus" }]} />

			<AccountancyDeleteCard accountancyId={accountancyId} step="delete" submit={submit} />
		</>
	)
}

export default AccountancyDeletePage
