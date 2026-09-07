import type { JSX } from "react"
import { useState, useEffect } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { RojaCard } from "@roja/ui"
import { santriApi } from "@/lib/api"
import type { Student } from "@roja/types"

const ProfilePage = (): JSX.Element => {
	const [student, setStudent] = useState<(Student & { gradeName?: string }) | null>(null)
	const [loading, setLoading] = useState<boolean>(true)

	useEffect(() => {
		const fetchProfile = async () => {
			setLoading(true)
			try {
				const res = await santriApi.getProfile()
				setStudent(res)
			} catch (err) {
				// Fallback
			} finally {
				setLoading(false)
			}
		}
		fetchProfile()
	}, [])

	if (loading || !student) {
		return (
			<div className="py-12 text-center text-slate-400 text-sm font-medium">
				Memuat data profil...
			</div>
		)
	}

	return (
		<div className="w-full">
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
									{student.fullName}
								</td>
							</tr>
							<tr className="border-b border-slate-100/70">
								<td className="text-slate-400 font-medium w-48 py-3.5 align-top">
									Kelas
								</td>
								<td className="text-slate-800 font-semibold py-3.5 align-top">
									{student.gradeName || "10 Aliyah"}
								</td>
							</tr>
							<tr>
								<td className="text-slate-400 font-medium w-48 py-3.5 align-top">
									Nomor Induk Santri
								</td>
								<td className="text-slate-800 font-semibold py-3.5 align-top">
									{student.nis}
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
