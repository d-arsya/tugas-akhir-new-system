import { useMutation, type UseMutationResult } from "@tanstack/react-query"

import type {
	AdminMessageResult,
	AdminRegistrantCreateResult,
	AdminRegistrantExportStatus,
	AdminRegistrantStatusDto,
	SocietyDraft,
	SocietyDraftStepKey,
} from "@roja/types"

import { legacyNotify } from "@/components/legacy/legacy-notify"
import { useLegacySubmit, type LegacySubmit } from "@/hooks/use-legacy-submit"
import { useInvalidateAkademik } from "@/hooks/use-registrants"
import { adminApi } from "@/lib/api"
import { saveBlob } from "@/lib/download"
import { legacyErrors, SYSTEM_ERROR } from "@/lib/legacy-errors"

const EXPORT_FILE = "Data PSB.xlsx"

export const useUpdateRegistrant = (registrantId: number, onSaved: () => void): LegacySubmit<FormData, AdminMessageResult> => {
	const invalidate = useInvalidateAkademik()
	return useLegacySubmit({
		mutationFn: (form: FormData) => adminApi.updateRegistrant(registrantId, form),
		errorTitle: "Gagal!",
		onDone: () => {
			onSaved()
			void invalidate()
		},
	})
}

export const useUpdateRegistrantStatus = (
	registrantId: number,
	onSaved: () => void,
): LegacySubmit<AdminRegistrantStatusDto, AdminMessageResult> => {
	const invalidate = useInvalidateAkademik()
	return useLegacySubmit({
		mutationFn: (data: AdminRegistrantStatusDto) => adminApi.updateRegistrantStatus(registrantId, data),
		errorTitle: "Gagal!",
		onDone: () => {
			onSaved()
			void invalidate()
		},
	})
}

export const useDeleteRegistrant = (onDeleted: () => void): UseMutationResult<AdminMessageResult, unknown, number> => {
	const invalidate = useInvalidateAkademik()
	return useMutation({
		mutationFn: (registrantId: number) => adminApi.deleteRegistrant(registrantId),
		onSuccess: (result) => {
			legacyNotify.success(result.message)
			void invalidate()
			window.setTimeout(onDeleted, 500)
		},
		onError: (error) => legacyNotify.error(legacyErrors(error)),
	})
}

export const useDownloadRegistrants = (academicYearId: number): UseMutationResult<void, unknown, AdminRegistrantExportStatus> =>
	useMutation<void, unknown, AdminRegistrantExportStatus>({
		mutationFn: async (status) => {
			const { blob, fileName } = await adminApi.downloadRegistrants(academicYearId, status)
			saveBlob(blob, fileName ?? EXPORT_FILE)
		},
		onError: () => legacyNotify.error(SYSTEM_ERROR),
	})

export const useValidateRegistrantStep = (): UseMutationResult<AdminMessageResult, unknown, { step: SocietyDraftStepKey; draft: SocietyDraft }> =>
	useMutation({
		mutationFn: ({ step, draft }: { step: SocietyDraftStepKey; draft: SocietyDraft }) => adminApi.validateRegistrantStep(step, draft),
	})

export const useCreateRegistrant = (): UseMutationResult<AdminRegistrantCreateResult, unknown, FormData> =>
	useMutation({ mutationFn: (form: FormData) => adminApi.createRegistrant(form) })
