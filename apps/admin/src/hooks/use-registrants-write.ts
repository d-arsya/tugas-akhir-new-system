import { useMutation, type UseMutationResult } from "@tanstack/react-query"

import type { AdminMessageResult, AdminRegistrantStatusDto } from "@roja/types"

import { legacyNotify } from "@/components/legacy/legacy-notify"
import { useLegacySubmit, type LegacySubmit } from "@/hooks/use-legacy-submit"
import { useInvalidateAkademik } from "@/hooks/use-registrants"
import { adminApi } from "@/lib/api"
import { legacyErrors } from "@/lib/legacy-errors"

// Akademik → PSB writes. Each one invalidates `akademikKeys.all` where legacy reloaded the page.

/**
 * `update.js` `specificFormWithFile` — the edit page's Simpan: PNotify, then `location.reload()`
 * 1000 ms later (here: refetch). The failure title is `<strong>Gagal!</strong>`.
 */
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

/** `custom-ajax.js` `specificForm` — the status modals; the page reloads 1000 ms after the notice. */
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

/**
 * `registrant/delete.js` `deleteData`: the answer's message as a success notice (legacy answers 200 even
 * when the delete failed), the lists reload, and the modal closes 500 ms later.
 */
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
