import type { JSX } from "react"

import LegacyButton from "@/components/legacy/legacy-button"
import { RIPPLE_CLASS, triggerRipple } from "@/lib/ripple"

export const SYSTEM_FIELD_CLASS = "min-[992px]:w-[calc(75%-7.5px)]"

type SystemSubmitRowProps = { loading: boolean }

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
