import type { SocietyFieldErrors, SocietyValues } from "@roja/types"

import type { SocietyLayout } from "./society-controls"
import type { SocietySettingLookup } from "./society-settings"

/** What every field renderer of `SocietyFormSection` receives. */
export type SocietyFieldContext = {
	layout: SocietyLayout
	lookup: SocietySettingLookup
	values: SocietyValues
	set: (name: string, value: string) => void
	errors: SocietyFieldErrors
	/** `{{ !$registrant->registered_by_admin ? 'disabled' : '' }}` on every input. */
	disabled: boolean
}

export const valueOf = (ctx: SocietyFieldContext, name: string): string => ctx.values[name] ?? ""
