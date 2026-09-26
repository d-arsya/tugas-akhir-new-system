import { useState, type JSX } from "react"

import type { SettingFormItem, SettingFormPatch } from "@roja/types"

import AdminPageTitle from "@/components/layout/admin-page-title"
import { useSettingForms, useUpdateSettingForm } from "@/hooks/use-setting-form"

import FormBuilderTabs from "./form-builder-tabs"
import FormDocCard from "./form-doc-card"
import FormEditModal from "./form-edit-modal"

const TOGGLE_NOTIFY_DELAY_MS = 2000

const SettingFormPage = (): JSX.Element => {
	const { data: groups } = useSettingForms()
	const update = useUpdateSettingForm()
	const [editing, setEditing] = useState<SettingFormItem | null>(null)

	const patch = (id: number, data: SettingFormPatch): void =>
		update.mutate({ id, data, notifyDelay: TOGGLE_NOTIFY_DELAY_MS })

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
