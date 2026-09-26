import { useEffect, useState, type JSX } from "react"

import LegacyConfirmDelete from "@/components/legacy/legacy-confirm-delete"
import { useDeleteAlumni, useDeleteAlumniYear } from "@/hooks/use-alumni"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"

// OWNER: AK-A. `default-delete.js` + `include/modal-delete.blade.php` for the Alumni lists: `deleteData()` opens
// `#modalDelete`; "Ya, hapus" spins, then a notice and the popup closes 1000 ms later — on success and, as the
// legacy `fail` handler does too, on failure.

export type AlumniDeleteTarget = { kind: "year"; year: number } | { kind: "alumni"; id: number }

const CLOSE_AFTER_MS = 1000

export const useAlumniDelete = (): { ask: (target: AlumniDeleteTarget) => void; modal: JSX.Element } => {
	const [pending, setPending] = useState<AlumniDeleteTarget | null>(null)
	const deleteYear = useDeleteAlumniYear()
	const deleteAlumni = useDeleteAlumni()

	const remove = useLegacySubmit({
		mutationFn: (target: AlumniDeleteTarget) =>
			target.kind === "year" ? deleteYear.mutateAsync(target.year) : deleteAlumni.mutateAsync(target.id),
		onDone: () => setPending(null),
	})

	const failed = remove.mutation.isError
	useEffect(() => {
		if (!failed) return undefined
		const timer = window.setTimeout(() => setPending(null), CLOSE_AFTER_MS)
		return () => window.clearTimeout(timer)
	}, [failed])

	const modal = (
		<LegacyConfirmDelete
			open={pending !== null}
			onCancel={() => setPending(null)}
			onConfirm={() => {
				if (pending) remove.submit(pending)
			}}
			loading={remove.submitting}
		/>
	)

	return {
		ask: (target) => {
			remove.mutation.reset()
			setPending(target)
		},
		modal,
	}
}
