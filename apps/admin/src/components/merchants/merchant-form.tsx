import { useState, type JSX, type KeyboardEvent } from "react"
import { Link } from "@tanstack/react-router"

import type { MerchantPayload } from "@roja/types"
import { cn } from "@roja/utils"

import LegacyButton, { legacyButtonClass } from "@/components/legacy/legacy-button"
import LegacyCard, { LegacyCardText, LegacyCardTitle, LegacyDivider } from "@/components/legacy/legacy-card"
import LegacyFormRow from "@/components/legacy/legacy-form-row"
import LegacyInput, { legacyControlClass } from "@/components/legacy/legacy-input"
import LegacyRadioGroup from "@/components/legacy/legacy-radio-group"
import LegacyTextarea from "@/components/legacy/legacy-textarea"
import MerchantPhotoRow from "@/components/merchants/merchant-photo-row"

export type MerchantFormValues = {
	name: string
	gender: "male" | "female"
	email: string
	merchantName: string
	address: string
	phone: string
	isBlocked: boolean
}

/** `create.blade.php` renders the gender radios with `male` checked and `is_blocked` with `0`. */
export const EMPTY_MERCHANT_FORM: MerchantFormValues = {
	name: "",
	gender: "male",
	email: "",
	merchantName: "",
	address: "",
	phone: "",
	isBlocked: false,
}

type MerchantFormProps = {
	mode: "create" | "edit"
	initial: MerchantFormValues
	/** Legacy renders the number in a **disabled** input, so it is never submitted. */
	uniqueNumber: string
	/** Detail only: the read-only avatar between "Nomor Telepon" and "Status Akun". */
	photoUrl?: string | null
	onSubmit: (payload: MerchantPayload) => void
	submitting: boolean
}

const GENDER_OPTIONS = [
	{ value: "male", label: "Laki - Laki", id: "male" },
	{ value: "female", label: "Perempuan", id: "female" },
]

const STATUS_OPTIONS = [
	{ value: "0", label: "Active", id: "active" },
	{ value: "1", label: "Deactive", id: "deactive" },
]

// `assets/js/input-number-strict.js` — `isNumberKey(event)` blocks everything but 0-9
const onNumberKeyPress = (event: KeyboardEvent<HTMLInputElement>): void => {
	if (event.key.length === 1 && !/[0-9]/.test(event.key)) event.preventDefault()
}

/**
 * `merchant/create.blade.php` and `merchant/detail.blade.php` — the two are byte-identical
 * apart from the pre-filled values and the read-only `Foto` row, so one component renders both.
 *
 * There is no upload here: legacy has no `enctype`, no file input, and submits with
 * `$(this).serialize()`.
 */
