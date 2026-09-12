import type { JSX } from "react"
import type { Control, UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form"
import type { FamilyInput } from "@/schemas/register.schema"
import { FatherDataFields } from "./FatherDataFields"
import { MotherDataFields } from "./MotherDataFields"
import { FamilyAddressFields } from "./FamilyAddressFields"

export interface FamilyFormSectionsProps {
	control: Control<FamilyInput>
	register: UseFormRegister<FamilyInput>
	errors: FieldErrors<FamilyInput>
	setValue: UseFormSetValue<FamilyInput>
	watch: UseFormWatch<FamilyInput>
	formSettings?: any
}

export const FamilyFormSections = ({
	control,
	register,
	errors,
	setValue,
	watch,
	formSettings,
}: FamilyFormSectionsProps): JSX.Element => {
	return (
		<>
			<FatherDataFields control={control} register={register} errors={errors} formSettings={formSettings} />
			<MotherDataFields control={control} register={register} errors={errors} formSettings={formSettings} />
			<FamilyAddressFields register={register} errors={errors} setValue={setValue} watch={watch} formSettings={formSettings} />
		</>
	)
}

export default FamilyFormSections
