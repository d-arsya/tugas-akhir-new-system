import { useState, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { AdminRegistrantDetail } from "@roja/types"
import { cn } from "@roja/utils"

import { legacyButtonClass } from "@/components/legacy/legacy-button"
import LegacyCard from "@/components/legacy/legacy-card"
import { SocietySelect } from "@/components/society/society-controls"
import { adminApi } from "@/lib/api"
import { RIPPLE_CLASS, triggerRipple } from "@/lib/ripple"

import type { ApprovalKind } from "./registrant-confirm-modal"
import RegistrantProgress, { PROGRESS_ITEM, type RegistrantStepModal } from "./registrant-progress"

// `registrant/partials/edit/widget-status.blade.php` — the right-hand card: Jenjang (disabled for a portal
// row), year and path, the progress steps, "Pengumuman Hasil" with the four result radios
// (`edit-general.js`: a click opens `#modal-{value}` instead of checking), then Kembali / Print / Simpan.

/** `collapseRegistrantStatus()` (Helper.php 347-368) */
const collapseStatus = (detail: AdminRegistrantDetail): boolean =>
	detail.registrationPath === "indent" ? detail.indentTest === "success" || detail.regularTest !== null : detail.regularTest !== null

const RESULTS: ReadonlyArray<{ value: ApprovalKind; label: string }> = [
	{ value: "wait", label: "Menunggu Pengumuman" },
	{ value: "reserve", label: "Cadangan" },
	{ value: "approve", label: "Diterima" },
	{ value: "reject", label: "Tidak Diterima" },
]

// `.tbr_btn-light-info` / `.tbr_btn-light-danger` icon buttons (`p-2`); hover fills the svg white
const ICON_BUTTON = "inline-flex p-[8px] [&:hover_path:not(.tbr-except)]:fill-white [&:hover_.tbr-white]:fill-white"

const ucfirst = (value: string | null): string => (value ? value.charAt(0).toUpperCase() + value.slice(1) : "")

type RegistrantWidgetStatusProps = {
	detail: AdminRegistrantDetail
	levelId: string
	onLevelChange: (value: string) => void
	onOpenStep: (modal: RegistrantStepModal) => void
	onPickResult: (kind: ApprovalKind) => void
	onSave: () => void
	saving: boolean
}

const RegistrantWidgetStatus = ({ detail, levelId, onLevelChange, onOpenStep, onPickResult, onSave, saving }: RegistrantWidgetStatusProps): JSX.Element => {
	const collapse = collapseStatus(detail)
	const [showResults, setShowResults] = useState(collapse)

	return (
		<LegacyCard bodyClassName="p-[20px]">
			<div className="mb-[24px]">
				{/* `<option value="" selected>Select</option>` carries no `title`, so it is not greyed */}
				<SocietySelect
					id="level_id"
					value={levelId}
					options={detail.levels.map((level) => ({ value: String(level.id), label: level.name }))}
					placeholder="Select"
					mutedPlaceholder={false}
					onChange={onLevelChange}
					disabled={!detail.registeredByAdmin}
				/>
			</div>

			<p className="mt-0 mb-0 leading-[24px] font-semibold">Tahun Ajaran {detail.academicYear}</p>
			<p className="mt-0 mb-[20px] leading-[24px] text-[var(--grey)]">Jalur {ucfirst(detail.registrationPath)}</p>

			{/* `div.tbr_progress_widget.mb-0#data-validation-checkbox` */}
			<div className="mb-0">
				<RegistrantProgress detail={detail} onOpen={onOpenStep} />
				<div className={PROGRESS_ITEM}>
					{/* `div.custom-control.custom-checkbox` (58px in) with the 36px box as `label::after` */}
					<div className="relative min-h-[24px] pl-[58px]">
						<span className="absolute top-0 left-0 z-[-1] block h-[20px] w-[16px] overflow-hidden opacity-0">
							<input
								type="checkbox"
								id="progressSetStatus"
								checked={showResults}
								disabled={!collapse}
								onChange={(event) => setShowResults(event.target.checked)}
							/>
						</span>
						<label htmlFor="progressSetStatus" className={cn("relative mb-0 flex h-[38px] flex-col justify-center pl-0", collapse ? "cursor-pointer" : "cursor-default")}>
							<span
								aria-hidden="true"
								className={cn(
									"absolute top-[1px] left-[-58px] block h-[36px] w-[36px] rounded-[8px] bg-center bg-no-repeat bg-[url('/assets/svg/etc/Widget-Progress-Unchecked.svg')] transition-all duration-300",
									showResults ? "bg-[var(--secondary)] shadow-[0px_8px_10px_0px_rgba(141,195,30,0.25)]" : "bg-[var(--bg-form-border)]",
								)}
							/>
							<span className="block leading-[19px] font-semibold text-[var(--body-txt-inverse)]">Pengumuman Hasil</span>
							<span className="block text-[90%] leading-[19px] font-semibold text-[var(--grey)]">
								<em>Tentukan hasilnya :</em>
							</span>
						</label>
					</div>
				</div>
			</div>

			{/* `div.tbr_registrant_status.mb-4.pl-5` — `.custom-radio.tbr_cr_status`, the current one `checked disabled` */}
			<div hidden={!showResults} className="mb-[24px] pl-[48px]">
				<div className="mb-[16px] pt-[16px]">
					{RESULTS.map((result, index) => {
						const current = detail.approvalStatus === result.value
						return (
							<div key={result.value} className={cn("relative z-[1] min-h-[24px] pl-[24px]", index < RESULTS.length - 1 ? "mb-[8px]" : "mb-0")}>
								<span className="absolute top-0 left-0 z-[-1] block h-[20px] w-[16px] overflow-hidden opacity-0">
									<input
										type="radio"
										id={result.value}
										name="approval_status"
										value={result.value}
										checked={current}
										disabled={current}
										onChange={() => undefined}
										onClick={(event) => {
											event.preventDefault()
											onPickResult(result.value)
										}}
									/>
								</span>
								<label
									htmlFor={result.value}
									className={cn("relative mb-0 inline-block pt-[1px] pl-[8px] align-top font-medium text-[var(--body-txt-inverse)]", current ? "cursor-default" : "cursor-pointer")}
								>
									<span
										aria-hidden="true"
										className={cn(
											"pointer-events-none absolute top-[calc(50%-10px)] left-[-24px] block h-[20px] w-[20px] rounded-full",
											current ? "bg-[var(--secondary)]" : "bg-[var(--bg-primary)]",
										)}
									/>
									{current ? (
										<span aria-hidden="true" className="absolute top-[calc(50%-4px)] left-[-18px] block h-[8px] w-[8px] rounded-[8px] bg-[var(--bg-form)]" />
									) : null}
									{result.label}
								</label>
							</div>
						)
					})}
				</div>
			</div>

			<hr className="my-[22px] h-[2px] border-0 bg-[var(--bg-primary)]" />

			<div className="mt-[24px] flex items-center justify-between pt-[4px]">
				<div className="flex">
					<Link
						to="/registrants/academic-years/$academicYearId"
						params={{ academicYearId: String(detail.academicYearId ?? "") }}
						onMouseDown={triggerRipple}
						className={legacyButtonClass(
							"light",
							cn("mr-[8px] bg-[rgba(104,102,233,0.16)] text-[var(--info)] hover:bg-[var(--info)] hover:text-white", ICON_BUTTON, RIPPLE_CLASS),
						)}
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
							<path className="tbr-except" d="M0,0H24V24H0Z" fill="none" fillRule="evenodd" />
							<rect className="tbr-white" width="2" height="14" rx="1" transform="translate(5 13) rotate(-90)" fill="#6866e9" opacity="0.3" />
							<path
								d="M3.707,15.707a1,1,0,0,1-1.414-1.414l6-6a1,1,0,0,1,1.383-.03l6,5.5a1,1,0,1,1-1.351,1.474L9.03,10.384Z"
								transform="translate(-3 21) rotate(-90)"
								fill="#6866e9"
							/>
						</svg>
					</Link>
					<a
						href={adminApi.registrantPrintUrl(detail.id)}
						target="_blank"
						rel="noreferrer"
						onMouseDown={triggerRipple}
						className={legacyButtonClass("light-danger", cn(ICON_BUTTON, RIPPLE_CLASS))}
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
							<rect width="24" height="24" fill="none" className="tbr-except" />
							<path
								d="M16,17v4a1,1,0,0,1-1,1H9a1,1,0,0,1-1-1V17H5a2,2,0,0,1-2-2V8A2,2,0,0,1,5,6H19a2,2,0,0,1,2,2v7a2,2,0,0,1-2,2Zm1.5-6A1.5,1.5,0,1,0,16,9.5,1.5,1.5,0,0,0,17.5,11ZM10,14v6h4V14Z"
								fill="#f8374b"
								fillRule="evenodd"
							/>
							<rect className="tbr-white" width="8" height="2" rx="1" transform="translate(8 2)" fill="#f8374b" opacity="0.3" />
						</svg>
					</a>
				</div>
				<button type="button" disabled={saving} onMouseDown={triggerRipple} onClick={onSave} className={legacyButtonClass("primary", RIPPLE_CLASS)}>
					{saving ? (
						<span role="status" className="absolute h-[32px] w-[32px] rounded-full bg-white opacity-0 [animation:legacy-spinner-grow_0.75s_linear_infinite]" />
					) : null}
					<span className={saving ? "invisible" : undefined}>Simpan</span>
				</button>
			</div>
		</LegacyCard>
	)
}

export default RegistrantWidgetStatus
