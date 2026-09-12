import type { JSX } from "react"
import { useState } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { RojaCard } from "@roja/ui"
import { AlertCircle, X } from "lucide-react"
import useAuthStore from "@/stores/auth.store"
import { useMerchantProfile } from "@/hooks/use-merchant-queries"

const ProfilePage = (): JSX.Element => {
	const { user } = useAuthStore()
	const { data: profile, isLoading } = useMerchantProfile()
	const [dismissAlert, setDismissAlert] = useState(false)


	const hasNoEmail = !profile?.email && !user?.email

	if (isLoading || !profile) {
		return (
			<div className="py-12 text-center text-slate-400 text-sm font-medium">
				Memuat data profil...
			</div>
		)
	}

	return (
		<div className="w-full flex flex-col gap-5">
			{/* Missing Email Alert (matching Santri profile styling) */}
			{hasNoEmail && !dismissAlert && (
				<div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-between gap-3 text-xs text-rose-800 shadow-sm">
					<div className="flex items-center gap-2.5">
						<div className="p-1.5 rounded-full bg-rose-200/60 shrink-0 text-rose-600">
							<AlertCircle className="w-4 h-4" />
						</div>
						<span>
							Kamu perlu menambahkan email agar suatu saat bisa memulihkan akun.{" "}
							<Link to="/setting" className="text-rose-600 font-bold hover:underline">
								Atur Sekarang
							</Link>
						</span>
					</div>
					<button
						type="button"
						onClick={() => setDismissAlert(true)}
						className="p-1 text-rose-400 hover:text-rose-700 rounded-lg hover:bg-rose-100/60"
					>
						<X className="w-4 h-4" />
					</button>
				</div>
			)}

			{/* Unified Card Container (Background with no gap between cards) */}
			<RojaCard className="p-6 md:p-8 rounded-2xl shadow-sm border-slate-100 bg-white">
				{/* Section 1: Profil Saya */}
				<div>
					<div className="mb-6">
						<h5 className="text-base sm:text-lg font-bold text-slate-800">Profil Saya</h5>
						<p className="text-xs text-slate-500 mt-0.5">
							Hubungi admin jika ada kesalahan data.
						</p>
					</div>

					<div className="w-full max-w-2xl pl-0 sm:pl-6">
						<table className="w-full text-xs">
							<tbody>
								<tr className="border-b border-slate-100/70">
									<td className="text-slate-400 font-medium w-48 py-3.5 align-top">
										Nomor Merchant
									</td>
									<td className="text-slate-800 font-semibold py-3.5 align-top font-mono">
										{profile.uniqueNumber}
									</td>
								</tr>
								<tr>
									<td className="text-slate-400 font-medium w-48 py-3.5 align-top">
										Nama Pemilik Merchant
									</td>
									<td className="text-slate-800 font-semibold py-3.5 align-top">
										{profile.name}
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				{/* Divider (No gap between cards) */}
				<hr className="my-8 border-slate-100" />

				{/* Section 2: Profil Merchant */}
				<div>
					<div className="mb-6">
						<h5 className="text-base sm:text-lg font-bold text-slate-800">Profil Merchant</h5>
						<p className="text-xs text-slate-500 mt-0.5">
							Hubungi admin jika ada kesalahan data.
						</p>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
						<div className="lg:col-span-8 w-full pl-0 sm:pl-6">
							<table className="w-full text-xs">
								<tbody>
									<tr className="border-b border-slate-100/70">
										<td className="text-slate-400 font-medium w-48 py-3.5 align-top">
											Nama Merchant
										</td>
										<td className="text-slate-800 font-semibold py-3.5 align-top">
											{profile.merchantName || "-"}
										</td>
									</tr>
									<tr className="border-b border-slate-100/70">
										<td className="text-slate-400 font-medium w-48 py-3.5 align-top">
											Alamat
										</td>
										<td className="text-slate-800 font-semibold py-3.5 align-top">
											{profile.address || "-"}
										</td>
									</tr>
									<tr>
										<td className="text-slate-400 font-medium w-48 py-3.5 align-top">
											Nomor Telepon
										</td>
										<td className="text-slate-800 font-semibold py-3.5 align-top font-mono">
											{profile.phone || "-"}
										</td>
									</tr>
								</tbody>
							</table>
						</div>

						<div className="lg:col-span-4 flex justify-center items-center">
							<div className="w-[93px] h-[93px] rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-bold text-2xl shadow-inner">
								{profile.photo ? (
									<img
										src={profile.photo}
										alt={profile.merchantName || "Merchant"}
										className="w-full h-full object-cover"
									/>
								) : (
									profile.merchantName?.charAt(0) || "M"
								)}
							</div>
						</div>
					</div>
				</div>
			</RojaCard>
		</div>
	)
}

export const Route = createFileRoute("/_member/profile")({
	component: ProfilePage,
})

export default ProfilePage
