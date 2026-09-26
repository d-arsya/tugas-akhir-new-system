import { useState, type JSX } from "react"

import { getSocietyField } from "@roja/utils"

import { FieldError, SocietyFrame, SocietyRadios, SocietyText } from "./society-controls"
import { radioShown } from "./society-field"
import { valueOf, type SocietyFieldContext } from "./society-field-context"

// Setting 32 — `reading` (Jilid / Baca Al-Qur'an) with `div#toHide-1.toHide > input#jilid_chapter`.
// The box starts visible only when the stored value is `jilid`; `edit-general.js` / `create-general.js`
// then hide it on `quran` and show it on anything else.

const SocietyReadingField = ({ ctx }: { ctx: SocietyFieldContext }): JSX.Element | null => {
	const field = getSocietyField(32)
	const [shown, setShown] = useState(() => valueOf(ctx, "reading") === "jilid")
	if (field === undefined) return null

	return (
		<SocietyFrame layout={ctx.layout} htmlFor="reading" label={ctx.lookup.label(32)} info={ctx.lookup.info(32)}>
			{/* `div.mt-1.pb-2` on the edit tab, `div.mt-2.pb-2` in the wizard */}
			<SocietyRadios
				name="reading"
				value={radioShown(field, valueOf(ctx, "reading"))}
				options={(field.options ?? []).map((option) => ({ ...option, id: option.value }))}
				onChange={(value) => {
					ctx.set("reading", value)
					setShown(value !== "quran")
				}}
				disabled={ctx.disabled}
				className={ctx.layout === "horizontal" ? "pb-[8px]" : "mt-[4px] pb-[8px]"}
			/>
			<FieldError message={ctx.errors.reading} />
			<div id="toHide-1" hidden={!shown}>
				<SocietyText
					name="jilid_chapter"
					value={valueOf(ctx, "jilid_chapter")}
					onChange={(value) => ctx.set("jilid_chapter", value)}
					placeholder={field.placeholders?.jilid_chapter ?? ""}
					disabled={ctx.disabled}
					invalid={ctx.errors.jilid_chapter !== undefined}
				/>
				<FieldError message={ctx.errors.jilid_chapter} />
			</div>
		</SocietyFrame>
	)
}

export default SocietyReadingField
