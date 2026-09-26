import type { JSX } from "react"

const AdminFooter = (): JSX.Element => (
	<footer className="mx-[-15px] mt-[30px] mb-[-15px] bg-[var(--bg-secondary)] px-[15px] py-[12px] text-[11px] text-[var(--grey)] md:mx-[-30px] md:mb-[-30px] md:px-[30px]">
		<div className="mx-[-15px] flex flex-wrap">
			<div className="w-full px-[15px] text-center lg:w-2/3 lg:text-left">
				Copyright {new Date().getFullYear()} PONDOK ROJA. All Rights Reserved.
			</div>
		</div>
	</footer>
)

export default AdminFooter
