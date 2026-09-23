import { useState, type JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import type { SettingFormItem, SettingFormPatch } from "@roja/types"

import AdminPageTitle from "@/components/layout/admin-page-title"
import FormBuilderTabs from "@/components/settings/form-builder/form-builder-tabs"
import FormDocCard from "@/components/settings/form-builder/form-doc-card"
import FormEditModal from "@/components/settings/form-builder/form-edit-modal"
import { useSettingForms, useUpdateSettingForm } from "@/hooks/use-setting-form"
import { requireRoles } from "@/lib/route-guards"

// WS-C: legacy setting/form.blade.php + card-setting/card-accordion
export const Route = createFileRoute("/_auth/settings/form")({
	beforeLoad: () => requireRoles("superadmin", "admin"),
	component: SettingFormPage,
})

function SettingFormPage(): JSX.Element {
	const { data: groups } = useSettingForms()
	const update = useUpdateSettingForm()
	const [editing, setEditing] = useState<SettingFormItem | null>(null)

	// `update-status.js` / `update-visibility.js`: fire and forget, PNotify with `delay: 2000`
	const patch = (id: number, data: SettingFormPatch): void => update.mutate({ id, data, notifyDelay: 2000 })

	// `update-description.js`: the modal closes on success and the row is replaced without a reload
	const saveDescription = (data: SettingFormPatch): void => {
		if (!editing) return
		update.mutate({ id: editing.id, data }, { onSuccess: () => setEditing(null) })
	}

	return (
		<>
			<AdminPageTitle
				title="Form Data Santri"
				breadcrumbs={[{ label: "Lainnya" }, { label: "Pengaturan" }, { label: "Form Data Santri" }]}
			/>

			{/* `.row > .col-xl-8.col-lg-12` + `.col-xl-4.col-lg-12` */}
			<div className="mx-[-15px] flex flex-wrap">
				<div className="w-full min-w-0 px-[15px] min-[1200px]:w-2/3">
					{groups ? <FormBuilderTabs groups={groups} onPatch={patch} onEdit={setEditing} /> : null}
				</div>
				<div className="w-full min-w-0 px-[15px] min-[1200px]:w-1/3">
					<FormDocCard />
				</div>
			</div>

			<FormEditModal
				item={editing}
				saving={update.isPending}
				onClose={() => setEditing(null)}
				onSubmit={saveDescription}
			/>
		</>
	)
}

export default SettingFormPage
