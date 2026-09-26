import type { JSX } from "react"

import LegacyCard from "@/components/legacy/legacy-card"

const MassSpecialConditionBanner = (): JSX.Element => (
	<LegacyCard className="mt-[24px]" bodyClassName="relative overflow-hidden">
		<div className="absolute top-[20px] left-0 h-[calc(100%-40px)] w-[5px] rounded-[16px] bg-[var(--primary)]" />
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 160.713 145.967"
			aria-hidden="true"
			className="pointer-events-none absolute right-0 bottom-[-20px] h-[150px] w-[160px] opacity-30"
		>
			<path
				d="M19,133.97a10,10,0,0,1-8.665-14.991l62.2-107.968a10,10,0,0,1,17.33,0l61.848,107.368v5.623a10,10,0,0,1-10,10Z"
				fill="#f8374b"
				opacity="0.3"
			/>
			<rect x="73.679" y="49.124" width="13.355" height="48.968" rx="6.677" fill="#f8374b" />
			<rect x="73.679" y="105.124" width="13.355" height="13.355" rx="6.677" fill="#f8374b" />
		</svg>
		<div className="flex">
			<svg xmlns="http://www.w3.org/2000/svg" width="78" height="78" viewBox="0 0 78 78" aria-hidden="true" className="shrink-0">
				<circle cx="39" cy="39" r="30" fill="#f8374b" />
				<path
					d="M18.318,4.922,2.932,32.278a1.81,1.81,0,0,0,.717,2.477,1.863,1.863,0,0,0,.9.229H36.855A1.833,1.833,0,0,0,38.7,33.163a1.805,1.805,0,0,0-.271-.95L21.5,4.857a1.858,1.858,0,0,0-2.536-.6A1.832,1.832,0,0,0,18.318,4.922Z"
					transform="translate(18.813 13.922)"
					fill="#fff"
					fillRule="evenodd"
					opacity="0.3"
				/>
				<rect x="37.5" y="29.5" width="3" height="11" rx="1.5" fill="#fff" />
				<rect x="37.5" y="41.5" width="3" height="3" rx="1.5" fill="#fff" />
			</svg>
			<ul className="m-0 list-none pl-[13px] [&>li]:relative [&>li]:mb-[5px] [&>li]:before:absolute [&>li]:before:top-[8px] [&>li]:before:left-[-13px] [&>li]:before:block [&>li]:before:h-[5px] [&>li]:before:w-[5px] [&>li]:before:rounded-full [&>li]:before:bg-[var(--danger)] [&>li]:before:content-['']">
				<li>Terdeteksi item yang berbeda antara satu santri dengan santri lainya.</li>
				<li>Sistem hanya menampilkan item yang sama-sama dimiliki oleh santri (dipilih) dan,</li>
				<li>Menampilkan item yang sama-sama belum dimiliki santri (dipilih)</li>
				<li>Bila item sama tapi nominal berbeda, secara default diambilkan nominal dari master.</li>
			</ul>
		</div>
	</LegacyCard>
)

export default MassSpecialConditionBanner
