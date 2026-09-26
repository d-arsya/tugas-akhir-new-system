import { useEffect, useMemo } from "react"
import { useNavigate } from "@tanstack/react-router"

import { legacyNotify } from "@/components/legacy/legacy-notify"
import { legacyErrors } from "@/lib/legacy-errors"

export const useStudentGradeIds = (students: string | undefined): number[] =>
	useMemo(
		() =>
			(students ?? "")
				.split(",")
				.map((part) => Number(part.trim()))
				.filter((id) => Number.isInteger(id) && id > 0),
		[students],
	)

export const useRejectedSelection = (error: unknown, backTo: string): void => {
	const navigate = useNavigate()
	useEffect(() => {
		if (error === null || error === undefined) return
		legacyNotify.error(legacyErrors(error))
		void navigate({ to: backTo, replace: true })
	}, [error, backTo, navigate])
}
