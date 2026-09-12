import type { JSX } from "react"
import { useEffect, useMemo } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createAttachmentSchema, type AttachmentInput } from "@/schemas/register.schema"
import { psbApi } from "@/lib/api"
import useWizardStore from "@/stores/wizard.store"
import useAuthStore from "@/stores/auth.store"
import { useNavigate } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ChevronRight } from "lucide-react"
import { Button, FileUploadField } from "@roja/ui"
import { toast } from "sonner"
import { isFieldVisible, getFieldLabel, isFieldRequired, isGroupAllInvisible } from "@roja/utils"
import { NoNeedDataDisclaimer } from "../no-need-data-disclaimer"

export const AttachmentStepContent = ({ onPrev }: { onPrev: () => void }): JSX.Element => {
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const sessionId = useWizardStore((s) => s.sessionId) || ""
	const login = useAuthStore((s) => s.login)
	const clearSession = useWizardStore((s) => s.clearSession)

	const { data: landingData } = useQuery({
		queryKey: ["landingInfo"],
		queryFn: () => psbApi.getLanding(),
	})
	const formSettings = landingData?.formSettings
	const isAllInvisible = isGroupAllInvisible(formSettings, "attachment data")

	const dynamicSchema = useMemo(() => createAttachmentSchema(formSettings), [formSettings])

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
		resolver: zodResolver(dynamicSchema) as unknown as import("react-hook-form").Resolver<AttachmentInput>,
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

	const onFormError = (formErrors: Record<string, any>): void => {
		console.error("Form Validation Errors (Attachment):", formErrors)
		toast.error("Mohon unggah semua dokumen berkas wajib yang belum diunggah.")
	}

	if (isLoading) {
		return <div className="text-center py-10 text-xs">Memuat data...</div>
	}

	return (
		<form onSubmit={handleSubmit(onSubmit, onFormError)} className="flex flex-col gap-8">
			{isAllInvisible && <NoNeedDataDisclaimer />}
			{/* Section A: Unggah Berkas */}
			<div>
				<div className="border-l-4 border-l-[var(--primary)] pl-4 py-1 mb-6">
					<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">Unggah Berkas & Lampiran</div>
				</div>
				<p className="text-xs text-[var(--body-txt-inverse)] mb-6">
					Silakan unggah berkas foto/dokumen dalam format .JPG, .JPEG, atau .PNG dengan ukuran maksimal 5MB.
				</p>

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
