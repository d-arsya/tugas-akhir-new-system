import type { JSX } from "react"
import { useParams, createFileRoute } from "@tanstack/react-router"
import { psbApi } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"

const PrintPage = (): JSX.Element => {
	const { type, registrantId } = useParams({ strict: false }) as { type?: string; registrantId?: string }

	const { data, isLoading } = useQuery({
		queryKey: ["printData", registrantId],
		queryFn: async () => {
			// In mock flow, fetch dashboard details which has the registrant model
			const dbStr = localStorage.getItem("roja-psb-mock-db")
			if (dbStr && registrantId) {
				const db = JSON.parse(dbStr)
				return db.registrants[parseInt(registrantId)]
			}
			return null
		},
		enabled: !!registrantId,
	})

	useEffect(() => {
		let timer: ReturnType<typeof setTimeout> | undefined
		if (data) {
			timer = setTimeout(() => {
				window.print()
			}, 1000)
		}
		return () => {
			if (timer) clearTimeout(timer)
		}
	}, [data])

	if (isLoading) {
		return <div className="p-8 text-center text-xs">Memuat dokumen cetak...</div>
	}

	if (!data) {
		return <div className="p-8 text-center text-xs text-[var(--danger)]">Data tidak ditemukan</div>
	}

	return (
		<div className="bg-white text-black p-8 max-w-2xl mx-auto font-sans leading-relaxed">
			{/* Print Button (hidden during actual print) */}
			<div className="flex justify-end mb-6 print:hidden">
				<button
					onClick={() => window.print()}
					className="roja_btn roja_btn-primary text-white bg-[var(--primary)] text-xs font-semibold py-2 px-4"
				>
					🖨️ Cetak Halaman Ini
				</button>
			</div>

			{/* Letter Head / Kop Surat */}
			<div className="flex flex-col items-center text-center border-b-2 border-black pb-4 mb-6">
				<span className="font-bold text-lg tracking-wider">PANITIA PENERIMAAN SANTRI BARU</span>
				<span className="font-bold text-xl uppercase tracking-widest text-[var(--primary)]">PONDOK ROJA</span>
				<span className="text-xs text-slate-600 mt-1">
					Jl. Raya Roja No. 42, Bandung, Jawa Barat | Telp: (022) 1234567
				</span>
			</div>

			{/* Render Registration Receipt */}
			{type === "registration" && (
				<div className="flex flex-col gap-4 text-xs">
					<h3 className="text-sm font-bold text-center underline uppercase mb-4">
						KARTU BUKTI PENDAFTARAN SANTRI BARU
					</h3>

					<div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-100">
						<span className="font-semibold text-slate-600">Nomor Pendaftaran</span>
						<span className="col-span-2 font-bold text-slate-900">: {data.registrantId}</span>
					</div>

					<div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-100">
						<span className="font-semibold text-slate-600">Nama Lengkap</span>
						<span className="col-span-2 font-semibold text-slate-800">: {data.fullName}</span>
					</div>

					<div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-100">
						<span className="font-semibold text-slate-600">Jenis Kelamin</span>
						<span className="col-span-2 text-slate-800">
							: {data.gender === "male" ? "Laki-laki" : "Perempuan"}
						</span>
					</div>

					<div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-100">
						<span className="font-semibold text-slate-600">Kewarganegaraan</span>
						<span className="col-span-2 text-slate-800">: {data.nationality?.toUpperCase()}</span>
					</div>

					<div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-100">
						<span className="font-semibold text-slate-600">Tempat, Tgl Lahir</span>
						<span className="col-span-2 text-slate-800">
							: {data.placeOfBirth}, {data.dateOfBirth}
						</span>
					</div>

					<div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-100">
						<span className="font-semibold text-slate-600">Alamat Lengkap</span>
						<span className="col-span-2 text-slate-800">: {data.personal?.address}</span>
					</div>

					<div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-100">
						<span className="font-semibold text-slate-600">Sekolah Asal</span>
						<span className="col-span-2 text-slate-800">: {data.personal?.previousSchoolName}</span>
					</div>

					<div className="mt-8 flex justify-between text-center">
						<div className="flex flex-col gap-12 text-[10px]">
							<span>Tanda Tangan Pendaftar,</span>
							<span className="font-semibold underline">{data.fullName}</span>
						</div>
						<div className="flex flex-col gap-12 text-[10px]">
							<span>Bandung, {new Date().toLocaleDateString("id-ID")}</span>
							<span className="font-semibold underline">Panitia PSB Pondok Roja</span>
						</div>
					</div>
				</div>
			)}

			{/* Render Acceptance Letter */}
			{type === "accepted" && (
				<div className="flex flex-col gap-4 text-xs">
					<h3 className="text-sm font-bold text-center underline uppercase mb-4">
						SURAT KETERANGAN LULUS SELEKSI
					</h3>

					<p className="leading-relaxed">
						Berdasarkan hasil seleksi administrasi dan ujian masuk calon santri Pondok Roja Tahun Akademik{" "}
						{data.academicYearId}, dengan ini Panitia Penerimaan Santri Baru menyatakan bahwa:
					</p>

					<div className="my-4 bg-slate-50 border border-slate-200 rounded p-4 flex flex-col gap-2">
						<div className="grid grid-cols-3 gap-2">
							<span className="font-semibold">Nomor Pendaftaran</span>
							<span className="col-span-2 font-bold text-[var(--primary)]">: {data.registrantId}</span>
						</div>
						<div className="grid grid-cols-3 gap-2">
							<span className="font-semibold">Nama Lengkap</span>
							<span className="col-span-2 font-semibold">: {data.fullName}</span>
						</div>
						<div className="grid grid-cols-3 gap-2">
							<span className="font-semibold">Jenjang Pendidikan</span>
							<span className="col-span-2">: {data.levelId === 1 ? "SMP Roja" : "SMA Roja"}</span>
						</div>
						<div className="grid grid-cols-3 gap-2">
							<span className="font-semibold">Status Kelulusan</span>
							<span className="col-span-2 font-bold text-[var(--success)]">: LULUS / DITERIMA</span>
						</div>
					</div>

					<p className="leading-relaxed">
						Calon santri yang dinyatakan lulus wajib melakukan proses pendaftaran ulang dan melengkapi seluruh administrasi keuangan paling lambat 14 hari sejak surat keterangan ini diterbitkan.
					</p>

					<div className="mt-8 flex justify-end text-center">
						<div className="flex flex-col gap-12 text-[10px]">
							<span>Bandung, {new Date().toLocaleDateString("id-ID")}</span>
							<span className="font-semibold underline">Panitia PSB Pondok Roja</span>
						</div>
					</div>
				</div>
			)}

			{/* Render Rejection Letter */}
			{type === "rejected" && (
				<div className="flex flex-col gap-4 text-xs">
					<h3 className="text-sm font-bold text-center underline uppercase mb-4">
						SURAT KEPUTUSAN HASIL SELEKSI
					</h3>

					<p className="leading-relaxed">
						Berdasarkan evaluasi berkas dan ujian masuk calon santri Pondok Roja, dengan ini Panitia Penerimaan Santri Baru mengumumkan hasil seleksi atas nama:
					</p>

					<div className="my-4 bg-slate-50 border border-slate-200 rounded p-4 flex flex-col gap-2">
						<div className="grid grid-cols-3 gap-2">
							<span className="font-semibold">Nomor Pendaftaran</span>
							<span className="col-span-2 font-bold">: {data.registrantId}</span>
						</div>
						<div className="grid grid-cols-3 gap-2">
							<span className="font-semibold">Nama Lengkap</span>
							<span className="col-span-2 font-semibold">: {data.fullName}</span>
						</div>
						<div className="grid grid-cols-3 gap-2">
							<span className="font-semibold">Status Kelulusan</span>
							<span className="col-span-2 font-bold text-[var(--danger)]">: BELUM DITERIMA</span>
						</div>
					</div>

					<p className="leading-relaxed">
						Mohon maaf, Anda dinyatakan belum lolos seleksi penerimaan santri baru Pondok Roja gelombang ini. Terima kasih atas partisipasi dan minat Anda untuk bergabung bersama kami.
					</p>

					<div className="mt-8 flex justify-end text-center">
						<div className="flex flex-col gap-12 text-[10px]">
							<span>Bandung, {new Date().toLocaleDateString("id-ID")}</span>
							<span className="font-semibold underline">Panitia PSB Pondok Roja</span>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export const Route = createFileRoute("/print/$type/$registrantId")({
	component: PrintPage,
})

export default PrintPage
