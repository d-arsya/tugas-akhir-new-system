import type { JSX } from "react"
import { LocationSelect as BaseLocationSelect, type LocationSelectProps as BaseLocationSelectProps } from "@roja/ui"
import { sharedApi } from "@/lib/api"
import type { FieldValues } from "react-hook-form"

export type LocationSelectProps<TFieldValues extends FieldValues> = Omit<BaseLocationSelectProps<TFieldValues>, "api"> & {
	api?: typeof sharedApi
}

export const LocationSelect = <TFieldValues extends FieldValues>(
	props: LocationSelectProps<TFieldValues>,
): JSX.Element => {
	return <BaseLocationSelect api={sharedApi} {...props} />
}

export default LocationSelect
