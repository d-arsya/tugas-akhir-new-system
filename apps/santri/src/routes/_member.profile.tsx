import type { JSX } from "react"
import { useState } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { RojaCard } from "@roja/ui"
import { AlertCircle, X } from "lucide-react"
import useAuthStore from "@/stores/auth.store"
import { useSantriProfile } from "@/hooks/use-santri-queries"

const ProfilePage = (): JSX.Element => {
	const { user } = useAuthStore()
	const { data: student, isLoading } = useSantriProfile()
	const [dismissAlert, setDismissAlert] = useState<boolean>(false)

	const hasNoEmail = !student?.email && !user?.email

	if (isLoading || !student) {
		return (
			<div className="py-12 text-center text-slate-400 text-sm font-medium">
				Memuat data profil...
			</div>
		)
	}

	return (
		<div className="w-full flex flex-col gap-5">
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

			{/* Main Profile Card (matching profile/index.blade.php) */}
			<RojaCard className="p-6 md:p-8 rounded-2xl shadow-sm border-slate-100 bg-white">
				{/* Intro Header */}
				<div className="mb-6">
					<h3 className="text-base sm:text-lg font-bold text-slate-800">Profil Saya</h3>
					<p className="text-xs text-slate-500 mt-0.5">
						Hubungi admin jika ada kesalahan data.
					</p>
				</div>

				{/* Table Profile Details */}
				<div className="w-full max-w-2xl pl-0 sm:pl-6">
					<table className="w-full text-xs">
						<tbody>
							<tr className="border-b border-slate-100/70">
								<td className="text-slate-400 font-medium w-48 py-3.5 align-top">
									Nama Lengkap
								</td>
								<td className="text-slate-800 font-semibold py-3.5 align-top">
									{student.activeGrade.fullname || user?.name || "Santri"}
								</td>
							</tr>
							<tr className="border-b border-slate-100/70">
								<td className="text-slate-400 font-medium w-48 py-3.5 align-top">
									Kelas
								</td>
								<td className="text-slate-800 font-semibold py-3.5 align-top">
									{parseInt(student.activeGrade.grade) + 6 || "10"} {student.activeGrade.subGrade || ""} {student.activeGrade.majorName ? `(${student.activeGrade.majorName})` : ""}
								</td>
							</tr>
							<tr>
								<td className="text-slate-400 font-medium w-48 py-3.5 align-top">
									Nomor Induk Santri
								</td>
								<td className="text-slate-800 font-semibold py-3.5 align-top">
									{student.student.nis || "-"}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</RojaCard>
		</div>
	)
}

export const Route = createFileRoute("/_member/profile")({
	component: ProfilePage,
})

export default ProfilePage
