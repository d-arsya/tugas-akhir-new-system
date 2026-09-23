import type { JSX } from "react"
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router"

import type { MerchantPayload } from "@roja/types"

import AdminPageTitle, { type AdminBreadcrumb } from "@/components/layout/admin-page-title"
import MerchantForm from "@/components/merchants/merchant-form"
import { useMerchant, useUpdateMerchant } from "@/hooks/use-merchants"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"

// Legacy merchant/detail.blade.php — legacy's <title> wrongly says 'Tambah Merchant'; corrected
export const Route = createFileRoute("/_auth/merchants/$merchantId/edit")({
	component: MerchantEditPage,
})

// `merchant/partials/detail-page-header.blade.php` — all three parents are <a> to
// `merchant.index`; only "Detail" is a bare <span>
const BREADCRUMBS: AdminBreadcrumb[] = [
	{ label: "Master Data", to: "/merchants" },
	{ label: "Merchant", to: "/merchants" },
	{ label: "Data Merchant", to: "/merchants" },
	{ label: "Detail" },
]

function MerchantEditPage(): JSX.Element {
	const { merchantId } = useParams({ from: "/_auth/merchants/$merchantId/edit" })
	const navigate = useNavigate()
	const id = Number(merchantId)
	const merchant = useMerchant(id)
	const updateMerchant = useUpdateMerchant(id)

	// `data-redirect="{{ route('merchant.index') }}"` — the detail form goes back to the list too
	const save = useLegacySubmit({
		mutationFn: (payload: MerchantPayload) => updateMerchant.mutateAsync(payload),
		onDone: () => void navigate({ to: "/merchants" }),
	})

	const detail = merchant.data

	return (
		<>
			<AdminPageTitle title="Detail Merchant" breadcrumbs={BREADCRUMBS} />

			{detail ? (
				<MerchantForm
					mode="edit"
					initial={{
						name: detail.name ?? "",
						gender: detail.gender ?? "male",
						email: detail.email ?? "",
						merchantName: detail.merchantName ?? "",
						address: detail.address ?? "",
						phone: detail.phone ?? "",
						isBlocked: detail.isBlocked,
					}}
					uniqueNumber={detail.uniqueNumber}
					photoUrl={detail.photoUrl}
					onSubmit={save.submit}
					submitting={save.submitting}
				/>
			) : null}
		</>
	)
}

export default MerchantEditPage
