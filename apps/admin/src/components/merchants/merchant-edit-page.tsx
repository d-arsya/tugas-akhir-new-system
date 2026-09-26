import type { JSX } from "react"
import { useNavigate } from "@tanstack/react-router"

import type { MerchantPayload } from "@roja/types"

import AdminPageTitle, { type AdminBreadcrumb } from "@/components/layout/admin-page-title"
import { useMerchant, useUpdateMerchant } from "@/hooks/use-merchants"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"

import MerchantForm from "./merchant-form"

const BREADCRUMBS: AdminBreadcrumb[] = [
	{ label: "Master Data", to: "/merchants" },
	{ label: "Merchant", to: "/merchants" },
	{ label: "Data Merchant", to: "/merchants" },
	{ label: "Detail" },
]

const MerchantEditPage = ({ merchantId }: { merchantId: number }): JSX.Element => {
	const navigate = useNavigate()
	const merchant = useMerchant(merchantId)
	const updateMerchant = useUpdateMerchant(merchantId)

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
