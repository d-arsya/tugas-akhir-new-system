import { useEffect } from "react"

import { legacyNotify } from "@/components/legacy/legacy-notify"
import { SYSTEM_ERROR } from "@/lib/legacy-errors"

export const useLegacyLoadError = (isError: boolean): void => {
	useEffect(() => {
		if (isError) legacyNotify.error(SYSTEM_ERROR)
	}, [isError])
}
