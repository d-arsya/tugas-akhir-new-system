import { Fragment, useState, type JSX, type ReactNode } from "react"

import type { SettingFormGroups, SettingFormItem, SettingFormPatch } from "@roja/types"

import LegacyTabs from "@/components/legacy/legacy-tabs"
import FormAccordionPanel from "@/components/settings/form-builder/form-accordion-panel"
import FormPanel from "@/components/settings/form-builder/form-panel"

type FormBuilderTabsProps = {
	groups: SettingFormGroups
	onPatch: (id: number, data: SettingFormPatch) => void
	onEdit: (item: SettingFormItem) => void
}

type TabKey = "personal-data" | "identity" | "familiy" | "guardian" | "attachment"

// `.tbr_tab_content .tbr_form_builder` (app.css 2173-2175, 2979-2982) replaces the kit's 24px pane padding
const PANE_CLASS = "m-[-24px] p-[30px] pb-[18px] max-[992px]:p-[20px] max-[992px]:pb-[8px]"

// `div.d-flex.align-items-center.mt-4.mb-3 > span.tbr_weight-medium.text-dark` with the blade's inline 15px/600
const SectionHeading = ({ topClass, children }: { topClass: string; children: ReactNode }): JSX.Element => (
	<div className={`flex items-center ${topClass} mb-[16px]`}>
		<span className="text-[15px] font-semibold text-[#171717]">{children}</span>
	</div>
)

// Port of `setting/form.blade.php`: five panes, the legacy spellings kept as they are
const FormBuilderTabs = ({ groups, onPatch, onEdit }: FormBuilderTabsProps): JSX.Element => {
	const [active, setActive] = useState<TabKey>("personal-data")
	const { alphabet } = groups

	const panel = (item: SettingFormItem): JSX.Element => (
		<FormPanel key={item.id} item={item} onPatch={(data) => onPatch(item.id, data)} onEdit={() => onEdit(item)} />
	)

	// A sub-group renders its accordion label with the group's letter and the rest as normal panels
	const section = (items: SettingFormItem[], letter: string): JSX.Element[] =>
		items.map((item) =>
			item.type === "accordion label" ? (
				<FormAccordionPanel key={item.id} item={item} letter={letter} onEdit={() => onEdit(item)} />
			) : (
				panel(item)
			),
		)

	const personalPane = (
		<div className={PANE_CLASS}>
			{groups.personalDatas.map(panel)}
			{groups.previousSchools.length > 0 ? (
				<>
					<SectionHeading topClass="mt-[24px]">Data Sekolah Asal</SectionHeading>
					{groups.previousSchools.map(panel)}
				</>
			) : null}
		</div>
	)

	const identityPane = (
		<div className={PANE_CLASS}>
			{groups.identityNumbers.length > 0 ? (
				<>
					<SectionHeading topClass="mt-[8px]">Nomor Identitas Tambahan</SectionHeading>
					{groups.identityNumbers.map(panel)}
				</>
			) : null}
			{section(groups.healthDatas, alphabet.identity[0] ?? "")}
			{section(groups.achievments, alphabet.identity[1] ?? "")}
			{section(groups.religiousAchievments, alphabet.identity[2] ?? "")}
			{section(groups.gifts, alphabet.identity[3] ?? "")}
		</div>
	)

	const familyPane = (
		<div className={PANE_CLASS}>
			{groups.familyDatas.map((item) =>
				item.type === "accordion label" ? (
					<FormAccordionPanel key={item.id} item={item} letter={alphabet.family[0] ?? ""} onEdit={() => onEdit(item)} />
				) : (
					// `div.d-flex.my-3.py-1` opens the mother's block
					<Fragment key={item.id}>
						{item.id === 44 ? <div className="my-[16px] flex py-[4px]" /> : null}
						{panel(item)}
					</Fragment>
				),
			)}
			{section(groups.familyAddress, alphabet.family[1] ?? "")}
		</div>
	)

	const guardianPane = (
		<div className={PANE_CLASS}>
			{section(groups.guardianDatas, alphabet.guardian[0] ?? "")}
			{section(groups.guardianAddress, alphabet.guardian[1] ?? "")}
		</div>
	)

	return (
		<LegacyTabs<TabKey>
			active={active}
			onChange={setActive}
			tabs={[
				{ key: "personal-data", label: "Data Diri", content: personalPane },
				{ key: "identity", label: "Indentitas", content: identityPane },
				{ key: "familiy", label: "Keluarga", content: familyPane },
				{ key: "guardian", label: "Wali", content: guardianPane },
				{ key: "attachment", label: "Lampiran", content: <div className={PANE_CLASS}>{groups.attachments.map(panel)}</div> },
			]}
		/>
	)
}

export default FormBuilderTabs
