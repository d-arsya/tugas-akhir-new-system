import type { JSX } from "react"

export const NoNeedDataDisclaimer = (): JSX.Element => (
	<div
		className="p-4 text-center rounded-lg bg-red-50 text-red-600 text-xs font-medium border border-red-200 mb-6"
		role="alert"
	>
		Kami belum membutuhkan data dibagian atau bidang ini. Silakan abaikan dan klik tombol selanjutnya.
	</div>
)

export default NoNeedDataDisclaimer
