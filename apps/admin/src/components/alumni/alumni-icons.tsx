import type { JSX } from "react"

export const BackArrowIcon = ({ hoverWhite = false }: { hoverWhite?: boolean }): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
		<path d="M0,0H24V24H0Z" fill="none" fillRule="evenodd" {...(hoverWhite ? { className: "tbr-except" } : {})} />
		<rect
			width="2"
			height="14"
			rx="1"
			transform="translate(5 13) rotate(-90)"
			fill="#6866e9"
			opacity="0.3"
			{...(hoverWhite ? { className: "tbr-white" } : {})}
		/>
		<path
			d="M3.707,15.707a1,1,0,0,1-1.414-1.414l6-6a1,1,0,0,1,1.383-.03l6,5.5a1,1,0,1,1-1.351,1.474L9.03,10.384Z"
			transform="translate(-3 21) rotate(-90)"
			fill="#6866e9"
		/>
	</svg>
)

export const ExportIcon = (): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
		<rect width="24" height="24" fill="none" />
		<path
			d="M17,8a1,1,0,0,1,0-2h1a4,4,0,0,1,4,4v8a4,4,0,0,1-4,4H6a4,4,0,0,1-4-4V9.993a4,4,0,0,1,4-4H7a1,1,0,0,1,0,2H6a2,2,0,0,0-2,2V18a2,2,0,0,0,2,2H18a2,2,0,0,0,2-2V10a2,2,0,0,0-2-2Z"
			fill="#fff"
			opacity="0.3"
		/>
		<rect width="2" height="12" rx="1" transform="translate(13 14) rotate(180)" fill="#fff" opacity="0.3" />
		<path
			d="M12-2.586,14.293-.293a1,1,0,0,0,1.414,0,1,1,0,0,0,0-1.414l-3-3a1,1,0,0,0-1.414,0l-3,3a1,1,0,0,0,0,1.414,1,1,0,0,0,1.414,0Z"
			transform="translate(0 5)"
			fill="#fff"
		/>
	</svg>
)

export const PrintIcon = (): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
		<rect width="24" height="24" fill="none" />
		<path
			d="M16,17v4a1,1,0,0,1-1,1H9a1,1,0,0,1-1-1V17H5a2,2,0,0,1-2-2V8A2,2,0,0,1,5,6H19a2,2,0,0,1,2,2v7a2,2,0,0,1-2,2Zm1.5-6A1.5,1.5,0,1,0,16,9.5,1.5,1.5,0,0,0,17.5,11ZM10,14v6h4V14Z"
			fill="#f8374b"
			fillRule="evenodd"
		/>
		<rect className="tbr-white" width="8" height="2" rx="1" transform="translate(8 2)" fill="#f8374b" opacity="0.3" />
	</svg>
)
