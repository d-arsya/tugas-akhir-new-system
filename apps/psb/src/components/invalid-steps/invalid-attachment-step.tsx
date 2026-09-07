import type { JSX } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { attachmentSchema, type AttachmentInput } from "@/schemas/register.schema"
import { psbApi } from "@/lib/api"
import FileUploadField from "@/components/file-upload-field"
import { useNavigate } from "@tanstack/react-router"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ChevronRight } from "lucide-react"

export const InvalidAttachmentStepContent = ({ onPrev }: { onPrev: () => void }): JSX.Element => {
	const navigate = useNavigate()
	const queryClient = useQueryClient()

	const mutation = useMutation({
		mutationFn: (files: Record<string, any>) => psbApi.updateInvalidAttachment(files),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["invalidData"] })
			queryClient.invalidateQueries({ queryKey: ["dashboard"] })
			alert("Perbaikan data Anda telah tersimpan.")
			navigate({ to: "/dashboard" })
		},
	})

	const {
		handleSubmit,
		control,
		formState: { errors },
	} = useForm<AttachmentInput>({
		resolver: zodResolver(attachmentSchema) as unknown as import("react-hook-form").Resolver<AttachmentInput>,
	})

	return (
		<form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="flex flex-col gap-8">
			<div className="border-l-4 border-l-[#ffa800] pl-4 py-1 mb-2">
				<div className="text-xs font-bold text-[#ffa800] tracking-wide m-0">Perbaiki Data: Sub-step 5 (Lampiran Berkas)</div>
				<div className="text-[10px] text-[var(--grey)] mt-0.5">Unggah ulang berkas dokumen yang ditandai tidak valid.</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6">
				<Controller
					control={control}
					name="ijazah"
					render={({ field }) => (
						<FileUploadField label="1. Salinan Ijazah / SKL (PDF/JPG)" value={field.value} onChange={field.onChange} error={errors.ijazah?.message} />
					)}
				/>
				<Controller
					control={control}
					name="photo"
					render={({ field }) => (
						<FileUploadField label="2. Pas Foto Calon Santri (3x4)" value={field.value} onChange={field.onChange} error={errors.photo?.message} />
					)}
				/>
				<Controller
					control={control}
					name="kk"
					render={({ field }) => (
						<FileUploadField label="3. Salinan Kartu Keluarga (KK)" value={field.value} onChange={field.onChange} error={errors.kk?.message} />
					)}
				/>
				<Controller
					control={control}
					name="birthCert"
					render={({ field }) => (
						<FileUploadField label="4. Salinan Akta Kelahiran" value={field.value} onChange={field.onChange} error={errors.birthCert?.message} />
					)}
				/>
				<Controller
					control={control}
					name="reportCard"
					render={({ field }) => (
						<FileUploadField label="5. Salinan Rapor Terakhir (Jika ada)" value={field.value} onChange={field.onChange} error={errors.reportCard?.message} />
					)}
				/>
				<Controller
					control={control}
					name="ksp"
					render={({ field }) => (
						<FileUploadField label="6. Kartu Sejahtera / KSP (Jika ada)" value={field.value} onChange={field.onChange} error={errors.ksp?.message} />
					)}
				/>
				<Controller
					control={control}
					name="kip"
					render={({ field }) => (
						<FileUploadField label="7. Kartu Indonesia Pintar / KIP (Jika ada)" value={field.value} onChange={field.onChange} error={errors.kip?.message} />
					)}
				/>
			</div>

			<div className="flex justify-between gap-4 mt-8 border-t border-[var(--bg-form-border)] pt-6">
				<button type="button" onClick={onPrev} className="roja_btn roja_btn-secondary text-xs">
					Sebelumnya
				</button>
				<button type="submit" className="roja_btn roja_btn-warning text-white bg-[#ffa800] hover:bg-[#e09400] font-semibold flex items-center gap-2 shadow-lg shadow-[#ffa800]/20" disabled={mutation.isPending}>
					<span>{mutation.isPending ? "Mengirim..." : "Selesaikan Perbaikan Data"}</span>
					<ChevronRight className="w-5 h-5" />
				</button>
			</div>
		</form>
	)
}

export default InvalidAttachmentStepContent
