import type { JSX } from "react"

export const InfoCircleIcon = ({ className }: { className?: string }): JSX.Element => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		aria-hidden="true"
		className={className}
	>
		<rect width="24" height="24" fill="none" />
		<circle cx="10" cy="10" r="10" transform="translate(2 2)" fill="#ffa800" opacity="0.3" />
		<path
			d="M12,16a1,1,0,1,1-1,1A1,1,0,0,1,12,16Zm-1.409-1.132V13.209h1.26A2.71,2.71,0,0,0,14.6,10.4a2.71,2.71,0,0,0-2.751-2.814A2.681,2.681,0,0,0,9.121,10.4H7.336a4.433,4.433,0,0,1,4.515-4.473,4.473,4.473,0,1,1,0,8.946Z"
			fill="#ffa800"
			fillRule="evenodd"
		/>
	</svg>
)

export const CalendarIcon = ({ className }: { className?: string }): JSX.Element => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		aria-hidden="true"
		className={className}
	>
		<g opacity="0.5">
			<rect width="24" height="24" fill="#abb4be" opacity="0" />
			<path
				d="M18,4H17V3a1,1,0,0,0-2,0V4H9V3A1,1,0,0,0,7,3V4H6A3,3,0,0,0,3,7V19a3,3,0,0,0,3,3H18a3,3,0,0,0,3-3V7a3,3,0,0,0-3-3ZM6,6H7V7A1,1,0,0,0,9,7V6h6V7a1,1,0,0,0,2,0V6h1a1,1,0,0,1,1,1v4H5V7A1,1,0,0,1,6,6ZM18,20H6a1,1,0,0,1-1-1V13H19v6A1,1,0,0,1,18,20Z"
				fill="#abb4be"
			/>
			<circle cx="1" cy="1" r="1" transform="translate(7 15)" fill="#abb4be" />
			<path d="M16,15H12a1,1,0,0,0,0,2h4a1,1,0,0,0,0-2Z" fill="#abb4be" />
		</g>
	</svg>
)

export const SaveIcon = ({ className }: { className?: string }): JSX.Element => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		aria-hidden="true"
		className={className}
	>
		<rect width="24" height="24" fill="#e4007e" opacity="0" />
		<path
			d="M20.12,8.71,15.29,3.88A3,3,0,0,0,13.17,3H6A3,3,0,0,0,3,6V18a3,3,0,0,0,3,3H18a3,3,0,0,0,3-3V10.83a3,3,0,0,0-.88-2.12ZM10,19V17h4v2Zm9-1a1,1,0,0,1-1,1H16V16a1,1,0,0,0-1-1H9a1,1,0,0,0-1,1v3H6a1,1,0,0,1-1-1V6A1,1,0,0,1,6,5H8v5a1,1,0,0,0,1,1h4a1,1,0,0,0,0-2H10V5h3.17a1.05,1.05,0,0,1,.71.29l4.83,4.83a1,1,0,0,1,.29.71Z"
			fill="#e4007e"
		/>
	</svg>
)

export const BackArrowIcon = ({ className }: { className?: string }): JSX.Element => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		aria-hidden="true"
		className={className}
	>
		<path d="M0,0H24V24H0Z" fill="none" fillRule="evenodd" />
		<rect width="2" height="14" rx="1" transform="translate(5 13) rotate(-90)" fill="#6866e9" opacity="0.3" />
		<path
			d="M3.707,15.707a1,1,0,0,1-1.414-1.414l6-6a1,1,0,0,1,1.383-.03l6,5.5a1,1,0,1,1-1.351,1.474L9.03,10.384Z"
			transform="translate(-3 21) rotate(-90)"
			fill="#6866e9"
		/>
	</svg>
)

// STUDENT_COST_ACTION_CLASS whitens the rect and the last path on hover, so keep this element order
export const ChevronActionIcon = ({ className }: { className?: string }): JSX.Element => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		aria-hidden="true"
		className={className}
	>
		<path d="M24,0H0V24H24Z" fill="none" fillRule="evenodd" />
		<rect
			width="2"
			height="13.961"
			rx="1"
			transform="translate(5.039 13) rotate(-90)"
			fill="#e4007e"
			opacity="0.3"
		/>
		<path
			d="M1.707.293A1,1,0,0,0,.293,1.71l6,6.01a1,1,0,0,0,1.383.03l6-5.509A1,1,0,0,0,12.324.764L7.03,5.625Z"
			transform="translate(10.991 19) rotate(-90)"
			fill="#e4007e"
		/>
	</svg>
)
