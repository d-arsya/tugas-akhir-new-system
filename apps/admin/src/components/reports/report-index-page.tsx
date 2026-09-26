import type { JSX } from "react"

import AdminPageTitle from "@/components/layout/admin-page-title"

import ReportMenuCard from "./report-menu-card"

const ReportIndexPage = (): JSX.Element => {
	return (
		<>
			<AdminPageTitle title="Laporan" breadcrumbs={[{ label: "Laporan" }]} />

			<div>
				<h5 className="my-[10px]! text-[22px]! leading-[22.4px]! font-semibold! tracking-normal! text-[var(--heading-txt-color)]!">
					Laporan pembayaran santri
				</h5>
				<p className="m-0 mb-[20px] text-[12px] leading-[24px]">Silakan pilih terlebih dahulu :</p>
			</div>

			<div className="min-[992px]:min-h-[367px]">
				<div className="mx-[-15px] flex flex-wrap">
					<div className="mb-[24px] w-full px-[15px] min-[992px]:mb-0 min-[992px]:w-1/3">
						<ReportMenuCard
							to="/reports/income"
							icon="/assets/svg/icons/laporan-pemasukkan.svg"
							title="Laporan Pemasukkan"
							description="Laporan uang masuk dari riwayat pembayaran santri secara umum dan uang masuk dikelompokkan berdasarkan akun."
						/>
					</div>
					<div className="w-full px-[15px] min-[992px]:w-1/3">
						<ReportMenuCard
							to="/reports/arrears"
							icon="/assets/svg/icons/laporan-tunggakan.svg"
							title="Laporan Tunggakan"
							description="Tagihan-tagihan yang sudah over due dan belum dibayarkan oleh santri."
						/>
					</div>
				</div>
				<hr className="my-[48px] h-px border-0 bg-[linear-gradient(to_left,rgba(0,0,0,0),rgba(0,0,0,0.2),rgba(0,0,0,0))]" />
			</div>
		</>
	)
}

export default ReportIndexPage
