import type { JSX } from "react"

export const NoNeedDataDisclaimer = (): JSX.Element => (
	<div
		className="p-4 text-center rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-medium border border-red-200 dark:border-red-900/50 mb-6"
		role="alert"
	>
		Kami belum membutuhkan data dibagian atau bidang ini. Silakan abaikan dan klik tombol selanjutnya.
	</div>
)

export default NoNeedDataDisclaimer
