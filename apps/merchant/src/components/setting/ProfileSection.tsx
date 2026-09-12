import { type JSX, useState } from "react"
import { Store, Phone, MapPin, CheckCircle2 } from "lucide-react"
import { RojaCard, Input, Textarea, Button, toast } from "@roja/ui"
import { hijackMerchantApi } from "@/lib/dev-hijack"
import { createMerchantApi } from "@roja/api-client"

const merchantApi = hijackMerchantApi(createMerchantApi())

export interface ProfileSectionProps {
	initialMerchantName?: string
	initialPhone?: string
	initialAddress?: string
}

export const ProfileSection = ({
	initialMerchantName = "Kantin Utama Roja",
	initialPhone = "081234567890",
	initialAddress = "Gedung Utama Lt 1, Pesantren Pondok Roja",
}: ProfileSectionProps): JSX.Element => {
	const [merchantName, setMerchantName] = useState(initialMerchantName)
	const [phone, setPhone] = useState(initialPhone)
	const [address, setAddress] = useState(initialAddress)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!merchantName.trim() || !phone.trim() || !address.trim()) {
			toast.error("Validasi Gagal", { description: "Semua bidang profil wajib diisi." })
			return
		}

		setIsSubmitting(true)
		try {
			const res = await merchantApi.updateProfile({ merchantName, phone, address })
			toast.success("Profil Diperbarui", { description: res.message })
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Gagal memperbarui profil"
			toast.error("Gagal", { description: msg })
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="space-y-6">
			<div className="mb-6">
				<h5 className="text-base sm:text-lg font-bold text-slate-800">Informasi Profil Toko</h5>
				<p className="text-xs text-slate-500 mt-0.5">
					Perbarui nama toko, nomor telepon, dan lokasi merchant Anda.
				</p>
			</div>

			<form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
				<div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-start">
					<label className="md:col-span-4 text-xs font-semibold text-slate-600 md:text-right md:pt-2.5">
						Nama Toko / Kantin
					</label>
					<div className="md:col-span-7 flex flex-col gap-1">
						<Input
							value={merchantName}
							placeholder="Nama Toko / Kantin"
							onChange={(e) => setMerchantName(e.target.value)}
							className="h-10 text-xs rounded-xl border-slate-200 bg-white"
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-start">
					<label className="md:col-span-4 text-xs font-semibold text-slate-600 md:text-right md:pt-2.5">
						Nomor Telepon
					</label>
					<div className="md:col-span-7 flex flex-col gap-1">
						<Input
							value={phone}
							placeholder="Nomor Telepon / WhatsApp"
							onChange={(e) => setPhone(e.target.value)}
							className="h-10 text-xs font-mono rounded-xl border-slate-200 bg-white"
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-start">
					<label className="md:col-span-4 text-xs font-semibold text-slate-600 md:text-right md:pt-2.5">
						Alamat Lokasi
					</label>
					<div className="md:col-span-7 flex flex-col gap-1">
						<Textarea
							value={address}
							placeholder="Alamat / Lokasi Toko"
							onChange={(e) => setAddress(e.target.value)}
							className="text-xs rounded-xl border-slate-200 bg-white min-h-[70px]"
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-2">
					<div className="md:col-start-5 md:col-span-7">
						<Button
							type="submit"
							disabled={isSubmitting}
							className="rounded-xl bg-[#e4007e] hover:bg-[#c3006c] text-white px-8 h-10 font-semibold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
						>
							{isSubmitting ? "Menyimpan..." : "Simpan Perubahan Profil"}
							<CheckCircle2 className="w-4 h-4" />
						</Button>
					</div>
				</div>
			</form>
		</div>
	)
}

export default ProfileSection
