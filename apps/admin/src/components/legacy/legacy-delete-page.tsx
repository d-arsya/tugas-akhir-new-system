import { Link } from "@tanstack/react-router"
import type { JSX, ReactNode } from "react"

import { cn } from "@roja/utils"

import LegacyButton, { legacyButtonClass } from "./legacy-button"
import LegacyConfirmIcon from "./legacy-confirm-icon"
import { BackArrowIcon } from "./legacy-icons"

type LegacyDeletePageProps = {
	backTo: string
	heading: ReactNode
	description?: ReactNode
	children?: ReactNode
	helperLines?: readonly [string, string]
	confirmLabel?: string
	locked?: boolean
	loading: boolean
	onConfirm: () => void
}

const LegacyDeletePage = ({
	backTo,
	heading,
	description,
	children,
	helperLines,
	confirmLabel = "Ya, hapus",
	locked = false,
	loading,
	onConfirm,
}: LegacyDeletePageProps): JSX.Element => (
	<div className="mx-[-15px] flex flex-wrap justify-center">
		<div className="w-full px-[15px] min-[576px]:w-full min-[992px]:w-11/12 min-[1200px]:w-3/4">
			<div className="relative flex min-w-0 flex-col border-0 bg-transparent shadow-none">
				<Link
					to={backTo}
					className="absolute top-[10px] right-[10px] z-[1] inline-flex h-[40px] w-[40px] min-w-[40px] items-center justify-center rounded-[6px] bg-[var(--bg-inverse)] p-0 transition-all duration-300 min-[993px]:top-0 min-[993px]:right-[-50px]"
					aria-label="Kembali"
				>
					<BackArrowIcon />
				</Link>

				<div className="min-h-px flex-auto rounded-[20px] bg-[var(--bg-secondary)] bg-[url('/assets/svg/etc/Delete-Bg.svg')] bg-contain bg-[position:top_left] bg-no-repeat p-[24px] shadow-[0px_8px_30px_0px_rgba(0,0,0,0.08)]">
					<form
						onSubmit={(event) => {
							event.preventDefault()
							onConfirm()
						}}
					>
						<div className="mb-[16px] text-center">
							<LegacyConfirmIcon />
						</div>
						<div className="text-center">
							<h4 className="mt-0! mb-[8px]! text-[20px]! leading-[26px]! font-bold! tracking-normal! text-[var(--heading-txt-inverse)]!">
								{heading}
							</h4>

							{children ? (
								<div className="mx-[-15px] mt-[24px] mb-[16px] flex flex-wrap justify-center">
									<div className="w-full px-[15px] min-[992px]:w-7/12">
										<div className="mx-auto mb-[16px] max-w-[400px]">{children}</div>
										{helperLines ? (
											<>
												<div className="min-[576px]:hidden">
													<p className="mt-[8px] mb-0 leading-[24px] text-[var(--grey)]">
														{helperLines[0]} {helperLines[1]}
													</p>
												</div>
												<div className="hidden min-[576px]:block">
													<p className="mt-[8px] mb-0 leading-[24px] text-[var(--grey)]">{helperLines[0]}</p>
													<p className="mb-0 leading-[24px] text-[var(--grey)]">{helperLines[1]}</p>
												</div>
											</>
										) : null}
									</div>
								</div>
							) : null}

							{description ? <p className="mt-0 mb-[24px] leading-[24px]">{description}</p> : null}

							<div className="mb-[8px] text-center">
								<Link to={backTo} className={legacyButtonClass("light", "mr-[8px]")}>
									Batal
								</Link>{" "}
								<LegacyButton
									type="submit"
									variant="danger"
									loading={loading}
									className={cn(locked && "pointer-events-none opacity-20")}
								>
									{confirmLabel}
								</LegacyButton>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>
)

export default LegacyDeletePage
