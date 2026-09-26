import type { JSX } from "react"

export const ACTION_PILL_CLASS =
	"group inline-block rounded-[7px] bg-[#fae3f0] p-[7px] align-middle transition-all duration-300 hover:bg-[#e4007e] hover:shadow-[0px_8px_10px_0px_rgba(var(--primary-rgb),0.25)] [&:hover_rect+rect]:fill-white [&:hover_path]:fill-white"

export const StudentBillsIcon = (): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
		<rect width="24" height="24" fill="none" />
		<rect width="16" height="3" rx="1.5" transform="translate(4 5)" fill="#e4007e" />
		<path
			d="M5.5,15h13a1.5,1.5,0,0,1,0,3H5.5a1.5,1.5,0,0,1,0-3Zm0-5h13a1.5,1.5,0,0,1,0,3H5.5a1.5,1.5,0,0,1,0-3Z"
			fill="#e4007e"
			fillRule="evenodd"
			opacity="0.3"
		/>
	</svg>
)

export const EyeOffIcon = ({ fill }: { fill: string }): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
		<g opacity="0.8">
			<rect width="24" height="24" fill="#28af52" opacity="0" />
			<path
				d="M4.71,3.29A1,1,0,1,0,3.29,4.71l5.63,5.63a3.5,3.5,0,0,0,4.74,4.74l5.63,5.63a1,1,0,1,0,1.42-1.42ZM12,13.5A1.5,1.5,0,0,1,10.5,12v-.07l1.56,1.56Z"
				fill={fill}
			/>
			<path
				d="M12.22,17c-4.3.1-7.12-3.59-8-5A13.7,13.7,0,0,1,6.46,9.28L5,7.87A15.89,15.89,0,0,0,2.13,11.5a1,1,0,0,0,0,1c.63,1.09,4,6.5,9.89,6.5h.25a9.48,9.48,0,0,0,3.23-.67l-1.58-1.58a7.74,7.74,0,0,1-1.7.25Z"
				fill={fill}
			/>
			<path
				d="M21.87,11.5C21.23,10.39,17.7,4.82,11.73,5a9.48,9.48,0,0,0-3.23.67l1.58,1.58A7.74,7.74,0,0,1,11.78,7c4.29-.11,7.11,3.59,8,5a13.7,13.7,0,0,1-2.29,2.72L19,16.13a15.89,15.89,0,0,0,2.91-3.63,1,1,0,0,0-.04-1Z"
				fill={fill}
			/>
		</g>
	</svg>
)

export const EyeOnIcon = (): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
		<g>
			<rect width="24" height="24" fill="#fff" opacity="0" />
			<path
				d="M21.87,11.5c-.64-1.11-4.16-6.68-10.14-6.5C6.2,5.14,3,10,2.13,11.5a1,1,0,0,0,0,1c.63,1.09,4,6.5,9.89,6.5h.25c5.53-.14,8.74-5,9.6-6.5A1,1,0,0,0,21.87,11.5ZM12.22,17c-4.31.1-7.12-3.59-8-5,1-1.61,3.61-4.9,7.61-5,4.29-.11,7.11,3.59,8,5-1.03,1.61-3.61,4.9-7.61,5Z"
				fill="#fff"
			/>
			<path
				d="M12,8.5A3.5,3.5,0,1,0,15.5,12,3.5,3.5,0,0,0,12,8.5Zm0,5A1.5,1.5,0,1,1,13.5,12,1.5,1.5,0,0,1,12,13.5Z"
				fill="#fff"
			/>
		</g>
	</svg>
)
