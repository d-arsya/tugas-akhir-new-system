import { useEffect, useState, type JSX } from "react"
import type { CapabilityPeriodLabel } from "@roja/types"

import LegacyButton from "@/components/legacy/legacy-button"
import { LegacyModalOverlay } from "@/components/legacy/legacy-modal"
import LegacyRadioGroup from "@/components/legacy/legacy-radio-group"
import LegacyRangeSlider from "@/components/legacy/legacy-range-slider"
import { rupiahLabel } from "@/lib/legacy-format"

type CapabilityAmountModalProps = {
	open: boolean
	name: string | null
	periodLabel: CapabilityPeriodLabel
	type: "maximum" | "option"
	max: number | null
	step: number
	value: number | null
	options: number[]
	onClose: () => void
	onSave: (amount: number | null) => void
}

const CapabilityAmountModal = ({
	open,
	name,
	periodLabel,
	type,
	max,
	step,
	value,
	options,
	onClose,
	onSave,
}: CapabilityAmountModalProps): JSX.Element => {
	const [draft, setDraft] = useState<number | null>(value)

	useEffect(() => {
		if (open) setDraft(value)
	}, [open, value])

	const ceiling = max ?? 0
	const label = `${name ?? ""} (${periodLabel})`

	return (
		<LegacyModalOverlay open={open} maxWidth={type === "maximum" ? "900px" : "400px"}>
			<section className="flex max-h-[calc(100vh-70px)] flex-col overflow-hidden rounded-[20px]">
				<header className="flex min-h-[68px] shrink-0 items-center justify-between rounded-t-[20px] border-0 bg-[var(--bg-tertiary)] px-[30px]">
					<h2 className="m-0! p-0! text-[16px]! leading-[18px]! font-semibold! tracking-normal! text-[var(--heading-txt-inverse)]!">
						Edit item kesanggupan
					</h2>
					<span className="text-right">{name}</span>
				</header>

				<div className="overflow-y-auto bg-[var(--bg-secondary)] p-[30px]">
					{type === "maximum" ? (
						<div className="mb-[4px]">
							<label htmlFor="capability-amount" className="m-0 flex">
								<span className="mr-[8px] font-bold">{name}</span> ({periodLabel})
							</label>
							<LegacyRangeSlider
								id="capability-amount"
								value={draft ?? 0}
								max={ceiling}
								step={step}
								onChange={setDraft}
							/>
						</div>
					) : (
						<div className="mb-[16px]">
							<label htmlFor="capability-amount-0" className="m-0 font-bold">
								{label}
							</label>
							<p className="text-[var(--grey)]">
								Pilih salah satu opsi biaya sesuai dengan kesanggupan santri dalam membayar
							</p>
							{options.map((option, index) => (
								<div key={`${option}-${index}`}>
									<hr className="my-[8px] h-0 border-0 border-b border-solid border-[#ddd]" />
									<LegacyRadioGroup
										name="capability-amount"
										value={draft === null ? "" : String(draft)}
										onChange={(next) => setDraft(Number(next))}
										options={[
											{ value: String(option), label: rupiahLabel(option), id: `capability-amount-${index}` },
										]}
										itemClassName="mt-[8px] mb-0"
									/>
								</div>
							))}
							<hr className="my-[8px] h-0 border-0 border-b border-solid border-[#ddd]" />
						</div>
					)}
				</div>

				<footer className="-mt-[5px] flex min-h-[68px] shrink-0 items-center justify-end rounded-b-[20px] border-0 bg-[var(--bg-tertiary)] px-[30px]">
					<div className="text-right">
						<LegacyButton variant="light" className="mr-[8px] bg-[var(--bg-inverse)]" onClick={onClose}>
							Batal
						</LegacyButton>{" "}
						<LegacyButton variant="primary" onClick={() => onSave(draft)}>
							Simpan
						</LegacyButton>
					</div>
				</footer>
			</section>
		</LegacyModalOverlay>
	)
}

export default CapabilityAmountModal
