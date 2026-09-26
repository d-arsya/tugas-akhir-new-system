import { useState, type JSX } from "react"
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
import { digitsOnly } from "@/lib/digits-only"

export type MerchantFormValues = {
	name: string
	gender: "male" | "female"
	email: string
	merchantName: string
	address: string
	phone: string
	isBlocked: boolean
}

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
	uniqueNumber: string
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
		<div className="mx-[-15px] flex flex-wrap justify-center">
			<div className="w-full px-[15px] min-[992px]:max-w-[83.333333%] min-[992px]:flex-[0_0_83.333333%] min-[1200px]:max-w-[75%] min-[1200px]:flex-[0_0_75%]">
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
									onKeyPress={digitsOnly}
									onChange={(event) => set("phone", event.target.value)}
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
