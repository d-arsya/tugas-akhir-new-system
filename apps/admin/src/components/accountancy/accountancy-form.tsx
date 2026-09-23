import { useState, type JSX } from "react"

import type { AccountancyGroup, AccountancyPayload } from "@roja/types"

import LegacyButton from "@/components/legacy/legacy-button"
import LegacyCard, { LegacyCardText, LegacyCardTitle } from "@/components/legacy/legacy-card"
import LegacyInput from "@/components/legacy/legacy-input"
import LegacyRadioGroup from "@/components/legacy/legacy-radio-group"
import LegacyTextarea from "@/components/legacy/legacy-textarea"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"
import { useAccountancyOptions, useCreateAccountancy } from "@/hooks/use-accountancy"

import AccountancyChildFields from "./accountancy-child-fields"
import AccountancyFieldLabel from "./accountancy-field-label"
import AccountancyHelpModal from "./accountancy-help-modal"

// `accountancy/index.blade.php` left card + `default-ajax2.js` (`specificForm`), which reloads
// the page 1000 ms after the success notice — here: the tree refetches and the form clears.
const IS_PARENT_OPTIONS = [
	{ value: "1", label: "Induk akun", id: "parent" },
	{ value: "0", label: "Anak akun", id: "child" },
]

/** `assets/svg/icons`-style inline glyph, 24×24, `fill="#ffa800"` — opens `#modalHelp`. */
const HelpCircleIcon = (): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
		<rect width="24" height="24" fill="none" />
		<circle cx="10" cy="10" r="10" transform="translate(2 2)" fill="#ffa800" opacity="0.3" />
		<path
			d="M12,16a1,1,0,1,1-1,1A1,1,0,0,1,12,16Zm-1.409-1.132V13.209h1.26A2.71,2.71,0,0,0,14.6,10.4a2.71,2.71,0,0,0-2.751-2.814A2.681,2.681,0,0,0,9.121,10.4H7.336a4.433,4.433,0,0,1,4.515-4.473,4.473,4.473,0,1,1,0,8.946Z"
			fill="#ffa800"
			fillRule="evenodd"
		/>
	</svg>
)

const AccountancyForm = (): JSX.Element => {
	const [name, setName] = useState("")
	// `value="1"` is `checked` in the blade, so the form opens on "Induk akun"
	const [isParent, setIsParent] = useState("1")
	const [parentId, setParentId] = useState("")
	// `value="income"` is `checked`, and the radio is inside the hidden block from the start
	const [group, setGroup] = useState<AccountancyGroup | "">("income")
	const [isStudentCost, setIsStudentCost] = useState(false)
	const [note, setNote] = useState("")
	const [helpOpen, setHelpOpen] = useState(false)

	const { data: options } = useAccountancyOptions()
	const create = useCreateAccountancy()

	const submit = useLegacySubmit({
		mutationFn: (payload: AccountancyPayload) => create.mutateAsync(payload),
		// `default-ajax2.js` titles the failure notice "<strong>Gagal!</strong>"
		errorTitle: "Gagal!",
		onDone: () => {
			setName("")
			setIsParent("1")
			setParentId("")
			setGroup("income")
			setIsStudentCost(false)
			setNote("")
		},
	})

	const child = isParent === "0"

	return (
		<LegacyCard className="mb-[16px] min-[992px]:mb-0">
			<LegacyCardTitle>Tambah akun</LegacyCardTitle>
			<LegacyCardText>Silakan tambahkan akun baru pada form di bawah ini.</LegacyCardText>

			<form
				onSubmit={(event) => {
					event.preventDefault()
					submit.submit({
						name,
						isParent: !child,
						// Legacy's `#childData` is hidden with the HTML `hidden` attribute, which does not
						// stop `serialize()` from posting its inputs — so creating a root sent `parent_id=""`,
						// which persisted and made the account invisible for good. Null here (plan decision).
						parentId: child && parentId !== "" ? Number(parentId) : null,
						group: child && group !== "" ? group : null,
						isStudentCost: child ? isStudentCost : false,
						note,
					})
				}}
			>
				{/* `.form-group.mb-3` */}
				<div className="mb-[16px]">
					<AccountancyFieldLabel htmlFor="name" badge="required">
						Nama
					</AccountancyFieldLabel>
					<LegacyInput
						id="name"
						name="name"
						autoComplete="off"
						spellCheck={false}
						value={name}
						onChange={(event) => setName(event.target.value)}
					/>
				</div>

				<div className="mb-[16px]">
					{/* `label.control-label.d-block.mb-3` > `.d-flex.align-items-center.flex-wrap` */}
					<label className="mb-[16px] block leading-[20px]">
						<span className="flex flex-wrap items-center">
							<span className="mr-[8px]">Terapkan sebagai</span>
							{/* Legacy binds `onclick` to the SVG itself; a button keeps it reachable by keyboard */}
							<button type="button" onClick={() => setHelpOpen(true)} className="inline-flex cursor-pointer" aria-label="Bantuan">
								<HelpCircleIcon />
							</button>
						</span>
					</label>
					{/* `.form-check.form-check-inline` > `.custom-control.custom-radio.mr-4`, last one bare */}
					<LegacyRadioGroup
						name="is_parent"
						value={isParent}
						options={IS_PARENT_OPTIONS}
						onChange={setIsParent}
						inline
						className="items-center"
						itemClassName="mt-0 mr-[24px] last:mr-0"
					/>
				</div>

				{/* `showChildData()` toggles `#childData.hidden` — unmounted here, so nothing stray is posted */}
				{child ? (
					<AccountancyChildFields
						options={options ?? []}
						parentId={parentId}
						onParentIdChange={setParentId}
						placeholder
						group={group}
						onGroupChange={setGroup}
						isStudentCost={isStudentCost}
						onIsStudentCostChange={setIsStudentCost}
					/>
				) : null}

				<div className="mb-[16px]">
					<AccountancyFieldLabel htmlFor="note" badge="optional">
						Keterangan
					</AccountancyFieldLabel>
					<LegacyTextarea
						id="note"
						name="note"
						autoComplete="off"
						spellCheck={false}
						value={note}
						onChange={(event) => setNote(event.target.value)}
					/>
				</div>

				{/* `.text-right.pt-3` — no "Kembali" link on this form, unlike Jenjang */}
				<div className="pt-[16px] text-right">
					<LegacyButton type="submit" variant="primary" loading={submit.submitting}>
						Simpan
					</LegacyButton>
				</div>
			</form>

			<AccountancyHelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
		</LegacyCard>
	)
}

export default AccountancyForm
