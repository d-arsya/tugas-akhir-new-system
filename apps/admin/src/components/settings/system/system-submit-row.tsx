import type { JSX } from "react"

import LegacyButton from "@/components/legacy/legacy-button"
import { RIPPLE_CLASS, triggerRipple } from "@/lib/ripple"

/**
 * The Sistem forms put their fields in `col-lg-6`, while `LegacyFormRow`'s 4-column variant hands
 * over the `col-lg-8` rest of the row. This trims the child back to the col-lg-6 content box
 * (75% of the col-lg-8 content box, minus the 7.5px of gutter the narrower column loses).
 */
export const SYSTEM_FIELD_CLASS = "min-[992px]:w-[calc(75%-7.5px)]"

type SystemSubmitRowProps = { loading: boolean }

// `.row.justify-content-end.pb-2 > .col-lg-8 > .text-center.text-lg-left > button.tbr_btn-primary`
const SystemSubmitRow = ({ loading }: SystemSubmitRowProps): JSX.Element => (
	<div className="mx-[-15px] flex flex-wrap justify-end pb-[8px]">
		<div className="relative w-full max-w-full flex-[0_0_100%] px-[15px] min-[992px]:max-w-[66.666667%] min-[992px]:flex-[0_0_66.666667%]">
			<div className="text-center min-[992px]:text-left">
				<LegacyButton type="submit" variant="primary" loading={loading} className={RIPPLE_CLASS} onClick={triggerRipple}>
					Simpan
				</LegacyButton>
			</div>
		</div>
	</div>
)

export default SystemSubmitRow
