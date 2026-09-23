import type { JSX } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"

import type { MerchantPayload } from "@roja/types"

import AdminPageTitle from "@/components/layout/admin-page-title"
import MerchantForm, { EMPTY_MERCHANT_FORM } from "@/components/merchants/merchant-form"
import { useCreateMerchant, useMerchantNextNumber } from "@/hooks/use-merchants"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"

// Legacy merchant/create.blade.php
export const Route = createFileRoute("/_auth/merchants/create")({
	component: MerchantCreatePage,
})

function MerchantCreatePage(): JSX.Element {
	const navigate = useNavigate()
	const nextNumber = useMerchantNextNumber()
	const createMerchant = useCreateMerchant()

	// `data-redirect="{{ route('merchant.index') }}"`: the notice first, the redirect 1000 ms later
	const save = useLegacySubmit({
		mutationFn: (payload: MerchantPayload) => createMerchant.mutateAsync(payload),
		onDone: () => void navigate({ to: "/merchants" }),
	})

	return (
		<>
			<AdminPageTitle title="Tambah Merchant" breadcrumbs={[{ label: "Master Data", to: "/merchants" }, { label: "Merchant", to: "/merchants" }, { label: "Tambah" }]} />

			<MerchantForm
				mode="create"
				initial={EMPTY_MERCHANT_FORM}
				uniqueNumber={nextNumber.data?.uniqueNumber ?? ""}
				onSubmit={save.submit}
				submitting={save.submitting}
			/>
		</>
	)
}

export default MerchantCreatePage
