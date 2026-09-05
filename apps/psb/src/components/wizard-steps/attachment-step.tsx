import type { JSX } from "react"
import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { attachmentSchema, type AttachmentInput } from "@/schemas/register.schema"
import { psbApi } from "@/lib/api"
import useWizardStore from "@/stores/wizard.store"
import useAuthStore from "@/stores/auth.store"
import FileUploadField from "@/components/file-upload-field"
import { useNavigate } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ChevronRight } from "lucide-react"
import { Button } from "@roja/ui"
import { toast } from "sonner"

export const AttachmentStepContent = ({ onPrev }: { onPrev: () => void }): JSX.Element => {
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const sessionId = useWizardStore((s) => s.sessionId) || ""
	const login = useAuthStore((s) => s.login)
	const clearSession = useWizardStore((s) => s.clearSession)

	const { data: initialData, isLoading, error } = useQuery({
		queryKey: ["wizardStep", "attachment", sessionId],
		queryFn: () => psbApi.getWizardStep("attachment", sessionId),
		enabled: !!sessionId,
		retry: false,
	})

	useEffect(() => {
		if (error) {
			clearSession()
			toast.error(error instanceof Error ? error.message : "Sesi pendaftaran Anda telah berakhir.")
			navigate({ to: "/" })
		}
	}, [error, clearSession, navigate])

	const mutation = useMutation({
		mutationFn: (data: AttachmentInput) => psbApi.submitAttachment(sessionId, data),
		onSuccess: (res) => {
			login(res.user)
			clearSession()
			queryClient.invalidateQueries({ queryKey: ["wizardStep", "attachment", sessionId] })
			navigate({
				to: "/register/success/$registrantId",
				params: { registrantId: res.registrantId },
			})
		},
		onError: (err: any) => {
			toast.error(err instanceof Error ? err.message : "Gagal mengirimkan pendaftaran")
		},
	})

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<AttachmentInput>({
		resolver: zodResolver(attachmentSchema) as unknown as import("react-hook-form").Resolver<AttachmentInput>,
		values: (initialData || {}) as AttachmentInput,
		defaultValues: {
			ijazah: undefined,
			photo: undefined,
			kk: undefined,
			birthCert: undefined,
			ksp: undefined,
			kip: undefined,
			reportCard: undefined,
		},
	})

	const onSubmit = (data: AttachmentInput): void => {
		mutation.mutate(data)
	}

	if (isLoading) {
		return <div className="text-center py-10 text-xs">Memuat data...</div>
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
			{/* Section A: Unggah Berkas */}
			<div>
				<div className="border-l-4 border-l-[var(--primary)] pl-4 py-1 mb-6">
					<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">Unggah Berkas & Lampiran</div>
				</div>
				<p className="text-xs text-[var(--body-txt-inverse)] mb-6">
					Silakan unggah berkas foto/dokumen dalam format .JPG, .JPEG, atau .PNG dengan ukuran maksimal 5MB.
				</p>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6">
					<Controller
						control={control}
						name="ijazah"
						render={({ field }) => (
							<FileUploadField
								label="Salinan Ijazah Terakhir / SKL"
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
								label="Pas Foto Calon Santri (Ukuran 3x4)"
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

					<Controller
						control={control}
						name="reportCard"
						render={({ field }) => (
							<FileUploadField
								label="Salinan Rapor Terakhir (Optional)"
								value={field.value}
								onChange={field.onChange}
								error={errors.reportCard?.message}
							/>
						)}
					/>

					<Controller
						control={control}
						name="ksp"
						render={({ field }) => (
							<FileUploadField
								label="Kartu Sejahtera / KSP (Jika ada)"
								value={field.value}
								onChange={field.onChange}
								error={errors.ksp?.message}
							/>
						)}
					/>

					<Controller
						control={control}
						name="kip"
						render={({ field }) => (
							<FileUploadField
								label="Kartu Indonesia Pintar / KIP (Jika ada)"
								value={field.value}
								onChange={field.onChange}
								error={errors.kip?.message}
							/>
						)}
					/>
				</div>
			</div>

			<div className="flex justify-between gap-4 mt-8 border-t border-[var(--bg-form-border)] pt-6">
				<Button
					type="button"
					onClick={onPrev}
					variant="outline"
				>
					Sebelumnya
				</Button>
				<Button
					type="submit"
					variant="roja-warning"
					disabled={mutation.isPending}
				>
					<span>{mutation.isPending ? "Mengirim..." : "Selesaikan Pendaftaran"}</span>
					<ChevronRight className="w-5 h-5 ml-1" />
				</Button>
			</div>
		</form>
	)
}

export default AttachmentStepContent
