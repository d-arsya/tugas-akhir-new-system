import type { JSX } from "react"
import type { Control, UseFormRegister, FieldErrors, UseFieldArrayRemove } from "react-hook-form"
import type { IdentityInput } from "@/schemas/register.schema"
import { IdentityNumbersFields } from "./IdentityNumbersFields"
import { HealthDataFields } from "./HealthDataFields"
import { AchievementAndTalentFields } from "./AchievementAndTalentFields"

export interface IdentityFormSectionsProps {
	control: Control<IdentityInput>
	register: UseFormRegister<IdentityInput>
	errors: FieldErrors<IdentityInput>
	fields: Record<string, any>[]
	append: (val: { name: string; status: string }) => void
	remove: UseFieldArrayRemove
	watchReading?: string
	formSettings?: any
}

export const IdentityFormSections = ({
	control,
	register,
	errors,
	fields,
	append,
	remove,
	watchReading,
	formSettings,
}: IdentityFormSectionsProps): JSX.Element => {
	return (
		<>
			<IdentityNumbersFields register={register} errors={errors} formSettings={formSettings} />
			<HealthDataFields
				control={control}
				register={register}
				errors={errors}
				fields={fields}
				append={append}
				remove={remove}
				formSettings={formSettings}
			/>
			<AchievementAndTalentFields
				register={register}
				errors={errors}
				watchReading={watchReading}
				formSettings={formSettings}
			/>
		</>
	)
}

export default IdentityFormSections
