import type { JSX } from "react"

import AdminPageTitle from "@/components/layout/admin-page-title"

const ComingSoon = (): JSX.Element => (
	<>
		<AdminPageTitle title="Coming Soon" breadcrumbs={[{ label: "Coming Soon" }]} />

		<div className="mx-[-15px] flex min-h-[calc(100vh-216px)] flex-wrap">
			<div className="w-full min-w-0 flex-1 basis-0 px-[15px]">
				<div className="mb-[24px] text-center">
					<div className="text-[var(--body-txt-color)]">
						<h2 className="m-0! mb-[16px]! text-[40px]! leading-[22.4px]! font-light! tracking-normal! text-[var(--heading-txt-inverse)]! max-[768px]:text-[24px]! min-[992px]:mb-[24px]!">
							Coming Soon
						</h2>
					</div>
					Halaman ini sedang dalam masa pengembangan. Mohon maaf atas ketidaknyamanannya.
				</div>
				<div className="mx-[-15px] flex flex-wrap justify-center">
					<div className="w-full px-[15px] min-[768px]:w-10/12 min-[992px]:w-7/12">
						<div className="text-center">
							<img className="w-full" src="/assets/svg/illustration/Coming-Soon-Light.svg" alt="Coming Soon" />
						</div>
					</div>
				</div>
			</div>
		</div>
	</>
)

export default ComingSoon
