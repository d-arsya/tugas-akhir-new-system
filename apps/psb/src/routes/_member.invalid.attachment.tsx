import type { JSX } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { attachmentSchema, type AttachmentInput } from "@/schemas/register.schema"
import { psbApi } from "@/lib/api"
import FileUploadField from "@/components/file-upload-field"
import { useNavigate, createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

const InvalidAttachmentStep = (): JSX.Element => {
	const navigate = useNavigate()
	const queryClient = useQueryClient()

	const { data: initialData, isLoading } = useQuery({
		queryKey: ["invalidData"],
		queryFn: () => psbApi.getInvalidData(),
	})

	const mutation = useMutation({
		mutationFn: (data: AttachmentInput) => psbApi.updateInvalidAttachment(data as unknown as Record<string, string>),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["dashboard"] })
			alert("Data perbaikan berhasil dikirim!")
			navigate({ to: "/dashboard" })
		},
	})

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<AttachmentInput>({
		resolver: zodResolver(attachmentSchema) as unknown as import("react-hook-form").Resolver<AttachmentInput>,
		values: (initialData ? (initialData as Record<string, unknown>).attachments : {}) as AttachmentInput,
		defaultValues: {
			ijazah: "",
			photo: "",
			kk: "",
			birthCert: "",
		},
	})

	const onSubmit = (data: AttachmentInput): void => {
		mutation.mutate(data)
	}

	if (isLoading) {
		return <div className="text-center py-10 text-xs">Memuat data...</div>
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="border-l-4 border-l-[var(--primary)] pl-4 py-1 mb-2">
				<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">Perbaiki Data: Unggah Berkas & Lampiran</div>
				<div className="text-[10px] text-[var(--grey)] mt-0.5">Unggah ulang berkas ijazah, foto, KK, atau akta kelahiran yang tidak valid.</div>
			</div>

			<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Controller
						control={control}
						name="ijazah"
						render={({ field }) => (
							<FileUploadField
								label="Salinan Ijazah Terakhir"
								value={field.value}
								onChange={field.onChange}
								error={errors.ijazah?.message}
							/>
						)}
					/>

					<Controller
						control={control}
						name="photo"
						render={({ field }) => (
							<FileUploadField
								label="Pas Foto Calon Santri (3x4)"
								accept="image/png, image/jpeg"
								value={field.value}
								onChange={field.onChange}
								error={errors.photo?.message}
							/>
						)}
					/>

					<Controller
						control={control}
						name="kk"
						render={({ field }) => (
							<FileUploadField
								label="Salinan Kartu Keluarga (KK)"
								value={field.value}
								onChange={field.onChange}
								error={errors.kk?.message}
							/>
						)}
					/>

					<Controller
						control={control}
						name="birthCert"
						render={({ field }) => (
							<FileUploadField
								label="Salinan Akta Kelahiran"
								value={field.value}
								onChange={field.onChange}
								error={errors.birthCert?.message}
							/>
						)}
					/>
				</div>

				<div className="flex justify-between gap-4 mt-6 border-t border-slate-100 pt-4">
					<button
						type="button"
						onClick={() => navigate({ to: "/invalid/guardian" })}
						className="roja_btn roja_btn-secondary"
					>
						Sebelumnya
					</button>
					<button
						type="submit"
						className="roja_btn roja_btn-primary text-white bg-[var(--primary)]"
						disabled={mutation.isPending}
					>
						{mutation.isPending ? "Mengirim Perbaikan..." : "Kirim Perbaikan & Selesai"}
					</button>
				</div>
			</form>
		</div>
	)
}

export const Route = createFileRoute("/_member/invalid/attachment")({
	component: InvalidAttachmentStep,
})

export default InvalidAttachmentStep