const MerchantForm = ({
	mode,
	initial,
	uniqueNumber,
	photoUrl,
	onSubmit,
	submitting,
}: MerchantFormProps): JSX.Element => {
	const [values, setValues] = useState<MerchantFormValues>(initial)

	const set = <K extends keyof MerchantFormValues>(key: K, value: MerchantFormValues[K]): void =>
		setValues((current) => ({ ...current, [key]: value }))

	return (
		// `.row.justify-content-center > .col-xl-9.col-lg-10`
		<div className="mx-[-15px] flex flex-wrap justify-center">
			<div className="w-full px-[15px] min-[992px]:max-w-[83.333333%] min-[992px]:flex-[0_0_83.333333%] min-[1200px]:max-w-[75%] min-[1200px]:flex-[0_0_75%]">
				{/* `.card-body.p-4.px-lg-5` — 24px all round, 48px left/right from 992px up */}
				<LegacyCard bodyClassName="min-[992px]:px-[48px]">
					<form
						onSubmit={(event) => {
							event.preventDefault()
							onSubmit({
								name: values.name,
								gender: values.gender,
								email: values.email,
								merchantName: values.merchantName,
								address: values.address,
								phone: values.phone,
								isBlocked: values.isBlocked,
							})
						}}
					>
						<LegacyCardTitle>Data pemilik akun</LegacyCardTitle>
						<LegacyCardText>Anda dapat menambahkan data akun aplikasi untuk pemilik akun.</LegacyCardText>

						<LegacyFormRow label="Nama Lengkap" hint="required" htmlFor="name">
							<LegacyInput
								type="text"
								id="name"
								name="name"
								spellCheck={false}
								value={values.name}
								onChange={(event) => set("name", event.target.value)}
							/>
						</LegacyFormRow>

						<LegacyFormRow label="Jenis Kelamin" hint="required" htmlFor="gender">
							<LegacyRadioGroup
								name="gender"
								value={values.gender}
								options={GENDER_OPTIONS}
								onChange={(value) => set("gender", value === "female" ? "female" : "male")}
							/>
						</LegacyFormRow>

						<LegacyFormRow label="Alamat Email" hint="required" htmlFor="email">
							<LegacyInput
								type="email"
								id="email"
								name="email"
								spellCheck={false}
								value={values.email}
								onChange={(event) => set("email", event.target.value)}
							/>
						</LegacyFormRow>

						<LegacyDivider />

						<LegacyCardTitle>Data merchant</LegacyCardTitle>
						<LegacyCardText>Anda dapat menambahkan data akun aplikasi untuk merchant.</LegacyCardText>

						<LegacyFormRow label="Nomor Merchant" hint="required" htmlFor="unique_number">
							{/* `disabled` in both blades: the server regenerates the number on store and
							    never reads it on update */}
							<LegacyInput type="text" id="unique_number" spellCheck={false} defaultValue={uniqueNumber} key={uniqueNumber} disabled />
						</LegacyFormRow>

						<LegacyFormRow label="Nama Merchant" hint="required" htmlFor="merchant_name">
							<LegacyInput
								type="text"
								id="merchant_name"
								name="merchant_name"
								spellCheck={false}
								value={values.merchantName}
								onChange={(event) => set("merchantName", event.target.value)}
							/>
						</LegacyFormRow>

						<LegacyFormRow label="Alamat" hint="required" htmlFor="address">
							<LegacyTextarea
								id="address"
								name="address"
								rows={3}
								noResize
								spellCheck={false}
								value={values.address}
								onChange={(event) => set("address", event.target.value)}
							/>
						</LegacyFormRow>

						<LegacyFormRow label="Nomor Telepon" hint="required" htmlFor="phone">
							{/* `.input-group.tbr_fix_ig` — the prepend is pinned to 42px (form.css 219) and
							    reads `#777777`, a shade darker than the append colour */}
							<div className="relative flex w-full flex-wrap items-stretch">
								<span className="mr-[-2px] flex w-[42px] shrink-0 items-center justify-center rounded-l-[6px] border-2 border-[var(--bg-form-border)]! bg-[var(--bg-form)] px-[12px] py-[4px] text-[#777777]">
									62
								</span>
								<input
									type="number"
									min="1"
									id="phone"
									name="phone"
									spellCheck={false}
									value={values.phone}
									onKeyPress={onNumberKeyPress}
									onChange={(event) => set("phone", event.target.value)}
									// `cn`, not a template string: `.input-group > .form-control` is
									// `flex: 1 1 auto; width: 1%`, and twMerge has to drop the base `w-full`
									// or the group wraps onto two lines
									className={cn(legacyControlClass, "relative w-[1%] min-w-0 flex-auto rounded-l-none focus:z-[3]")}
								/>
							</div>
						</LegacyFormRow>

						{mode === "edit" ? <MerchantPhotoRow photoUrl={photoUrl ?? null} /> : null}

						<LegacyFormRow label="Status Akun" hint="required" htmlFor="is_blocked">
							<LegacyRadioGroup
								name="is_blocked"
								value={values.isBlocked ? "1" : "0"}
								options={STATUS_OPTIONS}
								onChange={(value) => set("isBlocked", value === "1")}
							/>
						</LegacyFormRow>

						{/* `.text-right` — a block, so the newline between the two controls survives as
						    the ~3.7px Blade renders on top of `.mr-2` */}
						<div className="text-right">
							<Link to="/merchants" className={legacyButtonClass("light", "mr-[8px]")}>
								Kembali
							</Link>{" "}
							<LegacyButton type="submit" variant="primary" loading={submitting}>
								Simpan
							</LegacyButton>
						</div>
					</form>
				</LegacyCard>
			</div>
		</div>
	)
}

export default MerchantForm
