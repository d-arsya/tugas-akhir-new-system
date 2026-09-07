import type { JSX } from "react"
import { RojaStatusCard, type RojaStatusCardProps } from "@roja/ui"

export interface RegistrantStatusCardProps extends RojaStatusCardProps {}

export const RegistrantStatusCard = (props: RegistrantStatusCardProps): JSX.Element => {
	return <RojaStatusCard {...props} />
}

export default RegistrantStatusCard
