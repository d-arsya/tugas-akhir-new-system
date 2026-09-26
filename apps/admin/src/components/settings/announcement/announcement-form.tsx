import { useEffect, useState, type FormEvent, type JSX } from "react"

import type { SettingAnnouncement } from "@roja/types"

import LegacyButton, { legacyButtonClass } from "@/components/legacy/legacy-button"
import { LegacyCardText, LegacyCardTitle, LegacyDivider } from "@/components/legacy/legacy-card"
import LegacyDateRange from "@/components/legacy/legacy-date-range"
import LegacyFormRow from "@/components/legacy/legacy-form-row"
import LegacyRichEditor from "@/components/legacy/legacy-rich-editor/legacy-rich-editor"
import { useUpdateAnnouncement } from "@/hooks/use-announcement-setting"
import { RIPPLE_CLASS, triggerRipple } from "@/lib/ripple"

type AnnouncementFormProps = {
	announcement: SettingAnnouncement | undefined
	onSaved: () => void
}

type AnnouncementValues = {
	successDesc: string
	failedDesc: string
	failedIndentTestDesc: string
	dateStart: string
	dateEnd: string
	information: string
	additionalInformation: string
}

const EMPTY_FORM: AnnouncementValues = {
	successDesc: "",
	failedDesc: "",
	failedIndentTestDesc: "",
	dateStart: "",
	dateEnd: "",
	information: "",
	additionalInformation: "",
}

const BLANK_EDITOR_HTML = /^\s*(?:<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>\s*)*$/i
const clean = (html: string): string => (BLANK_EDITOR_HTML.test(html) ? "" : html)

const AnnouncementForm = ({ announcement, onSaved }: AnnouncementFormProps): JSX.Element => {
	const [values, setValues] = useState<AnnouncementValues>(EMPTY_FORM)

	useEffect(() => {
		setValues(
			announcement
				? {
						successDesc: announcement.successDesc ?? "",
						failedDesc: announcement.failedDesc ?? "",
						failedIndentTestDesc: announcement.failedIndentTestDesc ?? "",
						dateStart: announcement.dateStart ?? "",
						dateEnd: announcement.dateEnd ?? "",
						information: announcement.information ?? "",
						additionalInformation: announcement.additionalInformation ?? "",
					}
				: EMPTY_FORM,
		)
	}, [announcement])

	const set = <K extends keyof AnnouncementValues>(key: K, value: AnnouncementValues[K]): void =>
		setValues((current) => ({ ...current, [key]: value }))

	const { submit, submitting } = useUpdateAnnouncement(onSaved)

	const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
		event.preventDefault()
		submit({
			successDesc: clean(values.successDesc),
			failedDesc: clean(values.failedDesc),
			failedIndentTestDesc: clean(values.failedIndentTestDesc),
			dateStart: values.dateStart,
			dateEnd: values.dateEnd,
			information: clean(values.information),
			additionalInformation: clean(values.additionalInformation),
		})
	}

	return (
		<form onSubmit={onSubmit}>
			<LegacyFormRow
				label="Teks diterima"
				htmlFor="success_desc"
				hint="required"
				example="Contoh : Selamat kamu DITERIMA sebagai santri di pondok kami."
				labelCols={3}
			>
				<LegacyRichEditor value={values.successDesc} onChange={(html) => set("successDesc", html)} />
			</LegacyFormRow>

			<LegacyFormRow
				label="Teks tidak diterima"
				htmlFor="failed_desc"
				hint="required"
				example="Contoh : Maaf kamu TIDAK DITERIMA sebagai santri di pondok kami."
				labelCols={3}
			>
				<LegacyRichEditor value={values.failedDesc} onChange={(html) => set("failedDesc", html)} />
			</LegacyFormRow>

			<LegacyFormRow
				label="Tes indent tidak lolos"
				htmlFor="failed_indent_test_desc"
				hint="required"
				example="Contoh : Kamu tidak lolos tes indent. Kamu masih punya kesempatan dengan mengikuti tes regular."
				labelCols={3}
			>
				<LegacyRichEditor
					value={values.failedIndentTestDesc}
					onChange={(html) => set("failedIndentTestDesc", html)}
				/>
			</LegacyFormRow>

			<LegacyDivider />

			<LegacyCardTitle>Informasi daftar ulang</LegacyCardTitle>
			<LegacyCardText>Berikan informasi untuk keperluan daftar ulang bagi pendaftar yang DITERIMA.</LegacyCardText>

			<LegacyFormRow label="Tanggal daftar ulang" htmlFor="date_start" hint="required" labelCols={3} fieldCols={6}>
				<LegacyDateRange
					from={values.dateStart}
					to={values.dateEnd}
					onChange={(from, to) => setValues((current) => ({ ...current, dateStart: from, dateEnd: to }))}
					middleLabel="Sampai"
				/>
			</LegacyFormRow>

			<LegacyFormRow label="Berkas untuk daftar ulang" htmlFor="information" hint="required" labelCols={3}>
				<LegacyRichEditor value={values.information} onChange={(html) => set("information", html)} />
			</LegacyFormRow>

			<LegacyFormRow label="Pengumuman lainnya" htmlFor="additional_information" hint="optional" labelCols={3}>
				<LegacyRichEditor
					value={values.additionalInformation}
					onChange={(html) => set("additionalInformation", html)}
				/>
			</LegacyFormRow>

			<div className="pt-[16px] text-right">
				<a href="" className={legacyButtonClass("light", `mr-[8px] ${RIPPLE_CLASS}`)} onClick={triggerRipple}>
					Kembali
				</a>{" "}
				<LegacyButton type="submit" variant="primary" loading={submitting} className={RIPPLE_CLASS} onClick={triggerRipple}>
					Simpan
				</LegacyButton>
			</div>
		</form>
	)
}

export default AnnouncementForm
