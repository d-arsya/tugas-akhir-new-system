import type { JSX } from "react"

import type { SocietyValues } from "@roja/types"
import type { SocietyAddressGroup } from "@roja/utils"

import LegacyInput from "@/components/legacy/legacy-input"
import LegacyRichEditor from "@/components/legacy/legacy-rich-editor/legacy-rich-editor"
import SocietyAddress from "@/components/society/society-address"
import { PhoneInput, SocietyRadios, StackedLabel } from "@/components/society/society-controls"
import type { SocietyFieldContext } from "@/components/society/society-field-context"
import type { SocietySettingLookup } from "@/components/society/society-settings"

// OWNER: AK-A. `alumni/partials/edit/data/alumni.blade.php` — the first (award) tab of the detail page: three
// Summernote fields (`registrant/summernote.js`, height 120), Status Menikah, the "62" phone, the email and the
// alumni address (`initProvince('#alumni_province_id', …)` + `initRegency`). None of these hangs off a setting.

/** The address group the shared cascade renders; label and help text are fixed in this blade. */
const ALUMNI_ADDRESS: SocietyAddressGroup = {
	settingId: 0,
	labelId: 0,
	province: "alumni_province_id",
	regency: "alumni_regency_id",
	district: "alumni_district_id",
	village: "alumni_village",
	street: "alumni_street",
	rt: "alumni_rt",
	rw: "alumni_rw",
	subVillage: "alumni_sub_village",
}

const FIXED_LOOKUP: SocietySettingLookup = {
	status: () => true,
	label: () => "Alamat",
	info: () => "optional",
	lineVisible: () => true,
}

/** `hr.tbr_divider_solid` */
const Divider = (): JSX.Element => <hr className="my-[22px] h-[2px] border-0 bg-[var(--bg-primary)]" />

/** `div.row.no-gutters.justify-content-center > div.col-12` with `p.mb-2` over `div.form-group > textarea.summernote` */
const RichField = ({ name, label, value, onChange }: { name: string; label: string; value: string; onChange: (value: string) => void }): JSX.Element => (
	<div className="flex flex-wrap justify-center">
		<div id={name} className="w-full">
			<div className="text-left">
				<p className="mt-0 mb-[8px] leading-[24px]">{label}</p>
			</div>
			<div className="mb-[16px]">
				<LegacyRichEditor value={value} height={120} onChange={onChange} />
			</div>
		</div>
	</div>
)

type AlumniTabProps = {
	values: SocietyValues
	onChange: (name: string, value: string) => void
}

const AlumniTab = ({ values, onChange }: AlumniTabProps): JSX.Element => {
	const value = (name: string): string => values[name] ?? ""
	const ctx: SocietyFieldContext = { layout: "stacked", lookup: FIXED_LOOKUP, values, set: onChange, errors: {}, disabled: false }

	return (
		<>
			<RichField name="alumni_talent" label="Minat bakat yang dimiliki" value={value("alumni_talent")} onChange={(html) => onChange("alumni_talent", html)} />
			<Divider />
			<RichField name="advanced_study" label="Studi lanjutan atau jurusan" value={value("advanced_study")} onChange={(html) => onChange("advanced_study", html)} />
			<Divider />
			<RichField name="profession" label="Profesi atau aktivitas kegiatan" value={value("profession")} onChange={(html) => onChange("profession", html)} />
			<Divider />

			<div className="mb-[16px]">
				<StackedLabel htmlFor="marriage_status" label="Status Menikah" info="required" />
				{/* No option is pre-checked: an alumnus without a status posts none (and gets "wajib untuk diisi") */}
				<SocietyRadios
					name="marriage_status"
					value={value("marriage_status")}
					options={[
						{ value: "married", label: "Sudah Menikah", id: "married" },
						{ value: "single", label: "Belum Menikah", id: "single" },
					]}
					onChange={(next) => onChange("marriage_status", next)}
				/>
			</div>

			<div className="mb-[16px]">
				<StackedLabel htmlFor="alumni_phone" label="Nomor Telepon" info="required" />
				<PhoneInput name="alumni_phone" value={value("alumni_phone")} onChange={(next) => onChange("alumni_phone", next)} numeric />
			</div>

			<div className="mb-[16px]">
				<StackedLabel htmlFor="alumni_email" label="Email" info="optional" />
				<LegacyInput
					type="text"
					name="alumni_email"
					id="alumni_email"
					autoComplete="off"
					spellCheck={false}
					value={value("alumni_email")}
					onChange={(event) => onChange("alumni_email", event.target.value)}
				/>
			</div>

			<SocietyAddress ctx={ctx} group={ALUMNI_ADDRESS} lastClassName="mb-[16px]" />
		</>
	)
}

export default AlumniTab
