import type { JSX } from "react"
import { useMemo } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createAttachmentSchema, type AttachmentInput } from "@/schemas/register.schema"
import { psbApi } from "@/lib/api"
import { useNavigate } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { FileUploadField } from "@roja/ui"
import { isFieldVisible, getFieldLabel, isFieldRequired, isGroupAllInvisible } from "@roja/utils"
import { NoNeedDataDisclaimer } from "../no-need-data-disclaimer"

export const InvalidAttachmentStepContent = ({ onPrev }: { onPrev: () => void }): JSX.Element => {
	const navigate = useNavigate()
	const queryClient = useQueryClient()

	const { data: landingData } = useQuery({
		queryKey: ["landingInfo"],
		queryFn: () => psbApi.getLanding(),
	})
	const formSettings = landingData?.formSettings
	const isAllInvisible = isGroupAllInvisible(formSettings, "attachment data")

	const dynamicSchema = useMemo(() => createAttachmentSchema(formSettings), [formSettings])

	const mutation = useMutation({
		mutationFn: (files: Record<string, any>) => psbApi.updateInvalidAttachment(files),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["invalidData"] })
			queryClient.invalidateQueries({ queryKey: ["dashboard"] })
			toast.success("Perbaikan Data Berhasil Disimpan", { description: "Data Anda akan segera diverifikasi kembali oleh panitia." })
			navigate({ to: "/dashboard" })
		},
		onError: (err: any) => {
			toast.error("Gagal Menyimpan Perbaikan Berkas", {
				description: err instanceof Error ? err.message : "Terjadi kesalahan saat mengunggah berkas perbaikan.",
			})
		},
	})

	const {
		handleSubmit,
		control,
		formState: { errors },
	} = useForm<AttachmentInput>({
		resolver: zodResolver(dynamicSchema) as unknown as import("react-hook-form").Resolver<AttachmentInput>,
	})

	const onFormError = (formErrors: Record<string, any>): void => {
		console.error("Form Validation Errors (Invalid Attachment):", formErrors)
		toast.error("Dokumen Belum Lengkap", { description: "Mohon unggah dokumen berkas wajib yang belum diunggah." })
	}

	return (
		<form onSubmit={handleSubmit((d) => mutation.mutate(d), onFormError)} className="flex flex-col gap-8">
			<div className="border-l-4 border-l-[#ffa800] pl-4 py-1 mb-2">
				<div className="text-xs font-bold text-[#ffa800] tracking-wide m-0">Perbaiki Data: Sub-step 5 (Lampiran Berkas)</div>
				<div className="text-[10px] text-[var(--grey)] mt-0.5">Unggah ulang berkas dokumen yang ditandai tidak valid.</div>
			</div>

			{isAllInvisible && <NoNeedDataDisclaimer />}

			<div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6">
				{isFieldVisible(formSettings, 63) && (
					<Controller
						control={control}
						name="ijazah"
						render={({ field }) => (
							<FileUploadField
								label={`${getFieldLabel(formSettings, 63, "Salinan Ijazah Terakhir / SKL")}${isFieldRequired(formSettings, 63) ? " *" : ""}`}
								value={field.value}
								onChange={field.onChange}
								error={errors.ijazah?.message}
							/>
						)}
					/>
				)}

				{isFieldVisible(formSettings, 64) && (
					<Controller
						control={control}
						name="photo"
						render={({ field }) => (
							<FileUploadField
								label={`${getFieldLabel(formSettings, 64, "Pas Foto Calon Santri (Ukuran 3x4)")}${isFieldRequired(formSettings, 64) ? " *" : ""}`}
								value={field.value}
								onChange={field.onChange}
								error={errors.photo?.message}
							/>
						)}
					/>
				)}

				{isFieldVisible(formSettings, 65) && (
					<Controller
						control={control}
						name="kk"
						render={({ field }) => (
							<FileUploadField
								label={`${getFieldLabel(formSettings, 65, "Salinan Kartu Keluarga (KK)")}${isFieldRequired(formSettings, 65) ? " *" : ""}`}
								value={field.value}
								onChange={field.onChange}
								error={errors.kk?.message}
							/>
						)}
					/>
				)}

				{isFieldVisible(formSettings, 69) && (
					<Controller
						control={control}
						name="birthCert"
						render={({ field }) => (
							<FileUploadField
								label={`${getFieldLabel(formSettings, 69, "Salinan Akta Kelahiran")}${isFieldRequired(formSettings, 69) ? " *" : ""}`}
								value={field.value}
								onChange={field.onChange}
								error={errors.birthCert?.message}
							/>
						)}
					/>
				)}

				{isFieldVisible(formSettings, 68) && (
					<Controller
						control={control}
						name="reportCard"
						render={({ field }) => (
							<FileUploadField
								label={`${getFieldLabel(formSettings, 68, "Salinan Rapor Terakhir")}${isFieldRequired(formSettings, 68) ? " *" : ""}`}
								value={field.value}
								onChange={field.onChange}
								error={errors.reportCard?.message}
							/>
						)}
					/>
				)}

				{isFieldVisible(formSettings, 66) && (
					<Controller
						control={control}
						name="ksp"
						render={({ field }) => (
							<FileUploadField
								label={`${getFieldLabel(formSettings, 66, "Kartu Sejahtera / KSP")}${isFieldRequired(formSettings, 66) ? " *" : ""}`}
								value={field.value}
								onChange={field.onChange}
								error={errors.ksp?.message}
							/>
						)}
					/>
				)}

				{isFieldVisible(formSettings, 67) && (
					<Controller
						control={control}
						name="kip"
						render={({ field }) => (
							<FileUploadField
								label={`${getFieldLabel(formSettings, 67, "Kartu Indonesia Pintar / KIP")}${isFieldRequired(formSettings, 67) ? " *" : ""}`}
								value={field.value}
								onChange={field.onChange}
								error={errors.kip?.message}
							/>
						)}
					/>
				)}
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
