import { useState, type JSX } from "react"

import type { EwalletSettingPage } from "@roja/types"
import { cn } from "@roja/utils"

import LegacyButton from "@/components/legacy/legacy-button"
import LegacyCard from "@/components/legacy/legacy-card"
import { useUpdateEwalletSetting } from "@/hooks/use-ewallets"

import { BlockedIcon } from "./ewallet-icons"
import { CARD_TITLE_CLASS } from "./ewallet-reset-pin-card"

const SolidRule = (): JSX.Element => <hr className="my-[22px] h-0 border-0 border-b border-[#ddd]" />

type RadioProps = { id: string; checked: boolean; onSelect: () => void; label: string; children: string }

const StatusRadio = ({ id, checked, onSelect, label, children }: RadioProps): JSX.Element => (
	<div className="relative z-[1] mb-[8px] min-h-[24px] pl-[24px]">
		<span className="absolute top-0 left-0 z-[-1] block h-[20px] w-[16px] overflow-hidden opacity-0">
			<input type="radio" id={id} name="is_active" checked={checked} onChange={onSelect} />
		</span>
		<label htmlFor={id} className="relative mb-0 inline-block cursor-pointer pt-[1px] pl-[16px] align-top font-semibold">
			<span
				aria-hidden="true"
				className={cn(
					"pointer-events-none absolute top-[1px] left-[-24px] block h-[20px] w-[20px] rounded-full",
					checked ? "bg-[var(--secondary)]" : "bg-[var(--bg-primary)]",
				)}
			/>
			{checked ? <span aria-hidden="true" className="absolute top-[7px] left-[-18px] block h-[8px] w-[8px] rounded-[8px] bg-[var(--bg-form)]" /> : null}
			{label}
		</label>
		<p className="mt-0 mb-[20px] pl-[16px] leading-[24px]">{children}</p>
	</div>
)

export const EwalletBlockedNotice = ({ setting }: { setting: EwalletSettingPage }): JSX.Element => {
	const who = setting.ownerType === "merchant" ? "Merchant" : "Santri"
	return (
		<LegacyCard className="mt-0 mb-[24px]">
			<div className="mx-[-15px] flex flex-wrap">
				<div className="w-full px-[15px] min-[576px]:w-1/12">
					<div className="flex w-full items-center justify-center">
						<BlockedIcon />
					</div>
				</div>
				<div className="mt-[16px] w-full px-[15px] min-[768px]:mt-0 min-[576px]:w-11/12 min-[992px]:mt-[8px]">
					<h5 className={CARD_TITLE_CLASS}>
						Dompet ini sedang di <span className="text-[var(--danger)]!">nonaktifkan</span>
					</h5>
					<p className="mt-0 mb-[20px] leading-[24px]">
						{who} pemilik dompet ini sedang dalam status Deactive. Cek pada bagian data {who} untuk mengaktifkan kembali agar dompet
						ini dapat digunakan.
					</p>
				</div>
			</div>
		</LegacyCard>
	)
}

const EwalletStatusCard = ({ setting }: { setting: EwalletSettingPage }): JSX.Element => {
	const [active, setActive] = useState(setting.isActive)
	const update = useUpdateEwalletSetting(setting.id)
	const santri = setting.ownerType === "santri"

	return (
		<LegacyCard className="mt-[24px]">
			<form
				id="tbr_status_form"
				onSubmit={(event) => {
					event.preventDefault()
					update.submit({ isActive: active })
				}}
			>
				<h5 className={CARD_TITLE_CLASS}>Status eWallet</h5>
				<SolidRule />
				<StatusRadio id="active" checked={active} onSelect={() => setActive(true)} label="Aktif">
					{`${santri ? "Santri" : "Merchant"} dapat melakukan berbagai aktivitas dari fitur yang dimiliki aplikasi dompet digital.`}
				</StatusRadio>
				<SolidRule />
				<StatusRadio id="inactive" checked={!active} onSelect={() => setActive(false)} label="Nonaktif">
					{`${santri ? "Santri" : "Merchant"} tidak dapat melakukan aktivitas apapun pada dompet digitalnya. Pilih opsi bila terjadi suatu hal pada ${santri ? "santri" : "merchant"} ini.`}
				</StatusRadio>
				<div className="flex justify-end">
					<LegacyButton variant="info" type="submit" loading={update.submitting}>
						Simpan
					</LegacyButton>
				</div>
			</form>
		</LegacyCard>
	)
}

export default EwalletStatusCard
