import type { JSX } from "react"
import type { Control, UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form"
import type { PersonalInput } from "@/schemas/register.schema"
import { StudentPersonalFields } from "./StudentPersonalFields"
import { StudentAddressFields } from "./StudentAddressFields"
import { PreviousSchoolFields } from "./PreviousSchoolFields"

export interface PersonalFormSectionsProps {
	control: Control<PersonalInput>
	register: UseFormRegister<PersonalInput>
	errors: FieldErrors<PersonalInput>
	setValue: UseFormSetValue<PersonalInput>
	watch: UseFormWatch<PersonalInput>
	formSettings?: any
}

export const PersonalFormSections = ({
	control,
	register,
	errors,
	setValue,
	watch,
	formSettings,
}: PersonalFormSectionsProps): JSX.Element => {
	return (
		<>
			<StudentPersonalFields control={control} register={register} errors={errors} formSettings={formSettings} />
			<StudentAddressFields register={register} errors={errors} setValue={setValue} watch={watch} formSettings={formSettings} />
			<PreviousSchoolFields register={register} errors={errors} setValue={setValue} watch={watch} formSettings={formSettings} />
		</>
	)
}

export default PersonalFormSections
